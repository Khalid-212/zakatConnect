"use server";

import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";

export async function createCollection(formData: FormData) {
  const supabase = await createClient();

  const mosqueId = formData.get("mosque_id") as string;
  const giverId = formData.get("giver_id") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as string;
  const description = formData.get("description") as string;
  const productTypeId = formData.get("product_type_id") as string;

  const { data, error } = await supabase.from("zakat_collections").insert({
    mosque_id: mosqueId,
    giver_id: giverId || null,
    amount,
    type,
    description,
    product_type_id: productTypeId || null,
    collection_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error creating collection:", error);
    throw new Error("Failed to create collection");
  }

  return redirect("/collections?success=Collection added successfully");
}
