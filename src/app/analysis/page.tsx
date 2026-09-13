import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PartRow, ProfileRow } from "@/lib/types";
import AnalysisClient from "@/components/AnalysisClient";
import { LIFTERS } from "@/lib/catalog";

export default async function AnalysisPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<ProfileRow>();

  // Defensive fallback: a profile row should always exist (the
  // on_auth_user_created trigger from 0001_init.sql creates one the moment
  // an account signs up). If it's missing — most commonly because this
  // account was created before that migration was run — create it now
  // instead of crashing, seeded with the full catalog like the trigger does.
  if (!profile) {
    const { data: created } = await supabase
      .from("profiles")
      .insert({ id: user.id, inventory: LIFTERS.map((l) => l.id) })
      .select("*")
      .single<ProfileRow>();
    profile = created;
  }

  if (!profile) {
    throw new Error(
      "Could not load or create your profile. Make sure supabase/migrations/0001_init.sql has been run against this Supabase project (SQL Editor) and that its Row Level Security policies were created successfully."
    );
  }

  const { data: parts } = await supabase
    .from("parts")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true })
    .returns<PartRow[]>();

  return (
    <AnalysisClient
      userId={user.id}
      initialProfile={profile}
      initialParts={parts || []}
    />
  );
}
