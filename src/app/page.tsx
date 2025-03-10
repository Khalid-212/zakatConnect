import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { ArrowUpRight, CheckCircle2, Users, BarChart4 } from "lucide-react";
import {
  Building2 as Mosque,
  Coins,
  HeartHandshake as HandHeart,
} from "lucide-react";
import { createClient } from "../../supabase/server";
import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 sm:pt-32 sm:pb-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 opacity-70" />

        <div className="container mx-auto px-4 relative">
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
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Secure Transactions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Role-based Access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Detailed Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Comprehensive Zakat Management
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform provides everything mosques need to efficiently
              manage zakat collections and distributions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Mosque className="w-6 h-6" />,
                title: "Mosque Registration",
                description: "Easily register and manage mosque profiles",
              },
              {
                icon: <Coins className="w-6 h-6" />,
                title: "Zakat Collection",
                description: "Track cash and in-kind donations",
              },
              {
                icon: <HandHeart className="w-6 h-6" />,
                title: "Beneficiary Management",
                description: "Register and manage zakat recipients",
              },
              {
                icon: <BarChart4 className="w-6 h-6" />,
                title: "Detailed Analytics",
                description: "Comprehensive reporting and insights",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-primary mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-based Access Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Role-Based Access Control
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform provides tailored experiences for different user
              roles.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-primary mb-4 text-xl font-semibold">
                Super Admin
              </div>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Global system oversight</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Manage all mosques</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>View all transactions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>User role management</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-primary mb-4 text-xl font-semibold">
                Mosque Admin
              </div>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Mosque profile management</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Zakat collection & distribution</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Manage clerks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Generate reports</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-primary mb-4 text-xl font-semibold">
                Clerk
              </div>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Record zakat collections</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Record zakat distributions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Register givers & beneficiaries</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>View limited mosque metrics</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-blue-100">Mosques Registered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$500K+</div>
              <div className="text-blue-100">Zakat Collected</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5,000+</div>
              <div className="text-blue-100">Beneficiaries Helped</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Transactions Processed</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Streamline Your Zakat Management?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join mosques across the country who trust ZakatConnect for efficient
            and transparent zakat management.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center px-6 py-3 text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            Register Your Mosque
            <ArrowUpRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
