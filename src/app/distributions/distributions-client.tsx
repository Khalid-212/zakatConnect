// Add this at the top of the file
declare global {
  interface Window {
    refreshDistributionsData?: () => Promise<void>;
  }
}

("use client");

import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Package, Plus, Search, Filter, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { updateDistributionStatus } from "./actions";
import { ApprovalButton } from "./approval-button";
import { createClient } from "../../../supabase/client";

interface DistributionsClientProps {
  initialDistributions: any[];
  initialBeneficiaries: any[];
}

export default function DistributionsClient({
  initialDistributions,
  initialBeneficiaries,
}: DistributionsClientProps) {
  const [searchCode, setSearchCode] = useState("");
  const [distributions, setDistributions] = useState(initialDistributions);
  const [beneficiaries, setBeneficiaries] = useState(initialBeneficiaries);
  const [filteredBeneficiaries, setFilteredBeneficiaries] =
    useState(initialBeneficiaries);

  // Handle search input change
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setSearchCode(code);

    if (code.length > 2) {
      const supabase = createClient();
      const { data } = await supabase
        .from("beneficiaries")
        .select("*")
        .ilike("code", `%${code}%`)
        .order("created_at", { ascending: false });

      setFilteredBeneficiaries(data || []);
    } else {
      setFilteredBeneficiaries(beneficiaries);
    }
  };

  // Refresh data when needed
  const refreshData = async () => {
    const supabase = createClient();

    const { data: newDistributions } = await supabase
      .from("zakat_distributions")
      .select("*, beneficiaries(name), mosques(name)")
      .order("distribution_date", { ascending: false });

    if (newDistributions) {
      setDistributions(newDistributions);
    }

    const { data: newBeneficiaries } = await supabase
      .from("beneficiaries")
      .select("*")
      .order("created_at", { ascending: false });

    if (newBeneficiaries) {
      setBeneficiaries(newBeneficiaries);
      setFilteredBeneficiaries(newBeneficiaries);
    }
  };

  // Initialize filtered beneficiaries and set up global refresh function
  useEffect(() => {
    setFilteredBeneficiaries(beneficiaries);

    // Add a global refresh function that can be called from other components
    (window as any).refreshDistributionsData = refreshData;

    return () => {
      // Clean up when component unmounts
      delete (window as any).refreshDistributionsData;
    };
  }, [beneficiaries]);

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
              <Link href="/distributions/new">
                <Button className="flex items-center gap-2">
                  <Plus size={16} />
                  Add Distribution
                </Button>
              </Link>
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
                value={searchCode}
                onChange={handleSearchChange}
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
              {filteredBeneficiaries && filteredBeneficiaries.length > 0 ? (
                filteredBeneficiaries.map((beneficiary) => {
                  const status = beneficiary.status || "pending";
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
                      distribution.distribution_date
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
