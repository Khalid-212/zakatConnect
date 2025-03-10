"use server";

import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";

export async function createProduct(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const price = parseFloat(formData.get("price") as string);

  const { data, error } = await supabase.from("product_types").insert({
    name,
    type,
    price,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error creating product:", error);
    throw new Error("Failed to create product");
  }

  return redirect("/products?success=Product added successfully");
}

export async function deleteProduct(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;

  const { error } = await supabase.from("product_types").delete().eq("id", id);

  if (error) {
    console.error("Error deleting product:", error);
    throw new Error("Failed to delete product");
  }

  return redirect("/products?success=Product deleted successfully");
}
