import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import CollectionsClient from "./collections-client";

interface Collection {
  id: string;
  amount: number;
  type: string;
  collection_date: string;
  mosque_id: string;
  product_type_id: string | null;
  product_types: {
    id: string;
    name: string;
    price: number;
  } | null;
  mosques: {
    id: string;
    name: string;
  } | null;
  givers: {
    id: string;
    name: string;
    phone: string;
  } | null;
}

export default async function CollectionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get user role and associated mosque
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  // Only super-admin and admin roles can access collections
  if (userData?.role !== "super-admin" && userData?.role !== "admin") {
    return redirect(
      "/dashboard?error=You do not have permission to access collections"
    );
  }

  // Get mosque admin's mosque if not super-admin
  let defaultMosqueId = null;
  if (userData?.role !== "super-admin") {
    const { data: mosqueAdmin } = await supabase
      .from("mosque_admins")
      .select("mosque_id")
      .eq("user_id", user.id)
      .single();
    defaultMosqueId = mosqueAdmin?.mosque_id;
  }

  // Fetch all mosques for filtering (if super-admin)
  const { data: mosques } = await supabase
    .from("mosques")
    .select("id, name")
    .order("name");

  // Fetch collections with mosque and product type information
  const collectionsQuery = supabase
    .from("zakat_collections")
    .select(
      `
      id,
      amount,
      type,
      collection_date,
      mosque_id,
      product_type_id,
      product_types:product_types (
        id,
        name,
        price
      ),
      mosques:mosques (
        id,
        name
      ),
      givers:givers (
        id,
        name,
        phone
      )
    `
    )
    .order("collection_date", { ascending: false });

  // If not super-admin, filter by mosque
  if (defaultMosqueId) {
    collectionsQuery.eq("mosque_id", defaultMosqueId);
  }

  const { data: rawCollections, error: collectionsError } =
    await collectionsQuery;

  if (collectionsError) {
    console.error("Error fetching collections:", collectionsError);
  }

  // Transform the collections data to match the expected type
  const collections = rawCollections?.map((collection: any) => ({
    ...collection,
    product_types: collection.product_types?.[0] || null,
    mosques: collection.mosques?.[0] || null,
    givers: collection.givers?.[0] || null,
  })) as Collection[] | null;

  // Fetch product types for the form
  const { data: productTypes } = await supabase
    .from("product_types")
    .select("id, name, price")
    .order("name");

  return (
    <CollectionsClient
      collections={collections || []}
      mosques={mosques || []}
      productTypes={productTypes || []}
      userRole={userData?.role}
      defaultMosqueId={defaultMosqueId}
    />
  );
}
