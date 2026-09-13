import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/types";
import LibraryClient from "@/components/LibraryClient";

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<ProfileRow>();

  return <LibraryClient userId={user.id} inventory={(profile as ProfileRow)?.inventory || []} useFullCatalog={(profile as ProfileRow)?.use_full_catalog || false} />;
}
