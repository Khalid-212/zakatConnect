import { createClient } from "../../../supabase/server";
import DistributionsClient from "./distributions-client";

export default async function DistributionsPage() {
  const supabase = await createClient();

  // Fetch initial data
  const { data: distributions } = await supabase
    .from("zakat_distributions")
    .select("*, beneficiaries(name), mosques(name)")
    .order("distribution_date", { ascending: false });

  const { data: beneficiaries } = await supabase
    .from("beneficiaries")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <DistributionsClient
      initialDistributions={distributions || []}
      initialBeneficiaries={beneficiaries || []}
    />
  );
}
