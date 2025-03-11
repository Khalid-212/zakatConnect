import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import DistributionsPage from "./page";

export default async function DistributionsPageServer() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch distributions from database
  const { data: distributions, error } = await supabase
    .from("zakat_distributions")
    .select("*, beneficiaries(name), mosques(name)")
    .order("distribution_date", { ascending: false });

  // Fetch beneficiaries for approval
  const { data: beneficiaries } = await supabase
    .from("beneficiaries")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <DistributionsPage
      initialDistributions={distributions || []}
      initialBeneficiaries={beneficiaries || []}
    />
  );
}
