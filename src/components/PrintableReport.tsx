import { ANGLES, LIFTERS, PATTERNS } from "@/lib/catalog";
import {
  computePartCalc,
  evaluateAnchorEntry,
  getRoleLabel,
  locationLabel,
  orientationFullLabel,
  partOverallStatus,
  roleHasWall,
  type Part,
  type Settings,
} from "@/lib/calc";
import { partRowToPart } from "@/lib/mappers";
import type { ReportRow } from "@/lib/types";

const PART_STATUS_STYLE: Record<string, string> = {
  pass: "bg-green-50 text-green-700 border-green-300",
  fail: "bg-red-50 text-red-700 border-red-300",
  incomplete: "bg-amber-50 text-amber-700 border-amber-300",
  missing: "bg-slate-100 text-slate-500 border-slate-300",
};

// Rendered only for printing (`hidden print:block`) — a self-contained, full recreation of a
// saved report from its frozen settings/piece_roles/parts snapshot, independent of whatever
// the user's live "current job" looks like now. window.print() (see the button in
// ReportsClient) lets the browser's own print dialog save it as a PDF, which is far more
// robust across environments than rendering a PDF file ourselves.
export default function PrintableReport({ report }: { report: ReportRow }) {
  const settings = report.settings as unknown as Settings;
  const pieceRoles = report.piece_roles;
  const roleHasWallFn = (p: Part) => roleHasWall(pieceRoles, p);
  const angle = ANGLES.find((a) => a.sla === Number(settings.slaDeg));
  const pattern = PATTERNS.find((pt) => pt.id === settings.pickPattern);

  return (
    <div className="hidden print:block text-black text-sm">
      <div className="flex items-center justify-between border-b-2 border-blue-900 pb-3 mb-4">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/lindsay-precast.png" alt="Lindsay Precast" className="h-10 w-auto" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/alp-supply.png" alt="ALP Supply" className="h-10 w-auto" />
        </div>
        <div className="text-right">
          <h1 className="text-base font-bold text-blue-900">Lifting Anchor Analysis Report</h1>
          <p className="text-xs text-slate-600">Saved {new Date(report.created_at).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-3 text-xs">
        <div><span className="font-semibold">Customer:</span> {report.customer || "—"}</div>
        <div><span className="font-semibold">Job Name:</span> {report.job_name || "—"}</div>
        <div><span className="font-semibold">Job #:</span> {report.job_number || "—"}</div>
        <div><span className="font-semibold">Structure ID:</span> {report.structure_id || "—"}</div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4 text-[11px] border border-slate-300 rounded p-2 bg-slate-50">
        <div><span className="font-semibold">Pick Pattern:</span> {pattern?.label || settings.pickPattern}</div>
        <div><span className="font-semibold">Anchors Taking Load:</span> {settings.anchorsTakingLoad}</div>
        <div><span className="font-semibold">Sling Angle:</span> {settings.slaDeg}° SLA (+{angle?.pct || "—"} load)</div>
        <div><span className="font-semibold">Rigging Type:</span> {settings.riggingType === "chain" ? "Chain" : "Cable"}</div>
        <div><span className="font-semibold">Handling Condition:</span> {settings.handlingCondition}</div>
        <div><span className="font-semibold">Concrete Unit Weight:</span> {settings.unitWeightPcf} pcf</div>
        <div><span className="font-semibold">Concrete Strength:</span> {settings.concretePsi} psi</div>
        <div><span className="font-semibold">Result:</span> {report.result === "pass" ? "All parts pass" : report.result === "fail" ? "One or more parts fail" : "Incomplete"}</div>
      </div>

      {report.parts.map((part) => {
        const p = partRowToPart(part);
        const calc = computePartCalc(p, settings);
        const status = partOverallStatus(p, settings, roleHasWallFn);
        return (
          <div key={part.id} className="mb-3 border border-slate-300 rounded p-3 break-inside-avoid">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-sm">
                {part.name || "(unnamed part)"} <span className="font-normal text-slate-500 text-xs">— {getRoleLabel(pieceRoles, part.piece_role)}</span>
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PART_STATUS_STYLE[status.state]}`}>
                {status.state === "pass" ? "Pass" : status.state === "fail" ? "Fail" : status.state === "incomplete" ? "Incomplete" : "No anchors"}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mb-2">
              {part.weight_lbs.toLocaleString()} lbs · {orientationFullLabel(p)} · Required {Math.round(calc.reqTension).toLocaleString()} lb tension
              {p.liftOrientation === "shear" ? ` / ${Math.round(calc.reqShear).toLocaleString()} lb shear` : ""} per anchor at {calc.anchors} anchor
              {calc.anchors === 1 ? "" : "s"}
            </p>
            {(part.anchor_entries || []).length === 0 ? (
              <p className="text-[11px] text-slate-400">No anchors were assigned to this part.</p>
            ) : (
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="text-left border-b border-slate-300">
                    <th className="py-1 pr-2 font-semibold">Type</th>
                    <th className="py-1 pr-2 font-semibold">Location</th>
                    <th className="py-1 pr-2 font-semibold">Anchor</th>
                    <th className="py-1 pr-2 font-semibold">Capacity Used</th>
                    <th className="py-1 pr-2 font-semibold">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {(part.anchor_entries || []).map((entry) => {
                    const ev = evaluateAnchorEntry(entry, p, calc, settings, roleHasWallFn);
                    const lifter = entry.lifterId ? LIFTERS.find((l) => l.id === entry.lifterId) : null;
                    const utilPct = ev?.utilization !== null && ev?.utilization !== undefined ? Math.round(ev.utilization) : null;
                    return (
                      <tr key={entry.id} className="border-b border-slate-100">
                        <td className="py-1 pr-2">{entry.type === "stripper" ? "Form Stripper" : "Lifter"}</td>
                        <td className="py-1 pr-2">{locationLabel(entry.location)}</td>
                        <td className="py-1 pr-2">{lifter ? `${lifter.id} (${lifter.size})` : "— not selected —"}</td>
                        <td className="py-1 pr-2">{utilPct !== null ? `${utilPct}%` : "—"}</td>
                        <td className={`py-1 pr-2 font-semibold ${ev?.pass ? "text-green-700" : ev ? "text-red-700" : "text-slate-400"}`}>
                          {ev ? (ev.pass ? "Pass" : "Fail") : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        );
      })}

      <div className="mt-4 pt-3 border-t border-slate-300 text-[10px] text-slate-500">
        Generated by ALP Lifter Selector on {new Date().toLocaleString()} from a saved report snapshot. For engineering reference only — verify
        against current ALP product data and the project-specific rigging plan before use.
      </div>
    </div>
  );
}
