import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/client-server";
import AnalyticsClient from "./analytics-client";

export default async function AnalyticsPage() {
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
      "amount, type, collection_date, product_type_id, product_types(name)",
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
    collections?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

  // Include both direct distributions and approved beneficiaries in total distributed
  const directDistributed =
    distributions?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

  // Get wheat price for beneficiary calculations
  const { data: wheatProduct } = await supabase
    .from("product_types")
    .select("price")
    .eq("name", "Wheat")
    .single();

  const wheatPrice = wheatProduct?.price || 100; // Default price if not found

  // Calculate distributions to approved beneficiaries
  const beneficiaryDistributed =
    approvedBeneficiaries?.reduce(
      (sum, beneficiary) =>
        sum + (beneficiary.family_members || 1) * 2.5 * wheatPrice,
      0,
    ) || 0;

  const totalDistributed = directDistributed + beneficiaryDistributed;
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
    productTotals[productName] += collection.amount || 0;
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

// Helper function to process data for monthly trends
function processMonthlyData(collections, distributions) {
  const monthlyCollections = {};
  const monthlyDistributions = {};

  // Process collections
  collections.forEach((item) => {
    if (!item.collection_date) return;
    const date = new Date(item.collection_date);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

    if (!monthlyCollections[monthYear]) {
      monthlyCollections[monthYear] = 0;
    }
    monthlyCollections[monthYear] += item.amount || 0;
  });

  // Process distributions
  distributions.forEach((item) => {
    if (!item.distribution_date) return;
    const date = new Date(item.distribution_date);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

    if (!monthlyDistributions[monthYear]) {
      monthlyDistributions[monthYear] = 0;
    }
    monthlyDistributions[monthYear] += item.amount || 0;
  });

  // Combine data
  const months = new Set([
    ...Object.keys(monthlyCollections),
    ...Object.keys(monthlyDistributions),
  ]);

  // Generate sample data if no real data exists
  if (months.size === 0) {
    return generateSampleData();
  }

  return Array.from(months)
    .sort((a, b) => {
      const [monthA, yearA] = a.split("/").map(Number);
      const [monthB, yearB] = b.split("/").map(Number);
      return yearA !== yearB ? yearA - yearB : monthA - monthB;
    })
    .map((month) => ({
      month,
      collections: monthlyCollections[month] || 0,
      distributions: monthlyDistributions[month] || 0,
    }));
}

// Generate sample data for demonstration
function generateSampleData() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const data = [];

  // Generate data for the last 6 months
  for (let i = 5; i >= 0; i--) {
    let month = currentMonth - i;
    let year = currentYear;

    if (month <= 0) {
      month += 12;
      year -= 1;
    }

    data.push({
      month: `${month}/${year}`,
      collections: Math.floor(Math.random() * 50000) + 10000,
      distributions: Math.floor(Math.random() * 40000) + 5000,
    });
  }

  return data;
}
