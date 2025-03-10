import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  UserPlus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { updateDistributionStatus } from "./actions";
import { ApprovalButton } from "./approval-button";

export default async function DistributionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch distributions from database
  const { data: distributions, error } = await supabase
    .from("zakat_distributions")
    .select("*, beneficiaries(name), mosques(name)")
    .order("distribution_date", { ascending: false });

  // Fetch beneficiaries for approval
  const { data: beneficiaries } = await supabase
    .from("beneficiaries")
    .select("*")
    .order("created_at", { ascending: false });

  // Get distribution status for each beneficiary
  const beneficiaryIds = beneficiaries?.map((ben) => ben.id) || [];
  const { data: beneficiaryDistributions } = await supabase
    .from("zakat_distributions")
    .select("beneficiary_id, status")
    .in("beneficiary_id", beneficiaryIds);

  // Create a map of beneficiary ID to status
  const beneficiaryStatus = {};
  beneficiaryDistributions?.forEach((dist) => {
    if (dist.beneficiary_id) {
      beneficiaryStatus[dist.beneficiary_id] = dist.status;
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
              <h1 className="text-3xl font-bold">Zakat Distributions</h1>
              <p className="text-muted-foreground">
                Manage zakat distributions to beneficiaries
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download size={16} />
                Export
              </Button>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Add Distribution
              </Button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-lg border mb-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  placeholder="Search distributions..."
                  className="pl-10 w-full"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} />
                Filter
              </Button>
            </div>
          </div>

          {/* Distribution Approval Section */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Beneficiary Approval</h2>
            <p className="text-muted-foreground mb-4">
              Approve beneficiaries to receive zakat distributions
            </p>

            <form className="relative mb-4">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                placeholder="Search by beneficiary code"
                className="pl-10 w-full"
                name="code"
              />
              <Button type="submit" className="absolute right-1 top-1 h-8">
                Search
              </Button>
            </form>

            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-6 gap-4 p-4 font-medium text-sm text-gray-500 border-b">
                <div>Name</div>
                <div>Code</div>
                <div>Family Size</div>
                <div>Location</div>
                <div>Status</div>
                <div>Actions</div>
              </div>

              {/* Fetch beneficiaries and show them here */}
              {beneficiaries && beneficiaries.length > 0 ? (
                beneficiaries.map((beneficiary) => {
                  const status = beneficiaryStatus[beneficiary.id] || "pending";
                  const statusColor =
                    status === "approved"
                      ? "bg-green-100 text-green-600"
                      : status === "pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-red-100 text-red-600";

                  return (
                    <div
                      key={beneficiary.id}
                      className="grid grid-cols-6 gap-4 p-4 border-b hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-md">
                          <UserPlus size={18} className="text-primary" />
                        </div>
                        <span className="font-medium">{beneficiary.name}</span>
                      </div>
                      <div className="text-gray-600 font-medium">
                        {beneficiary.code}
                      </div>
                      <div className="text-gray-600">
                        {beneficiary.family_members || 1}
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
                      <div className="flex gap-2">
                        <ApprovalButton
                          status={status}
                          action={updateDistributionStatus}
                          id={beneficiary.id}
                          newStatus="approved"
                          label="Approve"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        />

                        {status !== "pending" && (
                          <ApprovalButton
                            status={status}
                            action={updateDistributionStatus}
                            id={beneficiary.id}
                            newStatus="rejected"
                            label="Reject"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No beneficiaries found. Add beneficiaries to get started.
                </div>
              )}
            </div>
          </div>

          {/* Distributions List */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="grid grid-cols-6 gap-4 p-4 font-medium text-sm text-gray-500 border-b">
              <div>ID</div>
              <div>Date</div>
              <div>Mosque</div>
              <div>Beneficiary</div>
              <div>Amount</div>
              <div>Actions</div>
            </div>

            {distributions && distributions.length > 0 ? (
              distributions.map((distribution) => (
                <div
                  key={distribution.id}
                  className="grid grid-cols-6 gap-4 p-4 border-b hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-md">
                      <Package size={18} className="text-primary" />
                    </div>
                    <span className="font-medium">
                      {distribution.id.substring(0, 8)}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    {new Date(
                      distribution.distribution_date,
                    ).toLocaleDateString()}
                  </div>
                  <div className="text-gray-600">
                    {distribution.mosques?.name || "N/A"}
                  </div>
                  <div className="text-gray-600">
                    {distribution.beneficiaries?.name || "Unknown"}
                  </div>
                  <div>
                    <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                      {distribution.amount} ETB
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
                No distributions found. Add a distribution to get started.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
