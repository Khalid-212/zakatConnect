import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default async function NewBeneficiaryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
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
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter full name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="poor">Poor (Fuqara)</SelectItem>
                      <SelectItem value="needy">Needy (Masakeen)</SelectItem>
                      <SelectItem value="debt">In Debt (Gharimeen)</SelectItem>
                      <SelectItem value="wayfarer">
                        Wayfarer (Ibn al-Sabeel)
                      </SelectItem>
                      <SelectItem value="convert">
                        New Muslim (Muallaf)
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="Enter phone number" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="Enter address" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional information"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
                <Button type="submit">Register Beneficiary</Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
