import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { UserCog, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createStaffMember } from "./actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default async function StaffPage() {
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

  // Fetch existing staff members
  const { data: staffMembers } = await supabase
    .from("users")
    .select("id, name, email, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Staff Management</h1>
            <p className="text-muted-foreground">
              Register and manage staff members for your mosque
            </p>
          </div>

          {/* Staff List */}
          <div className="bg-white rounded-lg border p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Staff Members</h2>
            </div>

            {staffMembers && staffMembers.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-4 gap-4 p-4 font-medium text-sm text-gray-500 border-b">
                  <div>Name</div>
                  <div>Email</div>
                  <div>Role</div>
                  <div>Joined</div>
                </div>

                {staffMembers.map((staff) => (
                  <div
                    key={staff.id}
                    className="grid grid-cols-4 gap-4 p-4 border-b hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-md">
                        <UserCog size={18} className="text-primary" />
                      </div>
                      <span className="font-medium">{staff.name}</span>
                    </div>
                    <div className="text-gray-600">{staff.email}</div>
                    <div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${staff.role === "clerk" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}`}
                      >
                        {staff.role || "clerk"}
                      </span>
                    </div>
                    <div className="text-gray-600">
                      {new Date(staff.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No staff members found. Add one below to get started.
              </div>
            )}
          </div>

          {/* Staff Registration Form */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">New Staff Member</h2>
            <p className="text-muted-foreground mb-6">
              Create an account for a new clerk or reporter
            </p>

            <form action={createStaffMember} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="mosque_id"
                    className="block text-sm font-medium mb-2"
                  >
                    Mosque
                  </Label>
                  <Select name="mosque_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a mosque" />
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

                <div>
                  <Label
                    htmlFor="full_name"
                    className="block text-sm font-medium mb-2"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    placeholder="Enter staff member's full name"
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="staff@example.com"
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="password"
                    className="block text-sm font-medium mb-2"
                  >
                    Temporary Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    The staff member will be asked to change this password on
                    first login.
                  </p>
                </div>

                <div>
                  <Label
                    htmlFor="role"
                    className="block text-sm font-medium mb-2"
                  >
                    Role
                  </Label>
                  <Select name="role" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Clerk" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clerk">Clerk</SelectItem>
                      <SelectItem value="reporter">Reporter</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Clerks can register beneficiaries and givers. Reporters can
                    access reports.
                  </p>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Register Staff Member
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
