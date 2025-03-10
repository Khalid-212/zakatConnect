import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import ClientGiverPage from "./client-page";

export default async function NewGiverPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return <ClientGiverPage />;
}
