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
import { User } from "@supabase/supabase-js";
import { json } from "stream/consumers";

// Define types manually since we can't access the full Database type
type Mosque = {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  created_at?: string;
  updated_at?: string;
};

type ProductType = {
  id: string;
  name: string;
  price: number;
};

type MosqueAdmin = {
  mosque_id: string;
  mosques: Mosque;
};

export default function ClientGiverPage() {
  const [user, setUser] = useState<User | null>(null);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const { setFamilyMembers, setProductPrice, calculatedAmount } =
    useDonationCalculator();
  const [userMosque, setUserMosque] = useState<Mosque | null>(null);
  const supabase = createClient();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserMosque() {
      if (!user?.id) return;

      const { data: mosqueAdmin } = (await supabase
        .from("mosque_admins")
        .select("mosque_id, mosques:mosques(id, name)")
        .eq("user_id", user.id)
        .single()) as { data: MosqueAdmin | null };

      if (mosqueAdmin?.mosques) {
        setUserMosque(mosqueAdmin.mosques);
      }
    }

    if (user?.id) {
      fetchUserMosque();
    }
  }, [user]);

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

      // Cast the data to the expected type
      setMosques((mosquesData as Mosque[]) || []);

      // Fetch product types
      const { data: productTypesData } = await supabase
        .from("product_types")
        .select("id, name, price")
        .order("name");

      // Cast the data to the expected type
      setProductTypes((productTypesData as ProductType[]) || []);
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchUserRole() {
      const { data: userRoleData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user?.id)
        .single();
      if (userRoleData) {
        setUserRole(userRoleData?.role);
      }
    }
    fetchUserRole();
  }, [user]);

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
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Enter phone number"
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
                  {userRole === "super-admin" ? (
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
                  ) : (
                    <>
                      {/* Adding a hidden input to send the mosque ID in the form */}
                      <input
                        type="hidden"
                        id="mosque_id"
                        name="mosque_id"
                        value={userMosque?.id || ""}
                      />

                      <Input
                        placeholder={userMosque?.name || "Loading mosque..."}
                        value={userMosque?.name || ""}
                        readOnly
                      />
                    </>
                  )}
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
                    value={calculatedAmount}
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
