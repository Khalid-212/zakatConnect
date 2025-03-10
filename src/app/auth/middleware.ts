import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";

export async function checkUserRole(allowedRoles: string[]) {
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
      "/dashboard?error=You do not have permission to access this page",
    );
  }

  return { user, role: userData.role };
}

export async function getUserMosques() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { mosques: [] };
  }

  // Get user role
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  // If super-admin, get all mosques
  if (userData?.role === "super-admin") {
    const { data: mosques } = await supabase.from("mosques").select("*");

    return { mosques: mosques || [] };
  }

  // Otherwise, get mosques associated with the user
  const { data: mosqueAdmins } = await supabase
    .from("mosque_admins")
    .select("mosque_id")
    .eq("user_id", user.id);

  if (!mosqueAdmins || mosqueAdmins.length === 0) {
    return { mosques: [] };
  }

  const mosqueIds = mosqueAdmins.map((ma) => ma.mosque_id);

  const { data: mosques } = await supabase
    .from("mosques")
    .select("*")
    .in("id", mosqueIds);

  return { mosques: mosques || [] };
}
