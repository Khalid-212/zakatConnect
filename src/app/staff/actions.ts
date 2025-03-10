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

  // Create user in auth.users
  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: role,
      },
    });

  if (authError) {
    console.error("Error creating auth user:", authError);
    throw new Error("Failed to create staff member");
  }

  // Create user in public.users
  const { data: publicUser, error: publicUserError } = await supabase
    .from("users")
    .insert({
      id: authUser.user.id,
      email: email,
      full_name: fullName,
      name: fullName,
      role: role,
      token_identifier: authUser.user.id,
      user_id: authUser.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (publicUserError) {
    console.error("Error creating public user:", publicUserError);
    throw new Error("Failed to create staff member");
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
    throw new Error("Failed to create staff member");
  }

  return redirect("/staff?success=Staff member registered successfully");
}
