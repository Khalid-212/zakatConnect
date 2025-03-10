import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { UserPlus, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default async function BeneficiariesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch beneficiaries from database
  const { data: beneficiaries, error } = await supabase
    .from("beneficiaries")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch distributions for each beneficiary to determine status
  const beneficiaryIds = beneficiaries?.map((ben) => ben.id) || [];
  const { data: distributions } = await supabase
    .from("zakat_distributions")
    .select("beneficiary_id, status")
    .in("beneficiary_id", beneficiaryIds);

  // Determine status for each beneficiary
  const beneficiaryStatus = {};
  distributions?.forEach((dist) => {
    if (dist.beneficiary_id) {
      // If any distribution is approved, mark as approved
      if (dist.status === "approved") {
        beneficiaryStatus[dist.beneficiary_id] = "approved";
      }
      // If no approved status yet but has pending, mark as pending
      else if (
        dist.status === "pending" &&
        beneficiaryStatus[dist.beneficiary_id] !== "approved"
      ) {
        beneficiaryStatus[dist.beneficiary_id] = "pending";
      }
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
              <h1 className="text-3xl font-bold">Beneficiaries</h1>
              <p className="text-muted-foreground">
                Manage zakat beneficiaries
              </p>
            </div>
            <Link href="/beneficiaries/new">
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Add Beneficiary
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
              <Input
                placeholder="Search beneficiaries..."
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Beneficiaries List */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="grid grid-cols-5 gap-4 p-4 font-medium text-sm text-gray-500 border-b">
              <div>Name</div>
              <div>Code</div>
              <div>Location</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            {beneficiaries && beneficiaries.length > 0 ? (
              beneficiaries.map((beneficiary) => {
                const status = beneficiaryStatus[beneficiary.id] || "active";
                const statusColor =
                  status === "approved"
                    ? "bg-green-100 text-green-600"
                    : status === "pending"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-blue-100 text-blue-600";

                return (
                  <div
                    key={beneficiary.id}
                    className="grid grid-cols-5 gap-4 p-4 border-b hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-md">
                        <UserPlus size={18} className="text-primary" />
                      </div>
                      <div>
                        <span className="font-medium">{beneficiary.name}</span>
                        <div className="text-xs text-gray-500">
                          Family members: {beneficiary.family_members || 1}
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-600 font-medium">
                      {beneficiary.code ? (
                        <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                          {beneficiary.code}
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </div>
                    <div className="text-gray-600">
                      {beneficiary.city}, {beneficiary.region}
                    </div>
                    <div>
                      <span
                        className={`${statusColor} text-xs px-2 py-1 rounded-full`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-500">
                No beneficiaries found. Add a beneficiary to get started.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
