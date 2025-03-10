import Link from "next/link";
import { Twitter, Linkedin, Facebook, Instagram } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Platform Column */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#features"
                  className="text-gray-600 hover:text-primary"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-primary"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-up"
                  className="text-gray-600 hover:text-primary"
                >
                  Register Mosque
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-in"
                  className="text-gray-600 hover:text-primary"
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-600 hover:text-primary">
                  Zakat Guidelines
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-primary">
                  Beneficiary Categories
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-primary">
                  Calculation Methods
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-primary">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-600 hover:text-primary">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-primary">
                  Community
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-primary">
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-600 hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-primary">
                  Data Security
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-primary">
                  Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200">
          <div className="text-gray-600 mb-4 md:mb-0">
            © {currentYear} ZakatConnect. All rights reserved.
          </div>

          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-primary">
              <span className="sr-only">Facebook</span>
              <Facebook className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-primary">
              <span className="sr-only">Instagram</span>
              <Instagram className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-primary">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-primary">
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
