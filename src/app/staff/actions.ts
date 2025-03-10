"use server";

import { createClient } from "../../../supabase/client-server";
import { redirect } from "next/navigation";

export async function createStaffMember(formData: FormData) {
  const supabase = await createClient();

  const mosqueId = formData.get("mosque_id") as string;
  const fullName = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  // Generate a unique staff code
  const timestamp = Date.now().toString().slice(-6);
  const randomPart = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  const staffCode = `STAFF-${timestamp}-${randomPart}`;

  try {
    // Create user with regular signup
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
          staff_code: staffCode,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
      },
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      return redirect(
        `/staff?error=Failed to create staff member: ${authError.message}`,
      );
    }

    if (!authUser.user) {
      console.error("No user returned from auth signup");
      return redirect(
        "/staff?error=Failed to create staff member: No user returned",
      );
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
      staff_code: staffCode,
      created_at: new Date().toISOString(),
    });

    if (publicUserError) {
      console.error("Error creating public user:", publicUserError);
      return redirect(
        `/staff?error=Failed to create user profile: ${publicUserError.message}`,
      );
    }

    // Create mosque_admin entry
    const { error: mosqueAdminError } = await supabase
      .from("mosque_admins")
      .insert({
        user_id: authUser.user.id,
        mosque_id: mosqueId,
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (mosqueAdminError) {
      console.error("Error creating mosque admin:", mosqueAdminError);
      return redirect(
        `/staff?error=Failed to assign mosque role: ${mosqueAdminError.message}`,
      );
    }

    return redirect(
      `/staff?success=Staff member ${fullName} registered successfully with code: ${staffCode}`,
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return redirect(
      `/staff?error=An unexpected error occurred: ${error.message}`,
    );
  }
}
