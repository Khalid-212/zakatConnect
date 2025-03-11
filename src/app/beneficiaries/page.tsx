import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import BeneficiariesClient from "./beneficiaries-client";

export default async function BeneficiariesPage() {
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

  // Only super-admin and admin roles can access beneficiaries
  if (userData?.role !== "super-admin" && userData?.role !== "admin") {
    return redirect(
      "/dashboard?error=You do not have permission to access beneficiaries"
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

  // Fetch beneficiaries from database with their status
  const beneficiariesQuery = supabase
    .from("beneficiaries")
    .select("*")
    .order("created_at", { ascending: false });

  // If not super-admin, filter by mosque
  if (defaultMosqueId) {
    beneficiariesQuery.eq("mosque_id", defaultMosqueId);
  }

  const { data: beneficiaries, error } = await beneficiariesQuery;

  if (error) {
    console.error("Error fetching beneficiaries:", error);
  }

  // If a beneficiary doesn't have a status, we'll set a default
  beneficiaries?.forEach((beneficiary) => {
    if (!beneficiary.status) {
      beneficiary.status = "active";
    }
  });

  return (
    <BeneficiariesClient
      beneficiaries={beneficiaries || []}
      userRole={userData?.role}
      defaultMosqueId={defaultMosqueId}
    />
  );
}
