import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Building2 as Mosque, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

import { checkUserAccess } from "../auth/check-access";

export default async function MosquesPage() {
  // Only super-admin and admin can access mosque management
  await checkUserAccess(["super-admin", "admin"]);

  const supabase = await createClient();

  // Fetch mosques from database
  const { data: mosques, error } = await supabase
    .from("mosques")
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
              <h1 className="text-3xl font-bold">Mosques</h1>
              <p className="text-muted-foreground">Manage registered mosques</p>
            </div>
            <Link href="/mosques/new">
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Add Mosque
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
              <Input placeholder="Search mosques..." className="pl-10 w-full" />
            </div>
          </div>

          {/* Mosques List */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="grid grid-cols-5 gap-4 p-4 font-medium text-sm text-gray-500 border-b">
              <div>Name</div>
              <div>Location</div>
              <div>Contact</div>
              <div>Admins</div>
              <div>Actions</div>
            </div>

            {mosques && mosques.length > 0 ? (
              mosques.map((mosque) => (
                <div
                  key={mosque.id}
                  className="grid grid-cols-5 gap-4 p-4 border-b hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-md">
                      <Mosque size={18} className="text-primary" />
                    </div>
                    <span className="font-medium">{mosque.name}</span>
                  </div>
                  <div className="text-gray-600">
                    {mosque.city || "N/A"}, {mosque.state || "N/A"}
                  </div>
                  <div className="text-gray-600">{mosque.email || "N/A"}</div>
                  <div>
                    <span className="bg-blue-100 text-primary text-xs px-2 py-1 rounded-full">
                      2 admins
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
                No mosques found. Add a mosque to get started.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
