"use client";

import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/client";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calculator } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useDonationCalculator } from "./calculate-donation";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ClientGiverPage() {
  const [user, setUser] = useState(null);
  const [mosques, setMosques] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const { setFamilyMembers, setProductPrice, calculatedAmount } =
    useDonationCalculator();

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // Check authentication
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        redirect("/sign-in");
      }
      setUser(user);

      // Fetch mosques
      const { data: mosquesData } = await supabase
        .from("mosques")
        .select("id, name")
        .order("name");
      setMosques(mosquesData || []);

      // Fetch product types
      const { data: productTypesData } = await supabase
        .from("product_types")
        .select("id, name, price")
        .order("name");
      setProductTypes(productTypesData || []);
    }

    fetchData();
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8 max-w-3xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/givers">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Register New Giver</h1>
              <p className="text-muted-foreground">
                Record a new donation or zakat payment
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg border p-6">
            <form
              action="/api/givers/create"
              method="post"
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="family_members">
                    Number of Family Members
                  </Label>
                  <Input
                    id="family_members"
                    name="family_members"
                    type="number"
                    placeholder="Enter number of family members"
                    required
                    defaultValue="1"
                    onChange={(e) =>
                      setFamilyMembers(parseInt(e.target.value) || 1)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mosque_id">Mosque</Label>
                  <Select name="mosque_id">
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
                  <Label htmlFor="product_type_id">Product Type</Label>
                  <Select
                    name="product_type_id"
                    onValueChange={(value) => {
                      const product = productTypes.find((p) => p.id === value);
                      if (product) {
                        setProductPrice(product.price);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type" />
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
                  <Label htmlFor="amount">
                    Donation Amount (Auto-calculated)
                  </Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="Amount will be calculated"
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Enter address"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Link href="/givers">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit">Register Giver</Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
