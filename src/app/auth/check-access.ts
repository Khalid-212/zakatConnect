import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";

export async function checkUserAccess(
  allowedRoles: ("super-admin" | "admin" | "clerk")[],
  redirectPath: string = "/dashboard",
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get user role from the users table
  const { data: userData, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !userData) {
    console.error("Error fetching user role:", error);
    return redirect("/sign-in?error=Failed to verify user permissions");
  }

  // Check if user's role is in the allowed roles
  if (!allowedRoles.includes(userData.role)) {
    return redirect(
      `${redirectPath}?error=You do not have permission to access this page`,
    );
  }

  return { user, role: userData.role };
}
