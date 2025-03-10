import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { createMosque } from "./actions";

export default async function NewMosquePage() {
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
            <Link href="/mosques">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Mosque Registration</h1>
              <p className="text-muted-foreground">
                Register a new mosque and create an admin account
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg border p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Mosque Information</h2>
              <p className="text-muted-foreground">
                Please enter the mosque details and create an admin account for
                the mosque
              </p>
            </div>

            <form action={createMosque} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center">
                    Mosque Name <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter mosque name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center">
                    Address <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Enter address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sub_city">Sub City</Label>
                  <Input
                    id="sub_city"
                    name="sub_city"
                    placeholder="Enter sub city"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="woreda">Woreda</Label>
                  <Input id="woreda" name="woreda" placeholder="Enter woreda" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_person" className="flex items-center">
                    Contact Person <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="contact_person"
                    name="contact_person"
                    placeholder="Enter contact person name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_phone" className="flex items-center">
                    Contact Phone <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    placeholder="Enter contact phone"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_email" className="flex items-center">
                    Admin Email <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="admin_email"
                    name="admin_email"
                    type="email"
                    placeholder="Enter admin email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_password" className="flex items-center">
                    Admin Password <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="admin_password"
                    name="admin_password"
                    type="password"
                    placeholder="Enter admin password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_name" className="flex items-center">
                    Admin Name <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="admin_name"
                    name="admin_name"
                    placeholder="Enter name for mosque admin"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" placeholder="Enter city" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Region</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="Enter state or region"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip">Zip/Postal Code</Label>
                  <Input
                    id="zip"
                    name="zip"
                    placeholder="Enter zip or postal code"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Mosque Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter mosque email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Mosque Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Enter mosque phone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    placeholder="Enter mosque website"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Link href="/mosques">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit">Submit Registration</Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
