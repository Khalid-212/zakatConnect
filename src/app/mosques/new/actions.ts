"use server";

import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";

export async function createMosque(formData: FormData) {
  const supabase = await createClient();

  // Mosque details
  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const subCity = formData.get("sub_city") as string;
  const woreda = formData.get("woreda") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const zip = formData.get("zip") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const website = formData.get("website") as string;
  const contactPerson = formData.get("contact_person") as string;
  const contactPhone = formData.get("contact_phone") as string;

  // Admin details
  const adminEmail = formData.get("admin_email") as string;
  const adminPassword = formData.get("admin_password") as string;
  const adminName = formData.get("admin_name") as string;

  try {
    // Create mosque
    const { data: mosque, error: mosqueError } = await supabase
      .from("mosques")
      .insert({
        name,
        address,
        sub_city: subCity,
        woreda,
        city,
        state,
        zip,
        email,
        phone,
        website,
        contact_person: contactPerson,
        contact_phone: contactPhone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (mosqueError) {
      console.error("Error creating mosque:", mosqueError);
      return redirect("/mosques?error=Failed to create mosque");
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", adminEmail)
      .maybeSingle();

    let userId;

    if (existingUser) {
      // User already exists, use their ID
      userId = existingUser.id;
    } else {
      // Create admin user
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          data: {
            full_name: adminName,
            role: "admin",
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
        },
      });

      if (authError) {
        console.error("Error creating admin user:", authError);
        return redirect("/mosques?error=Failed to create admin user");
      }

      if (!authUser.user) {
        console.error("No user returned from auth signup");
        return redirect("/mosques?error=Failed to create admin user");
      }

      userId = authUser.user.id;
    }

    // Create user in public.users if they don't exist
    if (!existingUser) {
      const { error: publicUserError } = await supabase.from("users").insert({
        id: userId,
        email: adminEmail,
        full_name: adminName,
        name: adminName,
        role: "admin",
        token_identifier: userId,
        user_id: userId,
      });

      if (publicUserError) {
        console.error("Error creating public user:", publicUserError);
        return redirect("/mosques?error=Failed to create user profile");
      }
    }

    // Create mosque_admin entry
    const { error: mosqueAdminError } = await supabase
      .from("mosque_admins")
      .insert({
        user_id: userId,
        mosque_id: mosque.id,
        role: "admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (mosqueAdminError) {
      console.error("Error creating mosque admin:", mosqueAdminError);
      return redirect("/mosques?error=Failed to assign mosque admin");
    }

    return redirect("/mosques?success=Mosque registered successfully");
  } catch (error) {
    console.error("Error in mosque registration:", error);
    return redirect("/mosques?error=Failed to register mosque");
  }
}
