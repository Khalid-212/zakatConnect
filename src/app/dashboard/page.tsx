import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import { Button } from "@/components/ui/button";
import {
  Building2 as Mosque,
  Users,
  Coins,
  Package,
  RefreshCw,
  FileText,
  UserPlus,
  UsersRound,
  BarChart4,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/sidebar";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch data from database
  const { data: mosquesData, error: mosquesError } = await supabase
    .from("mosques")
    .select("id")
    .limit(1);

  const { data: usersData, error: usersError } = await supabase
    .from("users")
    .select("id");

  const { data: collectionsData, error: collectionsError } = await supabase
    .from("zakat_collections")
    .select("amount, type");

  const { data: recentActivity, error: activityError } = await supabase
    .from("zakat_collections")
    .select("amount, collection_date, description, givers(name)")
    .order("collection_date", { ascending: false })
    .limit(3);

  // Calculate totals
  const totalMosques = mosquesData?.length || 0;
  const registeredUsers = usersData?.length || 0;

  const cashCollections =
    collectionsData
      ?.filter((item) => item.type === "cash")
      .reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

  const inKindCollections =
    collectionsData
      ?.filter((item) => item.type === "in_kind")
      .reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

  // Format activity data
  const formattedActivity =
    recentActivity?.map((item) => {
      const collectionDate = new Date(item.collection_date);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - collectionDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        type: "Zakat payment received",
        amount: item.amount,
        currency: "ETB",
        from: item.givers?.name || "Anonymous",
        daysAgo: diffDays,
      };
    }) || [];

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header Section */}
          <header className="flex flex-col gap-1 mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, super-admin</p>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-muted-foreground">
                Role: Super Admin | Mosque ID: {mosquesData?.[0]?.id || "N/A"}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw size={14} />
                Refresh Data
              </Button>
            </div>
          </header>

          {/* Your Mosque Card */}
          <div className="bg-white rounded-lg border p-6 mb-8">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-gray-700">
                Your Mosque
              </h2>
              <Calendar className="text-primary" size={20} />
            </div>
            <div className="mt-6">
              <div className="text-6xl font-bold">{totalMosques}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-green-100 text-green-600 text-sm font-medium px-2 py-1 rounded-full">
                  +0%
                </span>
              </div>
              <div className="text-gray-500 mt-2">Active mosque</div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Registered Users */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex justify-between items-start mb-6">
                <span className="text-muted-foreground">Registered Users</span>
                <Users className="text-primary" size={20} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{registeredUsers}</span>
                <span className="text-green-500 text-sm">+0%</span>
              </div>
              <span className="text-sm text-muted-foreground mt-1">
                Total users
              </span>
            </div>

            {/* Zakat Collected */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex justify-between items-start mb-6">
                <span className="text-muted-foreground">Zakat Collected</span>
                <FileText className="text-primary" size={20} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  {cashCollections.toFixed(2)} ETB
                </span>
                <span className="text-green-500 text-sm">+0%</span>
              </div>
              <span className="text-sm text-muted-foreground mt-1">
                Total cash amount
              </span>
            </div>

            {/* In-kind Donations */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex justify-between items-start mb-6">
                <span className="text-muted-foreground">In-kind Donations</span>
                <Package className="text-primary" size={20} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  {inKindCollections.toFixed(2)} ETB
                </span>
                <span className="text-green-500 text-sm">+0%</span>
              </div>
              <span className="text-sm text-muted-foreground mt-1">
                Estimated value
              </span>
            </div>
          </div>

          {/* Recent Activity and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white rounded-lg border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Recent Activity</h2>
                <Button variant="ghost" size="sm" className="text-primary">
                  View all
                </Button>
              </div>
              <div className="space-y-6">
                {formattedActivity.length > 0 ? (
                  formattedActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 pb-6 border-b last:border-0 last:pb-0"
                    >
                      <div className="bg-blue-100 p-2 rounded-md">
                        <FileText size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{activity.type}</h3>
                        <p className="text-sm text-muted-foreground">
                          {activity.amount} {activity.currency} received from{" "}
                          {activity.from}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {activity.daysAgo} days ago
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity found
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
              <div className="space-y-4">
                {/* Register Beneficiary */}
                <Link
                  href="/beneficiaries/new"
                  className="block p-6 rounded-lg border hover:border-primary hover:shadow-sm transition-all"
                >
                  <div className="flex flex-col">
                    <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                      <UserPlus size={20} className="text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">
                      Register Beneficiary
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      Add a new zakat beneficiary to the system
                    </p>
                    <div className="text-primary text-sm font-medium">
                      Get started →
                    </div>
                  </div>
                </Link>

                {/* Register Giver */}
                <Link
                  href="/givers/new"
                  className="block p-6 rounded-lg border hover:border-primary hover:shadow-sm transition-all"
                >
                  <div className="flex flex-col">
                    <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                      <UsersRound size={20} className="text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">
                      Register Giver
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      Record a new donation or zakat payment
                    </p>
                    <div className="text-primary text-sm font-medium">
                      Get started →
                    </div>
                  </div>
                </Link>

                {/* Public Analytics */}
                <Link
                  href="/analytics"
                  className="block p-6 rounded-lg border bg-blue-50 hover:border-primary hover:shadow-sm transition-all"
                >
                  <div className="flex flex-col">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                      <BarChart4 size={20} className="text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">
                      Public Analytics
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      View analytics from all mosques
                    </p>
                    <div className="text-primary text-sm font-medium">
                      Explore →
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
