"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ReportRow } from "@/lib/types";

const RESULT_STYLE: Record<string, string> = {
  pass: "bg-green-50 text-green-700 border-green-300",
  fail: "bg-red-50 text-red-700 border-red-300",
  incomplete: "bg-amber-50 text-amber-700 border-amber-300",
};

export default function ReportsClient({ initialReports }: { initialReports: ReportRow[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [reports, setReports] = useState(initialReports);
  const [open, setOpen] = useState<ReportRow | null>(null);

  async function remove(id: string) {
    if (!confirm("Delete this saved report? This cannot be undone.")) return;
    await supabase.from("reports").delete().eq("id", id);
    setReports((prev) => prev.filter((r) => r.id !== id));
    if (open?.id === id) setOpen(null);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
      <h2 className="text-sm font-bold text-blue-900 mb-1">Saved Reports</h2>
      <p className="text-xs text-slate-500 mb-3">Point-in-time snapshots of the structure, saved from New Analysis. Viewing a saved report does not change your live parts list.</p>

      {reports.length === 0 ? (
        <p className="text-sm text-slate-400 py-8 text-center">No saved reports yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-3">Saved</th>
                <th className="py-2 pr-3">Customer</th>
                <th className="py-2 pr-3">Job Name</th>
                <th className="py-2 pr-3">Job #</th>
                <th className="py-2 pr-3">Structure ID</th>
                <th className="py-2 pr-3">Parts</th>
                <th className="py-2 pr-3">Result</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 pr-3 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="py-2 pr-3">{r.customer || "—"}</td>
                  <td className="py-2 pr-3">{r.job_name || "—"}</td>
                  <td className="py-2 pr-3">{r.job_number || "—"}</td>
                  <td className="py-2 pr-3">{r.structure_id || "—"}</td>
                  <td className="py-2 pr-3">{r.parts_count}</td>
                  <td className="py-2 pr-3">
                    <span className={`text-[11px] font-bold border rounded-full px-2 py-0.5 ${RESULT_STYLE[r.result]}`}>{r.result}</span>
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    <button onClick={() => setOpen(r)} className="text-blue-900 underline text-xs mr-3">
                      View
                    </button>
                    <button onClick={() => remove(r.id)} className="text-red-600 underline text-xs">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setOpen(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-blue-900">{open.job_name || "(no job name)"}</h3>
                <p className="text-xs text-slate-500">
                  {open.customer} · Job #{open.job_number} · Structure {open.structure_id}
                </p>
              </div>
              <button onClick={() => setOpen(null)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">Saved {new Date(open.created_at).toLocaleString()}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-200 rounded-md overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-2 py-1.5">Name</th>
                    <th className="text-left px-2 py-1.5">Role</th>
                    <th className="text-left px-2 py-1.5">Weight</th>
                    <th className="text-left px-2 py-1.5">Anchors</th>
                  </tr>
                </thead>
                <tbody>
                  {open.parts.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100">
                      <td className="px-2 py-1.5">{p.name || "(unnamed)"}</td>
                      <td className="px-2 py-1.5">{p.piece_role}</td>
                      <td className="px-2 py-1.5">{p.weight_lbs.toLocaleString()} lbs</td>
                      <td className="px-2 py-1.5">{(p.anchor_entries || []).map((e) => e.lifterId || "—").join(", ") || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
