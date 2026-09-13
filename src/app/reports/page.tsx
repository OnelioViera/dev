import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ReportRow } from "@/lib/types";
import ReportsClient from "@/components/ReportsClient";

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<ReportRow[]>();

  return <ReportsClient initialReports={reports || []} />;
}
