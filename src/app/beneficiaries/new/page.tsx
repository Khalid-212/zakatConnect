import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
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
            <form action={createBeneficiary} className="space-y-6">
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
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    name="region"
                    placeholder="Enter region"
                    required
                  />
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
