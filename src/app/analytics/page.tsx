import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/client-server";
import AnalyticsClient from "./analytics-client";

export default async function AnalyticsPage() {
  // Check user authorization
  await checkUserAccess();

  async function checkUserAccess() {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return redirect("/sign-in");
    }

    // Get user role
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    // Only super-admin and admin roles can access analytics
    if (userData?.role !== "super-admin" && userData?.role !== "admin") {
      return redirect(
        "/dashboard?error=You do not have permission to access analytics",
      );
    }
  }
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch analytics data
  const { data: collections, error: collectionsError } = await supabase
    .from("zakat_collections")
    .select(
      "amount, type, collection_date, product_type_id, product_types(name, price)",
    );

  const { data: distributions, error: distributionsError } = await supabase
    .from("zakat_distributions")
    .select("amount, type, distribution_date");

  // Fetch approved beneficiaries (these count as distributions)
  const { data: approvedBeneficiaries, error: beneficiariesError } =
    await supabase
      .from("beneficiaries")
      .select("family_members, status")
      .eq("status", "approved");

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

  // Process product distribution for pie chart
  const productCounts = {};
  const productTotals = {};

  collections?.forEach((collection) => {
    const productName = collection.product_types?.name || "Other";
    if (!productCounts[productName]) {
      productCounts[productName] = 0;
      productTotals[productName] = 0;
    }
    productCounts[productName]++;

    // For in-kind donations, calculate based on product type and quantity
    if (collection.type === "in_kind" && collection.product_type_id) {
      // Get the product price and calculate the approximate value
      const productPrice = collection.product_types?.price || 0;
      // Assume amount represents kg or quantity of the product
      productTotals[productName] += (collection.amount || 0) * productPrice;
    } else {
      // For cash donations, use the amount directly
      productTotals[productName] += collection.amount || 0;
    }
  });

  // Calculate percentages for pie chart
  const totalAmount = Object.values(productTotals).reduce(
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
  ];

  const productDistribution = Object.entries(productTotals).map(
    ([name, amount], index) => ({
      name,
      value: Math.round(((amount as number) / totalAmount) * 100),
      color: COLORS[index % COLORS.length],
    }),
  );

  // Process data for monthly trends
  const monthlyData = processMonthlyData(
    collections || [],
    distributions || [],
  );

  return (
    <AnalyticsClient
      totalCollected={totalCollected}
      totalDistributed={totalDistributed}
      balance={balance}
      monthlyData={monthlyData}
      productDistribution={productDistribution}
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
