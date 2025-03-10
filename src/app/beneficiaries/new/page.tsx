"use client";

import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { createBeneficiary } from "./actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { createClient } from "../../../../supabase/client";

interface Mosque {
  id: string;
  name: string;
}

interface MosqueAdmin {
  mosque_id: string;
  mosques: {
    id: string;
    name: string;
  };
}

export default function NewBeneficiaryPage() {
  const router = useRouter();
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedMosqueId, setSelectedMosqueId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      try {
        // Get user role
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (userData) {
          setUserRole(userData.role);
        }

        // If super-admin, fetch all mosques
        if (userData?.role === "super-admin") {
          const { data: mosquesData } = await supabase
            .from("mosques")
            .select("id, name")
            .order("name");

          if (mosquesData) {
            setMosques(mosquesData);
          }
        } else {
          // For other roles, get their associated mosque
          const { data: mosqueAdmin } = (await supabase
            .from("mosque_admins")
            .select("mosque_id, mosques:mosques(id, name)")
            .eq("user_id", user.id)
            .single()) as { data: MosqueAdmin | null };

          if (mosqueAdmin) {
            setSelectedMosqueId(mosqueAdmin.mosque_id);
            if (mosqueAdmin.mosques) {
              setMosques([
                {
                  id: mosqueAdmin.mosques.id,
                  name: mosqueAdmin.mosques.name,
                },
              ]);
            }
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load mosque data");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  async function handleSubmit(formData: FormData) {
    // Create a new FormData object
    const updatedFormData = new FormData();

    // Copy all existing form data
    Array.from(formData.entries()).forEach(([key, value]) => {
      updatedFormData.append(key, value);
    });

    if (userRole === "super-admin") {
      const selectedMosque = formData.get("mosque_id");
      if (!selectedMosque) {
        toast.error("Please select a mosque");
        return;
      }
    } else if (selectedMosqueId) {
      updatedFormData.set("mosque_id", selectedMosqueId);
    }

    const result = await createBeneficiary(updatedFormData);

    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      toast.success(result.success);
      router.push("/beneficiaries");
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8 max-w-3xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/beneficiaries">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Register New Beneficiary</h1>
              <p className="text-muted-foreground">
                Add a new zakat beneficiary to the system
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg border p-6">
            <form action={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userRole === "super-admin" && (
                  <div className="space-y-2">
                    <Label htmlFor="mosque_id">Mosque</Label>
                    <Select name="mosque_id" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mosque" />
                      </SelectTrigger>
                      <SelectContent>
                        {mosques.map((mosque) => (
                          <SelectItem key={mosque.id} value={mosque.id}>
                            {mosque.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

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
                  <Label htmlFor="region">Region</Label>
                  <Select name="region" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Addis Ababa">Addis Ababa</SelectItem>
                      <SelectItem value="Afar">Afar</SelectItem>
                      <SelectItem value="Amhara">Amhara</SelectItem>
                      <SelectItem value="Benishangul-Gumuz">
                        Benishangul-Gumuz
                      </SelectItem>
                      <SelectItem value="Central Ethiopia">
                        Central Ethiopia
                      </SelectItem>
                      <SelectItem value="Dire Dawa">Dire Dawa</SelectItem>
                      <SelectItem value="Gambella">Gambella</SelectItem>
                      <SelectItem value="Harari">Harari</SelectItem>
                      <SelectItem value="Oromia">Oromia</SelectItem>
                      <SelectItem value="Sidama">Sidama</SelectItem>
                      <SelectItem value="Somali">Somali</SelectItem>
                      <SelectItem value="South Ethiopia">
                        South Ethiopia
                      </SelectItem>
                      <SelectItem value="Southern Nations, Nationalities, and Peoples'">
                        Southern Nations, Nationalities, and Peoples'
                      </SelectItem>
                      <SelectItem value="South West Ethiopia Peoples'">
                        South West Ethiopia Peoples'
                      </SelectItem>
                      <SelectItem value="Tigray">Tigray</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Enter city"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sub_city">Sub-City</Label>
                  <Input
                    id="sub_city"
                    name="sub_city"
                    placeholder="Enter sub-city"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="woreda">Woreda</Label>
                  <Input
                    id="woreda"
                    name="woreda"
                    placeholder="Enter woreda"
                    required
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
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="remark">Remark</Label>
                  <Textarea
                    id="remark"
                    name="remark"
                    placeholder="Add any additional information"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Link href="/beneficiaries">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit">Register Beneficiary</Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
