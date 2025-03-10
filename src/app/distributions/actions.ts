"use server";

import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";

export async function createDistribution(formData: FormData) {
  const supabase = await createClient();

  const mosqueId = formData.get("mosque_id") as string;
  const beneficiaryId = formData.get("beneficiary_id") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as string;
  const description = formData.get("description") as string;
  const status = (formData.get("status") as string) || "pending";

  const { data, error } = await supabase.from("zakat_distributions").insert({
    mosque_id: mosqueId,
    beneficiary_id: beneficiaryId,
    amount,
    type,
    description,
    status,
    distribution_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error creating distribution:", error);
    throw new Error("Failed to create distribution");
  }

  return redirect("/distributions?success=Distribution added successfully");
}

export async function updateDistributionStatus(formData: FormData) {
  const supabase = await createClient();

  const beneficiaryId = formData.get("id") as string;
  const status = formData.get("status") as string;

  // First check if this beneficiary is already approved
  const { data: existingBeneficiary } = await supabase
    .from("beneficiaries")
    .select("status, family_members")
    .eq("id", beneficiaryId)
    .single();

  if (existingBeneficiary && existingBeneficiary.status === "approved") {
    console.log("Beneficiary already approved, cannot update status again");
    return { success: false, message: "Beneficiary already approved" };
  }

  // Proceed with update if not already approved
  const { error } = await supabase
    .from("beneficiaries")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", beneficiaryId);

  if (error) {
    console.error("Error updating beneficiary status:", error);
    throw new Error("Failed to update beneficiary status");
  }

  // If status is approved, create a distribution record
  if (status === "approved" && existingBeneficiary) {
    // Get wheat price for calculation
    const { data: wheatProduct } = await supabase
      .from("product_types")
      .select("price, id")
      .eq("name", "Wheat")
      .single();

    if (wheatProduct) {
      const familyMembers = existingBeneficiary.family_members || 1;
      const amount = familyMembers * 2.5 * wheatProduct.price;

      // Get mosque ID for this beneficiary
      const { data: beneficiaryData } = await supabase
        .from("beneficiaries")
        .select("mosque_id")
        .eq("id", beneficiaryId)
        .single();

      if (beneficiaryData?.mosque_id) {
        // Create distribution record
        const { error: distributionError } = await supabase
          .from("zakat_distributions")
          .insert({
            mosque_id: beneficiaryData.mosque_id,
            beneficiary_id: beneficiaryId,
            amount: amount,
            type: "cash",
            description: `Auto-generated distribution for approved beneficiary. Family members: ${familyMembers}`,
            status: "approved",
            distribution_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (distributionError) {
          console.error(
            "Error creating distribution record:",
            distributionError,
          );
        }
      }
    }
  }

  // Return success response
  return { success: true, message: `Beneficiary status updated to ${status}` };
}
