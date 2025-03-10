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

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  const { error } = await supabase
    .from("zakat_distributions")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating distribution status:", error);
    throw new Error("Failed to update distribution status");
  }

  return redirect(
    "/distributions?success=Distribution status updated successfully",
  );
}
