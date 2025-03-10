import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import AnalyticsPage from "./page";

export default async function AnalyticsPageServer() {
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
    .select("amount, type, collection_date");

  const { data: distributions, error: distributionsError } = await supabase
    .from("zakat_distributions")
    .select("amount, type, distribution_date");

  // Calculate totals
  const totalCollected =
    collections?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
  const totalDistributed =
    distributions?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
  const balance = totalCollected - totalDistributed;

  // Process data for monthly trends
  const monthlyData = processMonthlyData(
    collections || [],
    distributions || [],
  );

  return (
    <AnalyticsPage
      initialCollections={collections || []}
      initialDistributions={distributions || []}
      totalCollected={totalCollected}
      totalDistributed={totalDistributed}
      balance={balance}
      monthlyData={monthlyData}
    />
  );
}

// Helper function to process data for monthly trends
function processMonthlyData(collections, distributions) {
  const monthlyCollections = {};
  const monthlyDistributions = {};

  // Process collections
  collections.forEach((item) => {
    const date = new Date(item.collection_date);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

    if (!monthlyCollections[monthYear]) {
      monthlyCollections[monthYear] = 0;
    }
    monthlyCollections[monthYear] += item.amount || 0;
  });

  // Process distributions
  distributions.forEach((item) => {
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
