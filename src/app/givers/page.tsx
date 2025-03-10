import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { UsersRound, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Add Giver
            </Button>
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
                  <div>
                    <span className="bg-blue-100 text-primary text-xs px-2 py-1 rounded-full">
                      0 ETB
                    </span>
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
