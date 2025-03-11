import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import AnalyticsClient from "./analytics-client";

export default async function AnalyticsPageServer() {
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
      "/dashboard?error=You do not have permission to access analytics"
    );
  }

  // Fetch analytics data
  const { data: collections, error: collectionsError } = await supabase
    .from("zakat_collections")
    .select("amount, type, collection_date");

  const { data: distributions, error: distributionsError } = await supabase
    .from("zakat_distributions")
    .select("amount, type, distribution_date");

  // Get total beneficiaries and givers count
  const { count: beneficiariesCount } = await supabase
    .from("beneficiaries")
    .select("*", { count: "exact", head: true });

  const { count: giversCount } = await supabase
    .from("givers")
    .select("*", { count: "exact", head: true });

  // Calculate totals
  const totalCollected =
    collections?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
  const totalDistributed =
    distributions?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
  const balance = totalCollected - totalDistributed;

  // Process data for monthly trends
  const monthlyData = processMonthlyData(
    collections || [],
    distributions || []
  );

  return (
    <AnalyticsClient
      totalCollected={totalCollected}
      totalDistributed={totalDistributed}
      balance={balance}
      monthlyData={monthlyData}
      beneficiariesCount={beneficiariesCount || 0}
      giversCount={giversCount || 0}
      productDistribution={[]}
    />
  );
}

interface MonthlyData {
  collection_date?: string;
  distribution_date?: string;
  amount?: number;
  type?: string;
}

function processMonthlyData(
  collections: MonthlyData[],
  distributions: MonthlyData[]
) {
  const monthlyCollections: { [key: string]: number } = {};
  const monthlyDistributions: { [key: string]: number } = {};

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

  if (months.size === 0) {
    return [];
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
