"use server";

import { createClient } from "../../../../supabase/client-server";
import { redirect } from "next/navigation";

export async function createGiver(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const familyMembers = parseInt(formData.get("family_members") as string) || 0;
  const amount = parseFloat(formData.get("amount") as string) || 0;
  const productTypeId = formData.get("product_type_id") as string;
  const mosqueId = formData.get("mosque_id") as string;

  // Generate a unique code for the giver
  const timestamp = Date.now().toString().slice(-6);
  const randomPart = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  const code = `GIV-${timestamp}-${randomPart}`;

  try {
    // Create giver
    const { data: giver, error: giverError } = await supabase
      .from("givers")
      .insert({
        name,
        email,
        phone,
        address,
        family_members: familyMembers,
        code,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (giverError) {
      console.error("Error creating giver:", giverError);
      return redirect(
        `/givers?error=Failed to create giver: ${giverError.message}`,
      );
    }

    // Create zakat collection record if amount is provided
    if (amount > 0) {
      const { data: collection, error: collectionError } = await supabase
        .from("zakat_collections")
        .insert({
          mosque_id: mosqueId,
          giver_id: giver.id,
          amount,
          type: "cash",
          product_type_id: productTypeId || null,
          collection_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (collectionError) {
        console.error("Error creating collection:", collectionError);
        return redirect(
          `/givers?success=Giver ${name} registered with code: ${code}, but collection could not be recorded: ${collectionError.message}`,
        );
      }
    }

    return redirect(
      `/givers?success=Giver ${name} registered successfully with code: ${code}`,
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return redirect(
      `/givers?error=An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
