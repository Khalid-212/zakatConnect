"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface Collection {
  id: string;
  amount: number;
  type: string;
  collection_date: string;
  mosque_id: string;
  product_type_id: string | null;
  product_types: {
    id: string;
    name: string;
    price: number;
  } | null;
  mosques: {
    id: string;
    name: string;
  } | null;
  givers: {
    id: string;
    name: string;
    phone: string;
  } | null;
}

interface CollectionsClientProps {
  collections: Collection[];
  mosques: { id: string; name: string }[];
  productTypes: { id: string; name: string; price: number }[];
  userRole: string;
  defaultMosqueId: string | null;
}

export default function CollectionsClient({
  collections,
  mosques,
  productTypes,
  userRole,
  defaultMosqueId,
}: CollectionsClientProps) {
  const [selectedMosqueId, setSelectedMosqueId] = useState(defaultMosqueId);

  // Filter collections based on selected mosque
  const filteredCollections = selectedMosqueId
    ? collections.filter((c) => c.mosque_id === selectedMosqueId)
    : collections;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Collections</h1>
              <p className="text-muted-foreground">
                Manage zakat collections and donations
              </p>
            </div>
            <Button>Add Collection</Button>
          </div>

          {/* Mosque Filter for super-admin */}
          {userRole === "super-admin" && (
            <div className="mb-6">
              <Select
                value={selectedMosqueId || "all"}
                onValueChange={(value) =>
                  setSelectedMosqueId(value === "all" ? null : value)
                }
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select Mosque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Mosques</SelectItem>
                  {mosques.map((mosque) => (
                    <SelectItem key={mosque.id} value={mosque.id}>
                      {mosque.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Collections Table */}
          <div className="bg-white rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Value (ETB)</TableHead>
                  <TableHead>Giver</TableHead>
                  <TableHead>Mosque</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCollections.map((collection) => (
                  <TableRow key={collection.id}>
                    <TableCell>
                      {format(
                        new Date(collection.collection_date),
                        "MMM d, yyyy"
                      )}
                    </TableCell>
                    <TableCell className="capitalize">
                      {collection.type}
                    </TableCell>
                    <TableCell>
                      {collection.type === "in_kind"
                        ? `${collection.amount} units`
                        : `${collection.amount.toFixed(2)} ETB`}
                    </TableCell>
                    <TableCell>
                      {collection.product_types?.name || "N/A"}
                    </TableCell>
                    <TableCell>
                      {collection.type === "in_kind" &&
                      collection.product_types?.price
                        ? (
                            collection.amount * collection.product_types.price
                          ).toFixed(2)
                        : collection.amount.toFixed(2)}{" "}
                      ETB
                    </TableCell>
                    <TableCell>
                      {collection.givers?.name || "Anonymous"}
                    </TableCell>
                    <TableCell>{collection.mosques?.name}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}
