"use server";

import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";

export async function createStaffMember(formData: FormData) {
  const supabase = await createClient();

  const mosqueId = formData.get("mosque_id") as string;
  const fullName = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  // Create user with regular signup
  const { data: authUser, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
    },
  });

  if (authError) {
    console.error("Error creating auth user:", authError);
    return redirect("/staff?error=Failed to create staff member");
  }

  if (!authUser.user) {
    console.error("No user returned from auth signup");
    return redirect("/staff?error=Failed to create staff member");
  }

  // Create user in public.users
  const { error: publicUserError } = await supabase.from("users").insert({
    id: authUser.user.id,
    email: email,
    full_name: fullName,
    name: fullName,
    role: role,
    token_identifier: authUser.user.id,
    user_id: authUser.user.id,
  });

  if (publicUserError) {
    console.error("Error creating public user:", publicUserError);
    return redirect("/staff?error=Failed to create user profile");
  }

  // Create mosque_admin entry
  const { error: mosqueAdminError } = await supabase
    .from("mosque_admins")
    .insert({
      user_id: authUser.user.id,
      mosque_id: mosqueId,
      role: role,
    });

  if (mosqueAdminError) {
    console.error("Error creating mosque admin:", mosqueAdminError);
    return redirect("/staff?error=Failed to assign mosque role");
  }

  return redirect("/staff?success=Staff member registered successfully");
}
