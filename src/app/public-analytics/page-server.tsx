import { createClient } from "../../../supabase/server";
import PublicAnalyticsClient from "./public-analytics-client";

export default async function PublicAnalyticsPageServer() {
  const supabase = await createClient();

  // Fetch all mosques for the filter
  const { data: mosques } = await supabase
    .from("mosques")
    .select("id, name")
    .order("name");

  // Fetch analytics data from all mosques
  const { data: collections, error: collectionsError } = await supabase
    .from("zakat_collections")
    .select(
      "amount, type, collection_date, mosque_id, product_type_id, product_types(name, price), mosques(name)",
    );

  const { data: distributions, error: distributionsError } = await supabase
    .from("zakat_distributions")
    .select("amount, type, distribution_date, mosque_id, mosques(name)");

  // Get total beneficiaries and givers count
  const { count: beneficiariesCount } = await supabase
    .from("beneficiaries")
    .select("*", { count: "exact", head: true });

  const { count: giversCount } = await supabase
    .from("givers")
    .select("*", { count: "exact", head: true });

  // Calculate totals
  const totalCollected =
    collections?.reduce((sum, item) => {
      // For in-kind donations, calculate based on product type and quantity
      if (
        item.type === "in_kind" &&
        item.product_type_id &&
        item.product_types?.price
      ) {
        // Get the product price and calculate the approximate value
        return sum + (item.amount || 0) * item.product_types.price;
      } else {
        // For cash donations, use the amount directly
        return sum + (item.amount || 0);
      }
    }, 0) || 0;

  // Total distributed is directly from the zakat_distributions table
  const totalDistributed =
    distributions?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

  // Current balance is the difference between collected and distributed
  const balance = totalCollected - totalDistributed;

  // Process data for monthly trends
  const monthlyData = processMonthlyData(
    collections || [],
    distributions || [],
  );

  // Process mosque data for pie chart
  const mosqueTotals = {};
  collections?.forEach((collection) => {
    const mosqueName = collection.mosques?.name || "Unknown Mosque";
    if (!mosqueTotals[mosqueName]) {
      mosqueTotals[mosqueName] = 0;
    }

    // For in-kind donations, calculate based on product type and quantity
    if (
      collection.type === "in_kind" &&
      collection.product_type_id &&
      collection.product_types?.price
    ) {
      mosqueTotals[mosqueName] +=
        (collection.amount || 0) * collection.product_types.price;
    } else {
      mosqueTotals[mosqueName] += collection.amount || 0;
    }
  });

  // Calculate percentages for pie chart
  const totalAmount = Object.values(mosqueTotals).reduce(
    (sum: any, amount: any) => sum + amount,
    0,
  ) as number;

  // Define colors for the pie chart
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#8dd1e1",
  ];

  const mosqueDistribution = Object.entries(mosqueTotals).map(
    ([name, amount], index) => ({
      name,
      value: Math.round(((amount as number) / totalAmount) * 100),
      color: COLORS[index % COLORS.length],
    }),
  );

  return (
    <PublicAnalyticsClient
      totalCollected={totalCollected}
      totalDistributed={totalDistributed}
      balance={balance}
      monthlyData={monthlyData}
      mosqueDistribution={mosqueDistribution}
      beneficiariesCount={beneficiariesCount || 0}
      giversCount={giversCount || 0}
      mosques={mosques || []}
    />
  );
}

// Helper function to process data for daily trends
function processMonthlyData(collections, distributions) {
  const dailyCollections = {};
  const dailyDistributions = {};

  // Process collections
  collections.forEach((item) => {
    if (!item.collection_date) return;
    const date = new Date(item.collection_date);
    const dayKey = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD

    if (!dailyCollections[dayKey]) {
      dailyCollections[dayKey] = 0;
    }

    // For in-kind donations, calculate based on product type and quantity
    if (
      item.type === "in_kind" &&
      item.product_type_id &&
      item.product_types?.price
    ) {
      dailyCollections[dayKey] += (item.amount || 0) * item.product_types.price;
    } else {
      dailyCollections[dayKey] += item.amount || 0;
    }
  });

  // Process distributions
  distributions.forEach((item) => {
    if (!item.distribution_date) return;
    const date = new Date(item.distribution_date);
    const dayKey = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD

    if (!dailyDistributions[dayKey]) {
      dailyDistributions[dayKey] = 0;
    }
    dailyDistributions[dayKey] += item.amount || 0;
  });

  // Combine data
  const days = new Set([
    ...Object.keys(dailyCollections),
    ...Object.keys(dailyDistributions),
  ]);

  // Generate sample data if no real data exists
  if (days.size === 0) {
    return generateSampleData();
  }

  // Get the last 30 days of data
  return Array.from(days)
    .sort() // Sort dates in ascending order
    .slice(-30) // Get only the last 30 days
    .map((day) => {
      // Format the date for display (e.g., "Jan 15")
      const date = new Date(day);
      const formattedDay = `${date.toLocaleString("default", { month: "short" })} ${date.getDate()}`;

      return {
        month: formattedDay, // Keep the property name as 'month' for compatibility
        collections: dailyCollections[day] || 0,
        distributions: dailyDistributions[day] || 0,
      };
    });
}

// Generate sample data for demonstration
function generateSampleData() {
  const data = [];

  // Generate data for the last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const formattedDay = `${date.toLocaleString("default", { month: "short" })} ${date.getDate()}`;

    data.push({
      month: formattedDay,
      collections: Math.floor(Math.random() * 5000) + 1000,
      distributions: Math.floor(Math.random() * 4000) + 500,
    });
  }

  return data;
}
