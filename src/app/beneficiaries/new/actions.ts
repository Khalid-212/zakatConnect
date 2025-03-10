"use server";

import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";

export async function createBeneficiary(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const region = formData.get("region") as string;
  const city = formData.get("city") as string;
  const subCity = formData.get("sub_city") as string;
  const woreda = formData.get("woreda") as string;
  const remark = formData.get("remark") as string;
  const familyMembers = parseInt(formData.get("family_members") as string) || 0;

  // Generate a unique code for the beneficiary
  const code = `BEN-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`;

  const { data, error } = await supabase.from("beneficiaries").insert({
    name,
    email,
    phone,
    region,
    city,
    sub_city: subCity,
    woreda,
    remark,
    code,
    family_members: familyMembers,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error creating beneficiary:", error);
    throw new Error("Failed to create beneficiary");
  }

  return redirect("/beneficiaries?success=Beneficiary registered successfully");
}
