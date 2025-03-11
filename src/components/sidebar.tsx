'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Building2 as Mosque,
  Home,
  Users,
  FileText,
  Package,
  BarChart4,
  Settings,
  LogOut,
  UserCog,
  ShoppingBag,
  FileBarChart,
  Menu,
  X,
} from 'lucide-react';
import { createClient } from '../../supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const supabase = createClient();
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchUserRole() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase.from('users').select('role').eq('id', user.id).single();

          if (data?.role) {
            setUserRole(data.role);
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserRole();
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/sign-in');
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const sidebarContent = (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Mosque className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">ZakatConnect</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <nav className="space-y-1">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/dashboard') ? 'bg-blue-50 text-primary' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Home className="h-5 w-5" />
            Dashboard
          </Link>

          {/* Super Admin and Admin can see Mosques */}
          {(userRole === 'super-admin' || userRole === 'admin') && (
            <Link
              href="/mosques"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/mosques') ? 'bg-blue-50 text-primary' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Mosque className="h-5 w-5" />
              Mosques
            </Link>
          )}

          {/* All roles can see Beneficiaries */}
          <Link
            href="/beneficiaries"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/beneficiaries')
                ? 'bg-blue-50 text-primary'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className="h-5 w-5" />
            Beneficiaries
          </Link>

          {/* All roles can see Givers */}
          <Link
            href="/givers"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/givers') ? 'bg-blue-50 text-primary' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className="h-5 w-5" />
            Givers
          </Link>

          {/* All roles can see Distributions */}
          <Link
            href="/distributions"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/distributions')
                ? 'bg-blue-50 text-primary'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Package className="h-5 w-5" />
            Distributions
          </Link>

          {/* Super Admin and Admin can see Products */}
          {(userRole === 'super-admin' || userRole === 'admin') && (
            <Link
              href="/products"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/products')
                  ? 'bg-blue-50 text-primary'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ShoppingBag className="h-5 w-5" />
              Products
            </Link>
          )}

          {/* Super Admin and Admin can see Staff */}
          {(userRole === 'super-admin' || userRole === 'admin') && (
            <Link
              href="/staff"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/staff') ? 'bg-blue-50 text-primary' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <UserCog className="h-5 w-5" />
              Staff
            </Link>
          )}

          {/* Super Admin and Admin can see Reports */}
          {(userRole === 'super-admin' || userRole === 'admin') && (
            <Link
              href="/reports"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/reports') ? 'bg-blue-50 text-primary' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileBarChart className="h-5 w-5" />
              Reports
            </Link>
          )}

          {/* Super Admin and Admin can see Analytics */}
          {(userRole === 'super-admin' || userRole === 'admin') && (
            <Link
              href="/analytics"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/analytics')
                  ? 'bg-blue-50 text-primary'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart4 className="h-5 w-5" />
              Analytics
            </Link>
          )}
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
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block w-64 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto ${className}`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 overflow-y-auto z-50 lg:hidden">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
