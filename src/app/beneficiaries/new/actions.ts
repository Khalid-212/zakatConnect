"use server";

import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createBeneficiary(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to register a beneficiary" };
  }

  try {
    // Get user role
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    let mosqueId = formData.get("mosque_id") as string;

    // If not super-admin, verify they can only add to their mosque
    if (userData?.role !== "super-admin") {
      const { data: mosqueAdmin } = await supabase
        .from("mosque_admins")
        .select("mosque_id")
        .eq("user_id", user.id)
        .single();

      if (!mosqueAdmin?.mosque_id) {
        return { error: "You are not associated with any mosque" };
      }

      // Force the mosque_id to be the user's assigned mosque
      mosqueId = mosqueAdmin.mosque_id;
    } else if (!mosqueId) {
      return { error: "Please select a mosque" };
    }

    // Extract form data
    const beneficiaryData = {
      name: formData.get("name"),
      region: formData.get("region"),
      city: formData.get("city"),
      sub_city: formData.get("sub_city"),
      woreda: formData.get("woreda"),
      email: formData.get("email") || null,
      phone: formData.get("phone"),
      family_members: parseInt(formData.get("family_members") as string),
      remark: formData.get("remark") || null,
      mosque_id: mosqueId,
      code: formData.get("code"),
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert beneficiary data
    const { error: insertError } = await supabase
      .from("beneficiaries")
      .insert([beneficiaryData]);

    if (insertError) {
      console.error("Error inserting beneficiary:", insertError);
      return { error: "Failed to register beneficiary" };
    }

    // Revalidate the beneficiaries page to show the new data
    revalidatePath("/beneficiaries");

    return { success: "Beneficiary registered successfully" };
  } catch (error) {
    console.error("Error in createBeneficiary:", error);
    return { error: "An unexpected error occurred" };
  }
}
