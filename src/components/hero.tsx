import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import {
  Building2 as Mosque,
  Coins,
  HeartHandshake as HandHeart,
} from "lucide-react";
import { createClient } from "../../supabase/server";

export default async function Hero() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 opacity-70" />

      <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
              ZakatConnect:{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500">
                Mosque Zakat Management
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              A comprehensive platform for mosques to register, track, and
              manage zakat collections and distributions with role-based access
              control.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href={user ? "/dashboard" : "/sign-in"}
                className="inline-flex items-center px-8 py-4 text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors text-lg font-medium"
              >
                {user ? "Go to Dashboard" : "Sign In"}
                <ArrowUpRight className="ml-2 w-5 h-5" />
              </Link>

              <Link
                href="/sign-up"
                className="inline-flex items-center px-8 py-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-lg font-medium"
              >
                Register Your Mosque
              </Link>
            </div>

            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mosque className="w-5 h-5 text-primary" />
                <span>Mosque Registration</span>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-primary" />
                <span>Zakat Collection</span>
              </div>
              <div className="flex items-center gap-2">
                <HandHeart className="w-5 h-5 text-primary" />
                <span>Beneficiary Management</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
