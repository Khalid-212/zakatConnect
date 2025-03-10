import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { BarChart4, Calendar, Download, Filter } from "lucide-react";

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

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Analytics</h1>
              <p className="text-muted-foreground">
                View zakat collection and distribution analytics
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar size={16} />
                This Month
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download size={16} />
                Export
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Collected */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex justify-between items-start mb-6">
                <span className="text-muted-foreground">Total Collected</span>
                <div className="bg-green-100 p-1 rounded-md">
                  <BarChart4 className="text-green-600" size={18} />
                </div>
              </div>
              <div className="text-3xl font-bold">
                {totalCollected.toFixed(2)} ETB
              </div>
              <span className="text-sm text-muted-foreground mt-1">
                From all sources
              </span>
            </div>

            {/* Total Distributed */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex justify-between items-start mb-6">
                <span className="text-muted-foreground">Total Distributed</span>
                <div className="bg-blue-100 p-1 rounded-md">
                  <BarChart4 className="text-primary" size={18} />
                </div>
              </div>
              <div className="text-3xl font-bold">
                {totalDistributed.toFixed(2)} ETB
              </div>
              <span className="text-sm text-muted-foreground mt-1">
                To all beneficiaries
              </span>
            </div>

            {/* Current Balance */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex justify-between items-start mb-6">
                <span className="text-muted-foreground">Current Balance</span>
                <div className="bg-purple-100 p-1 rounded-md">
                  <BarChart4 className="text-purple-600" size={18} />
                </div>
              </div>
              <div className="text-3xl font-bold">{balance.toFixed(2)} ETB</div>
              <span className="text-sm text-muted-foreground mt-1">
                Available for distribution
              </span>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white rounded-lg border p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                Collection & Distribution Trends
              </h2>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Filter size={14} />
                Filter
              </Button>
            </div>
            <div className="h-80 flex items-center justify-center border rounded-lg bg-gray-50">
              <p className="text-muted-foreground">
                Chart visualization will be displayed here
              </p>
            </div>
          </div>

          {/* Distribution by Category */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">
              Distribution by Beneficiary Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-64 flex items-center justify-center border rounded-lg bg-gray-50">
                <p className="text-muted-foreground">
                  Pie chart will be displayed here
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Poor (Fuqara)</span>
                  </div>
                  <span className="font-medium">45%</span>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Needy (Masakeen)</span>
                  </div>
                  <span className="font-medium">30%</span>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>In Debt (Gharimeen)</span>
                  </div>
                  <span className="font-medium">15%</span>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span>Other Categories</span>
                  </div>
                  <span className="font-medium">10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
