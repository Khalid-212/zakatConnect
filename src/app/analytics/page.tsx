// This file can be removed as we're using page-server.tsx instead

import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import AnalyticsClient from "./analytics-client";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get user role and associated mosque
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

  // Fetch all mosques for filtering
  const { data: mosques } = await supabase
    .from("mosques")
    .select("id, name")
    .order("name");

  // Get mosque admin's mosque if not super-admin
  let defaultMosqueId = null;
  if (userData?.role !== "super-admin") {
    const { data: mosqueAdmin } = await supabase
      .from("mosque_admins")
      .select("mosque_id")
      .eq("user_id", user.id)
      .single();
    defaultMosqueId = mosqueAdmin?.mosque_id;
  }

  // Fetch analytics data with product types and mosque information
  const collectionsQuery = supabase.from("zakat_collections").select(`
      amount, 
      type, 
      collection_date,
      mosque_id,
      product_type_id,
      product_types(name, price),
      mosques(name)
    `);

  // If not super-admin, filter by mosque
  if (defaultMosqueId) {
    collectionsQuery.eq("mosque_id", defaultMosqueId);
  }

  const { data: collections } = await collectionsQuery;

  const distributionsQuery = supabase
    .from("zakat_distributions")
    .select("amount, type, distribution_date, mosque_id");

  if (defaultMosqueId) {
    distributionsQuery.eq("mosque_id", defaultMosqueId);
  }

  const { data: distributions } = await distributionsQuery;

  // Get total beneficiaries and givers count
  const beneficiariesQuery = supabase
    .from("beneficiaries")
    .select("*", { count: "exact", head: true });

  const giversQuery = supabase
    .from("givers")
    .select("*", { count: "exact", head: true });

  if (defaultMosqueId) {
    beneficiariesQuery.eq("mosque_id", defaultMosqueId);
    giversQuery.eq("mosque_id", defaultMosqueId);
  }

  const [{ count: beneficiariesCount }, { count: giversCount }] =
    await Promise.all([beneficiariesQuery, giversQuery]);

  // Calculate totals
  const totalCollected =
    collections?.reduce((sum, item) => {
      if (
        item.type === "in_kind" &&
        item.product_type_id &&
        item.product_types?.[0]?.price
      ) {
        return sum + (item.amount || 0) * item.product_types[0].price;
      }
      return sum + (item.amount || 0);
    }, 0) || 0;

  const totalDistributed =
    distributions?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
  const balance = totalCollected - totalDistributed;

  // Process daily trends data
  const dailyData = processDailyData(collections || [], distributions || []);

  // Process product distribution data
  const productDistribution = processProductDistribution(collections || []);

  return (
    <AnalyticsClient
      totalCollected={totalCollected}
      totalDistributed={totalDistributed}
      balance={balance}
      monthlyData={dailyData}
      beneficiariesCount={beneficiariesCount || 0}
      giversCount={giversCount || 0}
      productDistribution={productDistribution}
      mosques={mosques || []}
      defaultMosqueId={defaultMosqueId}
      userRole={userData?.role}
    />
  );
}

interface Collection {
  collection_date?: string;
  distribution_date?: string;
  amount?: number;
  type?: string;
  mosque_id?: string;
  product_type_id?: string;
  product_types?: { name?: string; price?: number }[];
  mosques?: { name?: string }[];
}

interface Distribution {
  distribution_date?: string;
  amount?: number;
  mosque_id?: string;
}

function processDailyData(
  collections: Collection[],
  distributions: Distribution[]
) {
  const dailyCollections: { [key: string]: number } = {};
  const dailyDistributions: { [key: string]: number } = {};

  // Process collections with product values
  collections.forEach((item) => {
    if (!item.collection_date) return;
    const date = new Date(item.collection_date);
    const dayKey = date.toISOString().split("T")[0];

    if (!dailyCollections[dayKey]) {
      dailyCollections[dayKey] = 0;
    }

    if (
      item.type === "in_kind" &&
      item.product_type_id &&
      item.product_types?.[0]?.price
    ) {
      dailyCollections[dayKey] +=
        (item.amount || 0) * item.product_types[0].price;
    } else {
      dailyCollections[dayKey] += item.amount || 0;
    }
  });

  // Process distributions
  distributions.forEach((item) => {
    if (!item.distribution_date) return;
    const date = new Date(item.distribution_date);
    const dayKey = date.toISOString().split("T")[0];

    if (!dailyDistributions[dayKey]) {
      dailyDistributions[dayKey] = 0;
    }
    dailyDistributions[dayKey] += item.amount || 0;
  });

  // Get last 30 days
  const days = new Set([
    ...Object.keys(dailyCollections),
    ...Object.keys(dailyDistributions),
  ]);

  if (days.size === 0) return [];

  return Array.from(days)
    .sort()
    .slice(-30)
    .map((day) => {
      const date = new Date(day);
      const formattedDay = `${date.toLocaleString("default", { month: "short" })} ${date.getDate()}`;

      return {
        month: formattedDay,
        collections: dailyCollections[day] || 0,
        distributions: dailyDistributions[day] || 0,
      };
    });
}

function processProductDistribution(collections: Collection[]) {
  const productTotals: { [key: string]: number } = {};
  let totalValue = 0;

  // Calculate totals for each product type
  collections.forEach((item) => {
    if (
      item.type === "in_kind" &&
      item.product_type_id &&
      item.product_types?.[0]
    ) {
      const productName = item.product_types[0].name || "Unknown";
      const productValue =
        (item.amount || 0) * (item.product_types[0].price || 0);

      if (!productTotals[productName]) {
        productTotals[productName] = 0;
      }
      productTotals[productName] += productValue;
      totalValue += productValue;
    }
  });

  // Define colors for the pie chart
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  // Convert to percentage-based distribution
  return Object.entries(productTotals)
    .map(([name, value], index) => ({
      name,
      value: Math.round((value / totalValue) * 100),
      color: COLORS[index % COLORS.length],
    }))
    .sort((a, b) => b.value - a.value); // Sort by value descending
}
