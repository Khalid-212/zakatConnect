"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2 as Mosque,
  Home,
  Users,
  FileText,
  Package,
  BarChart4,
  Settings,
  LogOut,
} from "lucide-react";
import { createClient } from "../../supabase/client";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const supabase = createClient();
  const router = useRouter();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/sign-in");
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <Mosque className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">ZakatConnect</span>
        </Link>

        <nav className="space-y-1">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${isActive("/dashboard") ? "bg-blue-50 text-primary" : "text-gray-700 hover:bg-gray-100"}`}
          >
            <Home className="h-5 w-5" />
            Dashboard
          </Link>

          <Link
            href="/mosques"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${isActive("/mosques") ? "bg-blue-50 text-primary" : "text-gray-700 hover:bg-gray-100"}`}
          >
            <Mosque className="h-5 w-5" />
            Mosques
          </Link>

          <Link
            href="/beneficiaries"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${isActive("/beneficiaries") ? "bg-blue-50 text-primary" : "text-gray-700 hover:bg-gray-100"}`}
          >
            <Users className="h-5 w-5" />
            Beneficiaries
          </Link>

          <Link
            href="/givers"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${isActive("/givers") ? "bg-blue-50 text-primary" : "text-gray-700 hover:bg-gray-100"}`}
          >
            <Users className="h-5 w-5" />
            Givers
          </Link>

          <Link
            href="/collections"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${isActive("/collections") ? "bg-blue-50 text-primary" : "text-gray-700 hover:bg-gray-100"}`}
          >
            <FileText className="h-5 w-5" />
            Collections
          </Link>

          <Link
            href="/distributions"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${isActive("/distributions") ? "bg-blue-50 text-primary" : "text-gray-700 hover:bg-gray-100"}`}
          >
            <Package className="h-5 w-5" />
            Distributions
          </Link>

          <Link
            href="/analytics"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${isActive("/analytics") ? "bg-blue-50 text-primary" : "text-gray-700 hover:bg-gray-100"}`}
          >
            <BarChart4 className="h-5 w-5" />
            Analytics
          </Link>
        </nav>
      </div>

      <div className="absolute bottom-0 w-full border-t border-gray-200 p-4">
        <div className="space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 text-left"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
