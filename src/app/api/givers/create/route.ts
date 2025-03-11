import { createClient } from "../../../../../supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const familyMembers = parseInt(formData.get("family_members") as string) || 0;
  const amount = parseFloat(formData.get("amount") as string) || 0;
  const productTypeId = formData.get("product_type_id") as string;
  const mosqueId = formData.get("mosque_id") as string;

  if (!mosqueId) {
    return NextResponse.json(
      { error: "Mosque ID is required" },
      { status: 400 },
    );
  }

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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (giverError) {
      console.error("Error creating giver:", giverError);
      return NextResponse.json(
        { error: "Failed to create giver" },
        { status: 400 },
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
        // We don't throw here because the giver was already created successfully
      }
    }

    return NextResponse.redirect(
      new URL("/givers?success=Giver registered successfully", request.url),
    );
  } catch (error) {
    console.error("Error in giver creation:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
