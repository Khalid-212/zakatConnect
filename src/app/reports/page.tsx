import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { FileText, Download, Share } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function ReportsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch collections for report data
  const { data: collections, error } = await supabase
    .from("zakat_collections")
    .select("id, amount, collection_date, type, mosques(name)")
    .order("collection_date", { ascending: false })
    .limit(3);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="text-muted-foreground">
              Generate and download detailed reports
            </p>
          </div>

          {/* Report Generator */}
          <div className="bg-white rounded-lg border p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Report Generator</h2>
            <p className="text-muted-foreground mb-6">
              Configure and generate custom reports
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Report Type
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Zakat Collection" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="collection">Zakat Collection</SelectItem>
                    <SelectItem value="distribution">
                      Beneficiary Distribution
                    </SelectItem>
                    <SelectItem value="summary">Summary Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Date Range
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Current Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current_month">Current Month</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                    <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                    <SelectItem value="year_to_date">Year to Date</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Format</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Detailed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="summary">Summary</SelectItem>
                    <SelectItem value="charts">With Charts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button className="flex items-center gap-2">
                <FileText size={16} />
                Generate Report
              </Button>
            </div>
          </div>

          {/* Report Tabs */}
          <Tabs defaultValue="collection">
            <TabsList className="mb-6">
              <TabsTrigger value="collection">Zakat Collection</TabsTrigger>
              <TabsTrigger value="distribution">
                Beneficiary Distribution
              </TabsTrigger>
            </TabsList>

            <TabsContent value="collection">
              <div className="bg-white rounded-lg border overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                  <div className="relative w-64">
                    <Input placeholder="Search reports..." className="pl-3" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Download size={14} />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Download size={14} />
                      Excel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Share size={14} />
                      Share
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm font-medium text-gray-500 border-b">
                        <th className="p-4">ID</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Mosque</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collections && collections.length > 0 ? (
                        collections.map((collection) => (
                          <tr
                            key={collection.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="p-4 font-medium">
                              {collection.id.substring(0, 8)}
                            </td>
                            <td className="p-4 text-gray-600">
                              {new Date(
                                collection.collection_date,
                              ).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-gray-600">
                              {collection.mosques?.name || "Unknown Mosque"}
                            </td>
                            <td className="p-4">
                              <span className="bg-blue-100 text-primary text-xs px-2 py-1 rounded-full">
                                {collection.type === "cash"
                                  ? "Cash"
                                  : "In-kind"}
                              </span>
                            </td>
                            <td className="p-4 font-medium">
                              {collection.amount} ETB
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-8 text-center text-gray-500"
                          >
                            No collection data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t flex justify-between items-center text-sm text-gray-500">
                  <div>Showing {collections?.length || 0} entries</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm">
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="distribution">
              <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
                No distribution reports available yet.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
