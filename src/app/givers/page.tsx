import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { UsersRound, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default async function GiversPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch givers from database
  const { data: givers, error } = await supabase
    .from("givers")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch total donations for each giver
  const giverIds = givers?.map((giver) => giver.id) || [];
  const { data: donations } = await supabase
    .from("zakat_collections")
    .select("giver_id, amount")
    .in("giver_id", giverIds);

  // Calculate total donations per giver
  const totalDonations = {};
  donations?.forEach((donation) => {
    if (donation.giver_id) {
      totalDonations[donation.giver_id] =
        (totalDonations[donation.giver_id] || 0) + donation.amount;
    }
  });

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Givers</h1>
              <p className="text-muted-foreground">
                Manage zakat givers and donors
              </p>
            </div>
            <Link href="/givers/new">
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Add Giver
              </Button>
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-lg border mb-6">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input placeholder="Search givers..." className="pl-10 w-full" />
            </div>
          </div>

          {/* Givers List */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="grid grid-cols-5 gap-4 p-4 font-medium text-sm text-gray-500 border-b">
              <div>Name</div>
              <div>Contact</div>
              <div>Address</div>
              <div>Total Donations</div>
              <div>Actions</div>
            </div>

            {givers && givers.length > 0 ? (
              givers.map((giver) => (
                <div
                  key={giver.id}
                  className="grid grid-cols-5 gap-4 p-4 border-b hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-md">
                      <UsersRound size={18} className="text-primary" />
                    </div>
                    <span className="font-medium">{giver.name}</span>
                  </div>
                  <div className="text-gray-600">
                    {giver.email || giver.phone || "N/A"}
                  </div>
                  <div className="text-gray-600">{giver.address || "N/A"}</div>
                  <div className="flex flex-col gap-1">
                    <span className="bg-blue-100 text-primary text-xs px-2 py-1 rounded-full">
                      {totalDonations[giver.id]?.toFixed(2) || "0"} ETB
                    </span>
                    {giver.code && (
                      <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                        Code: {giver.code}
                      </span>
                    )}
                  </div>
                  <div>
                    <Button variant="ghost" size="sm" className="text-primary">
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No givers found. Add a giver to get started.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
