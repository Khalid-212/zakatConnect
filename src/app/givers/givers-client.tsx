"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { UsersRound, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Giver {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  code?: string;
  mosque_id: string;
}

interface Dictionary<T> {
  [key: string]: T;
}

interface GiversClientProps {
  givers: Giver[];
  totalDonations: Dictionary<number>;
  userRole: string;
  defaultMosqueId: string | null;
}

export default function GiversClient({
  givers,
  totalDonations,
  userRole,
  defaultMosqueId,
}: GiversClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMosqueId, setSelectedMosqueId] = useState(defaultMosqueId);

  // Filter givers based on search term
  const filteredGivers = givers.filter(
    (giver) =>
      giver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      giver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      giver.phone?.includes(searchTerm)
  );

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
            <div className="flex gap-3">
              <Link href="/givers/new">
                <Button className="flex items-center gap-2">
                  <Plus size={16} />
                  Add Giver
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
                  placeholder="Search givers..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {userRole === "super-admin" && (
                <Select
                  value={selectedMosqueId || ""}
                  onValueChange={(value) =>
                    setSelectedMosqueId(value === "" ? null : value)
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Mosques" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Mosques</SelectItem>
                    {/* Mosque options would go here */}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Givers List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredGivers.length > 0 ? (
              filteredGivers.map((giver) => (
                <div
                  key={giver.id}
                  className="bg-white p-5 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <UsersRound size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{giver.name}</h3>
                      <p className="text-sm text-gray-500">
                        {giver.code || "No code assigned"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {giver.email && (
                      <p className="text-sm">
                        <span className="font-medium">Email:</span>{" "}
                        {giver.email}
                      </p>
                    )}
                    {giver.phone && (
                      <p className="text-sm">
                        <span className="font-medium">Phone:</span>{" "}
                        {giver.phone}
                      </p>
                    )}
                    {giver.address && (
                      <p className="text-sm">
                        <span className="font-medium">Address:</span>{" "}
                        {giver.address}
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="font-medium">Total Donations:</span>{" "}
                      {totalDonations[giver.id]
                        ? `$${totalDonations[giver.id].toFixed(2)}`
                        : "$0.00"}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Link href={`/givers/${giver.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 p-8 text-center text-gray-500 bg-white rounded-lg border">
                No givers found. Add givers to get started.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
