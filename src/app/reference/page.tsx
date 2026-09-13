import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LIFTERS, FERRULE_REF, LIFTING_EYES, type Lifter } from "@/lib/catalog";

function groupLifters() {
  const map: Record<string, Lifter[]> = {};
  LIFTERS.forEach((l) => {
    const key = `${l.family} — ${l.series}`;
    (map[key] ||= []).push(l);
  });
  return map;
}

function edgeDist(l: Lifter, orientation: "tension" | "shear") {
  if (orientation === "shear") return l.edgeDistShear ?? l.edgeDist ?? "—";
  return l.edgeDistTension ?? l.edgeDist ?? "—";
}

function swlCell(l: Lifter) {
  if (l.swlTensionByPsi) {
    return Object.entries(l.swlTensionByPsi)
      .map(([psi, v]) => `@${psi}psi: ${v.toLocaleString()} lbs`)
      .join(" / ");
  }
  if (l.swlTension4000 !== undefined) {
    return `@2500psi: ${l.swlTension2500?.toLocaleString()} lbs / @4000psi: ${l.swlTension4000.toLocaleString()} lbs`;
  }
  return `${l.swlTension?.toLocaleString()} lbs`;
}

export default async function ReferencePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const groups = groupLifters();

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <h2 className="text-sm font-bold text-blue-900 mb-1">Lifter Catalog</h2>
        <p className="text-xs text-slate-500 mb-4">
          All values are from the ALP Supply 2026 Technical Manual &amp; Catalog for standard 4,000 psi / 150 pcf concrete (or the noted 2,500 psi column)
          and general rigging-angle/dynamic-load guidance from the same manual.
        </p>
        <div className="space-y-6">
          {Object.entries(groups).map(([group, list]) => (
            <div key={group}>
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wide mb-2">{group}</h3>
              <div className="overflow-x-auto border border-slate-200 rounded-md">
                <table className="w-full text-xs whitespace-nowrap">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-2 py-1.5">Part #</th>
                      <th className="text-left px-2 py-1.5">Size</th>
                      <th className="text-left px-2 py-1.5">Min. Slab/Panel Thickness</th>
                      <th className="text-left px-2 py-1.5">Min. Edge Dist. (Tension)</th>
                      <th className="text-left px-2 py-1.5">Min. Edge Dist. (Shear)</th>
                      <th className="text-left px-2 py-1.5">SWL Tension</th>
                      <th className="text-left px-2 py-1.5">SWL Shear</th>
                      <th className="text-left px-2 py-1.5">Weight (lbs ea.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((l) => (
                      <tr key={l.id} className="border-t border-slate-100">
                        <td className="px-2 py-1.5 font-mono">{l.id}</td>
                        <td className="px-2 py-1.5">{l.size}</td>
                        <td className="px-2 py-1.5">{l.minSlab}&quot;</td>
                        <td className="px-2 py-1.5">{edgeDist(l, "tension")}&quot;</td>
                        <td className="px-2 py-1.5">{edgeDist(l, "shear")}&quot;</td>
                        <td className="px-2 py-1.5">{swlCell(l)}</td>
                        <td className="px-2 py-1.5">{l.swlShear ? `${l.swlShear.toLocaleString()} lbs` : "n/a"}</td>
                        <td className="px-2 py-1.5">{l.weight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <h2 className="text-sm font-bold text-blue-900 mb-1">ALP Lifting Eyes (LPLE Series)</h2>
        <p className="text-xs text-slate-500 mb-3">
          Reusable rigging attachment that engages the head of an ALP Lifting Pin Anchor via a &quot;T&quot; slot. Not a cast-in anchor — never affects a
          part&apos;s pass/fail. Rated Load Range has a 5:1 safety factor.
        </p>
        <div className="overflow-x-auto border border-slate-200 rounded-md">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-2 py-1.5">Part #</th>
                <th className="text-left px-2 py-1.5">Load Range (tons)</th>
                <th className="text-left px-2 py-1.5">Ultimate Tension</th>
                <th className="text-left px-2 py-1.5">SWL (5:1)</th>
                <th className="text-left px-2 py-1.5">Weight (lbs)</th>
              </tr>
            </thead>
            <tbody>
              {LIFTING_EYES.map((e) => (
                <tr key={e.id} className="border-t border-slate-100">
                  <td className="px-2 py-1.5 font-mono">{e.id}</td>
                  <td className="px-2 py-1.5">{e.loadRangeTons}</td>
                  <td className="px-2 py-1.5">{e.ultimateTension.toLocaleString()} lbs</td>
                  <td className="px-2 py-1.5">{e.swl5to1.toLocaleString()} lbs</td>
                  <td className="px-2 py-1.5">{e.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {FERRULE_REF.map((group) => (
        <div key={group.group} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-bold text-blue-900 mb-3">{group.group}</h2>
          <div className="overflow-x-auto border border-slate-200 rounded-md">
            <table className="w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-2 py-1.5">Part #</th>
                  <th className="text-left px-2 py-1.5">Bolt Size</th>
                  <th className="text-left px-2 py-1.5">Min. Slab</th>
                  <th className="text-left px-2 py-1.5">Min. Edge Dist.</th>
                  <th className="text-left px-2 py-1.5">SWL Tension</th>
                  <th className="text-left px-2 py-1.5">SWL Shear</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row) => (
                  <tr key={row[0]} className="border-t border-slate-100">
                    {row.map((cell, i) => (
                      <td key={i} className="px-2 py-1.5">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <p className="text-xs text-slate-500 border-t border-slate-200 pt-3">
        Disclaimer: This tool is a preliminary sizing aid for internal workflow use only. Required shear is an app-level estimate, not an ALP-published
        formula, and each part&apos;s Pass/Fail is governed by whichever load (tension or shear) matches that part&apos;s selected Lift Orientation. It
        does not account for concrete strength below the published basis, lightweight concrete factors, reinforcement, openings, non-rectangular geometry,
        reduced edge-distance capacity reductions, or project-specific engineering requirements. Final anchor type, size, quantity, and placement must be
        verified and approved by a qualified engineer before any lift.
      </p>
    </div>
  );
}
