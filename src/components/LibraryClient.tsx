"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LIFTERS, type Lifter } from "@/lib/catalog";

export default function LibraryClient({ userId, inventory, useFullCatalog }: { userId: string; inventory: string[]; useFullCatalog: boolean }) {
  const supabase = useMemo(() => createClient(), []);
  const [checked, setChecked] = useState<Set<string>>(new Set(inventory));
  const [fullCatalog, setFullCatalog] = useState(useFullCatalog);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  async function persist(next: Set<string>) {
    setSaving(true);
    await supabase.from("profiles").update({ inventory: Array.from(next) }).eq("id", userId);
    setSaving(false);
  }

  async function persistFullCatalog(v: boolean) {
    setFullCatalog(v);
    await supabase.from("profiles").update({ use_full_catalog: v }).eq("id", userId);
  }

  function toggle(id: string) {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChecked(next);
    persist(next);
  }

  function selectAll() {
    const next = new Set(LIFTERS.map((l) => l.id));
    setChecked(next);
    persist(next);
  }
  function clearAll() {
    const next = new Set<string>();
    setChecked(next);
    persist(next);
  }

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? LIFTERS.filter((l) => l.id.toLowerCase().includes(q) || l.size.toLowerCase().includes(q)) : LIFTERS;
    const map: Record<string, Lifter[]> = {};
    filtered.forEach((l) => {
      const key = `${l.family} — ${l.series}`;
      (map[key] ||= []).push(l);
    });
    return map;
  }, [query]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 max-w-4xl">
      <h2 className="text-sm font-bold text-blue-900 mb-1">My Lifter Library</h2>
      <p className="text-xs text-slate-500 mb-3">
        Check the ALP lifters you keep on hand. Each part&apos;s lifter dropdown only offers these unless &quot;entire catalog&quot; is toggled in New
        Analysis. {saving && <span className="text-blue-700">Saving…</span>}
      </p>

      <label className="flex items-center gap-2 text-xs text-slate-700 mb-3">
        <input type="checkbox" checked={fullCatalog} onChange={(e) => persistFullCatalog(e.target.checked)} />
        Always offer the entire ALP catalog (ignore this library)
      </label>

      <input className="input mb-3" placeholder="Search by part # or size…" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="flex gap-2 mb-4">
        <button onClick={selectAll} className="btn-secondary">
          Select All
        </button>
        <button onClick={clearAll} className="btn-secondary">
          Clear All
        </button>
      </div>

      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
        {Object.entries(groups).map(([group, list]) => (
          <div key={group}>
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wide mb-1">{group}</h3>
            <div className="space-y-1">
              {list.map((l) => (
                <label key={l.id} className="flex items-center gap-2 text-sm py-0.5">
                  <input type="checkbox" checked={checked.has(l.id)} onChange={() => toggle(l.id)} />
                  <span className="font-mono text-xs text-slate-500 w-28 shrink-0">{l.id}</span>
                  <span>{l.size}</span>
                  <span className="text-xs text-slate-400">
                    (SWL Tension {l.swlTension ? l.swlTension.toLocaleString() : l.swlTensionByPsi ? Math.max(...Object.values(l.swlTensionByPsi)).toLocaleString() : "n/a"} lbs)
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
