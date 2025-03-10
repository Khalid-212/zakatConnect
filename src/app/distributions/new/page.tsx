import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { createDistribution } from "../actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default async function NewDistributionPage() {
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

  // Fetch beneficiaries for the dropdown
  const { data: beneficiaries } = await supabase
    .from("beneficiaries")
    .select("id, name, code")
    .order("name");

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8 max-w-3xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/distributions">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">New Zakat Distribution</h1>
              <p className="text-muted-foreground">
                Record a new zakat distribution to a beneficiary
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg border p-6">
            <form action={createDistribution} className="space-y-6">
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
                  <Label htmlFor="beneficiary_id">Beneficiary</Label>
                  <Select name="beneficiary_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select beneficiary" />
                    </SelectTrigger>
                    <SelectContent>
                      {beneficiaries?.map((beneficiary) => (
                        <SelectItem key={beneficiary.id} value={beneficiary.id}>
                          {beneficiary.name}{" "}
                          {beneficiary.code ? `(${beneficiary.code})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Distribution Type</Label>
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
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
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
                <Link href="/distributions">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit">Save Distribution</Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
