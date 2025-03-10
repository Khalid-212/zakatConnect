import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { createCollection } from "../actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default async function NewCollectionPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch mosques for the dropdown
  const { data: mosques } = await supabase
    .from("mosques")
    .select("id, name")
    .order("name");

  // Fetch givers for the dropdown
  const { data: givers } = await supabase
    .from("givers")
    .select("id, name")
    .order("name");

  // Fetch product types for the dropdown
  const { data: productTypes } = await supabase
    .from("product_types")
    .select("id, name, price")
    .order("name");

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8 max-w-3xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/collections">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">New Zakat Collection</h1>
              <p className="text-muted-foreground">
                Record a new zakat collection or donation
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg border p-6">
            <form action={createCollection} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="mosque_id">Mosque</Label>
                  <Select name="mosque_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mosque" />
                    </SelectTrigger>
                    <SelectContent>
                      {mosques?.map((mosque) => (
                        <SelectItem key={mosque.id} value={mosque.id}>
                          {mosque.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="giver_id">Giver</Label>
                  <Select name="giver_id">
                    <SelectTrigger>
                      <SelectValue placeholder="Select giver (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {givers?.map((giver) => (
                        <SelectItem key={giver.id} value={giver.id}>
                          {giver.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Collection Type</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="in_kind">In-kind</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_type_id">Product Type</Label>
                  <Select name="product_type_id">
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {productTypes?.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {product.price} ETB
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (ETB)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="Enter amount"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Add any additional information"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Link href="/collections">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit">Save Collection</Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
