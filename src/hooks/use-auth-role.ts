"use client";

import { createClient } from "../../supabase/client";
import { useEffect, useState } from "react";

export function useAuthRole() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Check if we have the role in localStorage to avoid unnecessary DB calls
    const cachedRole = localStorage.getItem("userRole");
    if (cachedRole) {
      setUserRole(cachedRole);
      setIsLoading(false);
      return;
    }

    const fetchUserRole = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();

          if (data?.role) {
            // Cache the role in localStorage
            localStorage.setItem("userRole", data.role);
            setUserRole(data.role);
          }
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        // Clear the cached role when user signs out
        localStorage.removeItem("userRole");
        setUserRole(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { userRole, isLoading };
}
