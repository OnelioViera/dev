"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { ANGLES, LIFTERS, PATTERNS, type Lifter } from "@/lib/catalog";
import {
  computePartCalc,
  entryGoverningNumbers,
  evaluateAnchorEntry,
  evaluateLifter,
  evaluateStripperEntry,
  newAnchorEntry,
  outsideDims,
  partOverallStatus,
  roleHasWall,
  roleIdGen,
  scopedLifters,
  type AnchorEntry,
  type PartCalc,
  type PieceRole,
} from "@/lib/calc";
import { partRowToPart, profileToSettings } from "@/lib/mappers";
import type { PartRow, ProfileRow } from "@/lib/types";

const STATUS_STYLE: Record<string, string> = {
  pass: "bg-green-50 text-green-700 border-green-300",
  fail: "bg-red-50 text-red-700 border-red-300",
  incomplete: "bg-amber-50 text-amber-700 border-amber-300",
  missing: "bg-slate-100 text-slate-500 border-slate-300",
};
const STATUS_LABEL: Record<string, string> = {
  pass: "Pass",
  fail: "Fail",
  incomplete: "Incomplete",
  missing: "No anchors",
};

function blankPartRow(userId: string, roleId: string, sortOrder: number): Omit<PartRow, "id" | "created_at" | "updated_at"> {
  return {
    user_id: userId,
    name: "",
    piece_role: roleId,
    shape: "rect",
    length_in: 0,
    width_in: 0,
    diameter_in: 0,
    wall_thickness_in: 0,
    legacy_size_note: null,
    weight_lbs: 0,
    cubic_yards: 0,
    height: 0,
    thickness_in: 0,
    edge_distance_top_in: 0,
    edge_distance_bottom_in: 0,
    edge_distance_side_in: 0,
    lift_orientation: "tension",
    anchor_entries: [],
    strip_psi: null,
    notes: "",
    sort_order: sortOrder,
  };
}

export default function AnalysisClient({
  userId,
  initialProfile,
  initialParts,
}: {
  userId: string;
  initialProfile: ProfileRow;
  initialParts: PartRow[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<ProfileRow>(initialProfile);
  const [parts, setParts] = useState<PartRow[]>(initialParts);
  const [openPartId, setOpenPartId] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [rolesOpen, setRolesOpen] = useState(false);
  const debounceRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const settings = profileToSettings(profile);
  const pieceRoles = profile.piece_roles;
  const roleHasWallFn = (p: ReturnType<typeof partRowToPart>) => roleHasWall(pieceRoles, p);
  const lifters = scopedLifters(profile.inventory, settings);
  const liftersById: Record<string, Lifter> = {};
  LIFTERS.forEach((l) => (liftersById[l.id] = l));
  const groupedLifters: Record<string, Lifter[]> = {};
  lifters.forEach((l) => {
    const key = `${l.family} — ${l.series}`;
    (groupedLifters[key] ||= []).push(l);
  });

  function flash(msg: string) {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg((m) => (m === msg ? null : m)), 1800);
  }

  // ---- Job info + shared settings (stored on profiles) --------------------
  function updateProfileField<K extends keyof ProfileRow>(field: K, value: ProfileRow[K], debounce = true) {
    setProfile((p) => ({ ...p, [field]: value }));
    const key = `profile:${String(field)}`;
    if (debounceRefs.current[key]) clearTimeout(debounceRefs.current[key]);
    const write = () =>
      supabase
        .from("profiles")
        .update({ [field]: value })
        .eq("id", userId)
        .then(() => flash("Saved"));
    if (debounce) {
      debounceRefs.current[key] = setTimeout(write, 500);
    } else {
      write();
    }
  }

  function onPickPatternChange(id: string) {
    const p = PATTERNS.find((x) => x.id === id);
    updateProfileField("pick_pattern", id, false);
    if (p && p.anchors !== null) {
      updateProfileField("anchors_taking_load", p.anchors, false);
    }
  }

  // ---- Parts CRUD -----------------------------------------------------------
  async function addPart() {
    const roleId = pieceRoles[0]?.id || "lid";
    const draft = blankPartRow(userId, roleId, parts.length);
    const { data, error } = await supabase.from("parts").insert(draft).select().single<PartRow>();
    if (error) {
      alert("Could not add part: " + error.message);
      return;
    }
    setParts((prev) => [...prev, data]);
    setOpenPartId(data.id);
  }

  function updatePartField<K extends keyof PartRow>(id: string, field: K, value: PartRow[K], debounce = true) {
    setParts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    const key = `part:${id}:${String(field)}`;
    if (debounceRefs.current[key]) clearTimeout(debounceRefs.current[key]);
    const write = () =>
      supabase
        .from("parts")
        .update({ [field]: value })
        .eq("id", id)
        .then(() => flash("Saved"));
    if (debounce) {
      debounceRefs.current[key] = setTimeout(write, 500);
    } else {
      write();
    }
  }

  async function deletePart(id: string) {
    if (!confirm("Delete this part?")) return;
    await supabase.from("parts").delete().eq("id", id);
    setParts((prev) => prev.filter((p) => p.id !== id));
    if (openPartId === id) setOpenPartId(null);
  }

  function anchorEntries(part: PartRow) {
    return part.anchor_entries || [];
  }

  function saveEntries(part: PartRow, entries: AnchorEntry[]) {
    updatePartField(part.id, "anchor_entries", entries, false);
  }

  function addEntry(part: PartRow, type: "lifter" | "stripper") {
    saveEntries(part, [...anchorEntries(part), newAnchorEntry({ type, location: type === "stripper" ? "bottom" : "top" })]);
  }

  function removeEntry(part: PartRow, entryId: string) {
    saveEntries(part, anchorEntries(part).filter((e) => e.id !== entryId));
  }

  function updateEntry(part: PartRow, entryId: string, patch: Partial<AnchorEntry>) {
    saveEntries(part, anchorEntries(part).map((e) => (e.id === entryId ? { ...e, ...patch } : e)));
  }

  // ---- Piece roles manager ---------------------------------------------
  function saveRoles(next: PieceRole[]) {
    updateProfileField("piece_roles", next, false);
  }
  function addRole() {
    saveRoles([...pieceRoles, { id: roleIdGen(), label: "New Role", hasWall: false }]);
  }
  function deleteRole(id: string) {
    if (pieceRoles.length <= 1) return;
    saveRoles(pieceRoles.filter((r) => r.id !== id));
  }

  // ---- Summary ------------------------------------------------------------
  const statuses = parts.map((row) => partOverallStatus(partRowToPart(row), settings, roleHasWallFn));
  const counts = { pass: 0, fail: 0, incomplete: 0, missing: 0 };
  statuses.forEach((s) => (counts[s.state] += 1));
  const totalWeight = parts.reduce((sum, p) => sum + (p.weight_lbs || 0), 0);
  const totalCuYd = parts.reduce((sum, p) => sum + (p.cubic_yards || 0), 0);
  const overallResult: "pass" | "fail" | "incomplete" =
    parts.length === 0 ? "incomplete" : counts.fail > 0 ? "fail" : counts.incomplete > 0 || counts.missing > 0 ? "incomplete" : "pass";

  async function saveReport() {
    const snapshot = {
      user_id: userId,
      customer: profile.customer,
      job_name: profile.job_name,
      job_number: profile.job_number,
      structure_id: profile.structure_id,
      settings,
      piece_roles: pieceRoles,
      parts,
      parts_count: parts.length,
      result: overallResult,
    };
    const { error } = await supabase.from("reports").insert(snapshot);
    if (error) {
      alert("Could not save report: " + error.message);
      return;
    }
    flash("Report saved — see Saved Reports");
  }

  return (
    <div className="space-y-4">
      {savedMsg && (
        <div className="fixed top-4 right-4 z-50 rounded-md bg-slate-900 text-white text-xs px-3 py-2 shadow-lg">
          {savedMsg}
        </div>
      )}

      {/* Job Information */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <h2 className="text-sm font-bold text-blue-900 mb-3">Job Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Field label="Customer">
            <input className="input" value={profile.customer} onChange={(e) => updateProfileField("customer", e.target.value)} placeholder="e.g. Acme Utilities" />
          </Field>
          <Field label="Job Name">
            <input className="input" value={profile.job_name} onChange={(e) => updateProfileField("job_name", e.target.value)} placeholder="e.g. Riverside WRF" />
          </Field>
          <Field label="Job #">
            <input className="input" value={profile.job_number} onChange={(e) => updateProfileField("job_number", e.target.value)} placeholder="e.g. 26-0023CO" />
          </Field>
          <Field label="Structure ID">
            <input className="input" value={profile.structure_id} onChange={(e) => updateProfileField("structure_id", e.target.value)} placeholder="e.g. HH-45-01" />
          </Field>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 items-start">
        {/* Parts list */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-blue-900">Parts List (This Structure)</h2>
            <button onClick={addPart} className="btn-primary">
              + Add Part
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Every field is editable in place; each part&apos;s status recalculates live against the rigging settings on the right.
          </p>

          {parts.length === 0 ? (
            <div className="text-center text-sm text-slate-400 py-10">No parts added yet.</div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-200">
              {parts.map((part, idx) => {
                const status = statuses[idx];
                return (
                  <PartRowEditor
                    key={part.id}
                    part={part}
                    status={status}
                    open={openPartId === part.id}
                    onToggle={() => setOpenPartId(openPartId === part.id ? null : part.id)}
                    pieceRoles={pieceRoles}
                    groupedLifters={groupedLifters}
                    liftersById={liftersById}
                    settings={settings}
                    updatePartField={updatePartField}
                    deletePart={deletePart}
                    addEntry={addEntry}
                    removeEntry={removeEntry}
                    updateEntry={updateEntry}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Rigging & Concrete Settings + Summary */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-bold text-blue-900 mb-1">Rigging &amp; Concrete Settings</h2>
            <p className="text-xs text-slate-500 mb-3">Shared across every part — changes recalculate every part&apos;s status.</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pick Pattern" full>
                <select className="input" value={profile.pick_pattern} onChange={(e) => onPickPatternChange(e.target.value)}>
                  {PATTERNS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">{PATTERNS.find((p) => p.id === profile.pick_pattern)?.hint}</p>
              </Field>
              <Field label="Anchors Taking the Load">
                <input
                  type="number"
                  className="input"
                  value={profile.anchors_taking_load}
                  readOnly={PATTERNS.find((p) => p.id === profile.pick_pattern)?.anchors !== null}
                  onChange={(e) => updateProfileField("anchors_taking_load", parseInt(e.target.value, 10) || 1, false)}
                />
              </Field>
              <Field label="Sling / Rigging Angle">
                <select className="input" value={profile.sla_deg} onChange={(e) => updateProfileField("sla_deg", parseFloat(e.target.value), false)}>
                  {ANGLES.map((a) => (
                    <option key={a.sla} value={a.sla}>
                      {a.sla}° SLA (+{a.pct} load{a.band === "donotuse" ? ", DO NOT USE" : a.band === "caution" ? ", caution" : ""})
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Rigging Type">
                <select className="input" value={profile.rigging_type} onChange={(e) => updateProfileField("rigging_type", e.target.value, false)}>
                  <option value="cable">Cable</option>
                  <option value="chain">Chain</option>
                </select>
              </Field>
              <Field label="Handling Condition">
                <select className="input" value={profile.handling_condition} onChange={(e) => updateProfileField("handling_condition", e.target.value, false)}>
                  <option value="stationary">Stationary crane</option>
                  <option value="smooth">Smooth / traveling</option>
                  <option value="uneven">Uneven / rough terrain</option>
                </select>
              </Field>
              <Field label="Concrete Unit Weight (pcf)">
                <input type="number" className="input" value={profile.unit_weight_pcf} onChange={(e) => updateProfileField("unit_weight_pcf", parseFloat(e.target.value) || 150)} />
              </Field>
              <Field label="Concrete Strength f'c (psi)">
                <input type="number" className="input" value={profile.concrete_psi} onChange={(e) => updateProfileField("concrete_psi", parseFloat(e.target.value) || 4000)} />
              </Field>
              <Field label=" ">
                <label className="flex items-center gap-2 text-xs text-slate-600 mt-2">
                  <input type="checkbox" checked={profile.use_full_catalog} onChange={(e) => updateProfileField("use_full_catalog", e.target.checked, false)} />
                  Offer lifters from entire ALP catalog (default: My Lifter Library only)
                </label>
              </Field>
            </div>
            <button onClick={() => setRolesOpen((v) => !v)} className="text-xs text-blue-900 underline mt-3">
              {rolesOpen ? "Hide" : "Manage"} piece roles
            </button>
            {rolesOpen && (
              <div className="mt-2 border border-slate-200 rounded-md p-2 space-y-1">
                {pieceRoles.map((r) => (
                  <div key={r.id} className="flex items-center gap-2 text-xs">
                    <input
                      className="input flex-1"
                      value={r.label}
                      onChange={(e) => saveRoles(pieceRoles.map((x) => (x.id === r.id ? { ...x, label: e.target.value } : x)))}
                    />
                    <label className="flex items-center gap-1 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={r.hasWall}
                        onChange={(e) => saveRoles(pieceRoles.map((x) => (x.id === r.id ? { ...x, hasWall: e.target.checked } : x)))}
                      />
                      has wall
                    </label>
                    <button onClick={() => deleteRole(r.id)} className="text-red-600">
                      ✕
                    </button>
                  </div>
                ))}
                <button onClick={addRole} className="text-xs text-blue-900 underline">
                  + Add role
                </button>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-bold text-blue-900 mb-2">Structure Summary &amp; Report</h2>
            {parts.length === 0 ? (
              <p className="text-sm text-slate-400">Add parts above to see a summary.</p>
            ) : (
              <div className="space-y-1 text-sm mb-3">
                <SummaryRow k="Parts" v={String(parts.length)} />
                <SummaryRow k="Total Weight" v={`${Math.round(totalWeight).toLocaleString()} lbs`} />
                <SummaryRow k="Total Concrete" v={`${totalCuYd.toFixed(2)} yd³`} />
                <SummaryRow k="Pass" v={String(counts.pass)} />
                <SummaryRow k="Fail" v={String(counts.fail)} />
                <SummaryRow k="Incomplete / No anchors" v={String(counts.incomplete + counts.missing)} />
                <div className={`mt-2 rounded-md border px-3 py-2 text-xs font-bold ${STATUS_STYLE[overallResult]}`}>
                  Overall: {overallResult === "pass" ? "All parts pass" : overallResult === "fail" ? "One or more parts fail" : "Analysis incomplete"}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <button onClick={saveReport} className="btn-primary">
                Save Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-dashed border-slate-200 py-1">
      <span className="text-slate-500">{k}</span>
      <span className="font-bold">{v}</span>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

// A number input that shows a grayed-out "0" placeholder instead of a hard 0 sitting in the
// field. A stored value of 0 (the default for a brand-new part) displays as blank; typing a
// real number fills it in, and clearing the field goes back to the blank placeholder (which
// still saves as 0 underneath — these fields don't have a separate "unset" state in the DB).
function NumberField({
  value,
  onChange,
  className = "input",
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}) {
  return (
    <input
      type="number"
      className={`${className} placeholder:text-slate-400`}
      value={value === 0 ? "" : value}
      placeholder="0"
      onChange={(e) => onChange(e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
    />
  );
}

function PartRowEditor({
  part,
  status,
  open,
  onToggle,
  pieceRoles,
  groupedLifters,
  liftersById,
  settings,
  updatePartField,
  deletePart,
  addEntry,
  removeEntry,
  updateEntry,
}: {
  part: PartRow;
  status: ReturnType<typeof partOverallStatus>;
  open: boolean;
  onToggle: () => void;
  pieceRoles: PieceRole[];
  groupedLifters: Record<string, Lifter[]>;
  liftersById: Record<string, Lifter>;
  settings: ReturnType<typeof profileToSettings>;
  updatePartField: <K extends keyof PartRow>(id: string, field: K, value: PartRow[K], debounce?: boolean) => void;
  deletePart: (id: string) => void;
  addEntry: (part: PartRow, type: "lifter" | "stripper") => void;
  removeEntry: (part: PartRow, entryId: string) => void;
  updateEntry: (part: PartRow, entryId: string, patch: Partial<AnchorEntry>) => void;
}) {
  const isWall = roleHasWall(pieceRoles, partRowToPart(part));
  const calc = computePartCalc(partRowToPart(part), settings);
  const out = outsideDims(pieceRoles, partRowToPart(part));

  return (
    <div>
      <button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 text-sm">
        <span className="flex items-center gap-3 min-w-0">
          <span className="font-semibold truncate">{part.name || "(unnamed part)"}</span>
          <span className="text-xs text-slate-500 hidden sm:inline">{pieceRoles.find((r) => r.id === part.piece_role)?.label}</span>
        </span>
        <span className="flex items-center gap-2 shrink-0">
          {status.worstUtil !== null && status.worstUtil !== undefined && (
            <span className="text-[11px] text-slate-500 hidden sm:inline">{Math.round(status.worstUtil)}% capacity</span>
          )}
          <span className={`text-[11px] font-bold border rounded-full px-2 py-0.5 ${STATUS_STYLE[status.state]}`}>{STATUS_LABEL[status.state]}</span>
        </span>
      </button>

      {open && (
        <div className="bg-slate-50 border-t border-slate-200 px-3 py-3 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Part Name / Mark">
              <input className="input" value={part.name} onChange={(e) => updatePartField(part.id, "name", e.target.value)} placeholder="e.g. LID, BASE, RISER-1" />
            </Field>
            <Field label="Piece Role">
              <select className="input" value={part.piece_role} onChange={(e) => updatePartField(part.id, "piece_role", e.target.value, false)}>
                {pieceRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Shape">
            <select className="input" value={part.shape} onChange={(e) => updatePartField(part.id, "shape", e.target.value as "rect" | "round", false)}>
              <option value="rect">Rectangular / Square</option>
              <option value="round">Round</option>
            </select>
          </Field>

          <p className="text-[11px] text-slate-500">
            {isWall
              ? "Enter INSIDE dimensions. The outside dimension (inside + 2× wall thickness) is calculated automatically from Wall Thickness."
              : "Enter the actual outside dimensions of this piece."}
          </p>

          {part.shape === "round" ? (
            <Field label="Diameter (in)">
              <NumberField value={part.diameter_in} onChange={(v) => updatePartField(part.id, "diameter_in", v)} />
              {out?.diameterIn && <p className="text-[11px] text-slate-500 mt-1">→ Ø{out.diameterIn.toFixed(2)}&quot; outside</p>}
            </Field>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Length (in)">
                <NumberField value={part.length_in} onChange={(v) => updatePartField(part.id, "length_in", v)} />
              </Field>
              <Field label="Width (in)">
                <NumberField value={part.width_in} onChange={(v) => updatePartField(part.id, "width_in", v)} />
              </Field>
              {out?.lengthIn && (
                <p className="text-[11px] text-slate-500 col-span-2">
                  → {out.lengthIn.toFixed(2)}&quot; × {out.widthIn?.toFixed(2)}&quot; outside
                </p>
              )}
            </div>
          )}

          {isWall && (
            <Field label="Wall Thickness (in)">
              <NumberField value={part.wall_thickness_in} onChange={(v) => updatePartField(part.id, "wall_thickness_in", v)} />
            </Field>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label="Weight (lbs)">
              <NumberField value={part.weight_lbs} onChange={(v) => updatePartField(part.id, "weight_lbs", v)} />
            </Field>
            <Field label="Cubic Yards">
              <NumberField value={part.cubic_yards} onChange={(v) => updatePartField(part.id, "cubic_yards", v)} />
            </Field>
            <Field label="Height (in)">
              <NumberField value={part.height} onChange={(v) => updatePartField(part.id, "height", v)} />
            </Field>
            <Field label={isWall ? "Wall-check thickness" : "Lid / Slab Thickness (in)"}>
              <NumberField value={part.thickness_in} onChange={(v) => updatePartField(part.id, "thickness_in", v)} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Edge Distance — Top (in)">
              <NumberField value={part.edge_distance_top_in} onChange={(v) => updatePartField(part.id, "edge_distance_top_in", v)} />
            </Field>
            <Field label="Edge Distance — Bottom (in)">
              <NumberField value={part.edge_distance_bottom_in} onChange={(v) => updatePartField(part.id, "edge_distance_bottom_in", v)} />
            </Field>
            <Field label="Edge Distance — Side (in)">
              <NumberField value={part.edge_distance_side_in} onChange={(v) => updatePartField(part.id, "edge_distance_side_in", v)} />
            </Field>
          </div>

          <Field label="Lift Orientation">
            <select className="input" value={part.lift_orientation} onChange={(e) => updatePartField(part.id, "lift_orientation", e.target.value as "tension" | "shear", false)}>
              <option value="tension">Vertical / Flat Pick (tension)</option>
              <option value="shear">Tilt-Up / Laydown Pick (shear)</option>
            </select>
          </Field>

          <Field label="Notes (optional)">
            <textarea className="input" rows={2} value={part.notes} onChange={(e) => updatePartField(part.id, "notes", e.target.value)} />
          </Field>

          {/* Anchor entries */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wide">Anchors &amp; Form Strippers</h3>
              <div className="flex gap-2">
                <button onClick={() => addEntry(part, "lifter")} className="btn-secondary">
                  + Lifter
                </button>
                <button onClick={() => addEntry(part, "stripper")} className="btn-secondary">
                  + Form Stripper
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 mb-2">
              Required: {Math.round(calc.reqTension).toLocaleString()} lb tension
              {part.lift_orientation === "shear" ? ` / ${Math.round(calc.reqShear).toLocaleString()} lb shear (shear-governed)` : ""} per anchor at {calc.anchors} anchor
              {calc.anchors === 1 ? "" : "s"}.
            </p>
            <div className="space-y-2">
              {(part.anchor_entries || []).map((entry) => (
                <AnchorEntryRow
                  key={entry.id}
                  entry={entry}
                  part={part}
                  pieceRoles={pieceRoles}
                  groupedLifters={groupedLifters}
                  liftersById={liftersById}
                  settings={settings}
                  onChange={(patch) => updateEntry(part, entry.id, patch)}
                  onRemove={() => removeEntry(part, entry.id)}
                />
              ))}
              {(part.anchor_entries || []).length === 0 && <p className="text-xs text-slate-400">No anchors added yet — this part shows &quot;No anchors&quot;.</p>}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-200">
            <button onClick={() => deletePart(part.id)} className="btn-danger">
              Delete Part
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AnchorEntryRow({
  entry,
  part,
  pieceRoles,
  groupedLifters,
  liftersById,
  settings,
  onChange,
  onRemove,
}: {
  entry: AnchorEntry;
  part: PartRow;
  pieceRoles: PieceRole[];
  groupedLifters: Record<string, Lifter[]>;
  liftersById: Record<string, Lifter>;
  settings: ReturnType<typeof profileToSettings>;
  onChange: (patch: Partial<AnchorEntry>) => void;
  onRemove: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const lifter = entry.lifterId ? liftersById[entry.lifterId] : null;
  const p = partRowToPart(part);
  const roleHasWallFn = (pt: ReturnType<typeof partRowToPart>) => roleHasWall(pieceRoles, pt);
  const calc = computePartCalc(p, settings);

  // Work out, for every lifter in the (library- or catalog-scoped) list, whether it would
  // actually pass for THIS entry's type + location on THIS part's current dimensions — so the
  // dropdown can default to only offering options that will work instead of making the user
  // pick blind and land on Fail.
  const passingIds = new Set<string>();
  Object.values(groupedLifters).forEach((list) => {
    list.forEach((l) => {
      const ev =
        entry.type === "stripper"
          ? evaluateStripperEntry(l, p, settings, entry.location, roleHasWallFn)
          : evaluateLifter(l, calc, p, settings, entry.location, roleHasWallFn);
      if (ev.pass) passingIds.add(l.id);
    });
  });
  const anyPassing = passingIds.size > 0;

  const visibleGroups: Record<string, Lifter[]> = {};
  Object.entries(groupedLifters).forEach(([group, list]) => {
    const visible = list.filter((l) => showAll || passingIds.has(l.id) || l.id === entry.lifterId);
    if (visible.length) visibleGroups[group] = visible;
  });

  return (
    <div className="border border-slate-200 rounded-md bg-white p-2">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <select className="input !w-auto" value={entry.type} onChange={(e) => onChange({ type: e.target.value as AnchorEntry["type"] })}>
          <option value="lifter">Lifter</option>
          <option value="stripper">Form Stripper</option>
        </select>
        <select className="input !w-auto" value={entry.location} onChange={(e) => onChange({ location: e.target.value as AnchorEntry["location"] })}>
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
          <option value="side">Side</option>
        </select>
        <select className="input flex-1 min-w-[220px]" value={entry.lifterId || ""} onChange={(e) => onChange({ lifterId: e.target.value || null })}>
          <option value="">— not selected —</option>
          {Object.entries(visibleGroups).map(([group, list]) => (
            <optgroup label={group} key={group}>
              {list.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.id} ({l.size})
                  {!passingIds.has(l.id) ? " — does not meet requirements" : ""}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <button onClick={onRemove} className="text-red-600 font-bold px-1">
          ✕
        </button>
      </div>
      <label className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500">
        <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
        Show all options (including ones that won&apos;t meet requirements)
      </label>
      {!anyPassing && !showAll && (
        <p className="mt-1 text-[11px] text-amber-700">
          Nothing in {settings.useFullCatalog ? "the ALP catalog" : "your Lifter Library"} currently meets the thickness / edge distance / load requirements for
          this entry — check the part&apos;s dimensions above, or check &quot;Show all options&quot; to browse anyway.
        </p>
      )}
      {lifter && <EntryResult entry={entry} part={part} pieceRoles={pieceRoles} settings={settings} />}
    </div>
  );
}

function EntryResult({
  entry,
  part,
  pieceRoles,
  settings,
}: {
  entry: AnchorEntry;
  part: PartRow;
  pieceRoles: PieceRole[];
  settings: ReturnType<typeof profileToSettings>;
}) {
  const p = partRowToPart(part);
  const calc: PartCalc = computePartCalc(p, settings);
  const roleHasWallFn = (part: ReturnType<typeof partRowToPart>) => roleHasWall(pieceRoles, part);
  const ev = evaluateAnchorEntry(entry, p, calc, settings, roleHasWallFn);
  if (!ev) return null;
  const gov = entryGoverningNumbers(entry, ev, calc);
  const pass = ev.pass;
  const checks = [`thickness ${ev.thicknessOK ? "OK" : "FAIL"}`, `edge distance ${ev.edgeOK ? "OK" : "FAIL"}`];
  if (entry.type === "stripper") {
    checks.push(`load ${(ev as { loadOK: boolean }).loadOK ? "OK" : "FAIL"}`);
  } else if (gov.cap !== null) {
    checks.push(`${Math.round(gov.reqLoad ?? 0).toLocaleString()} lb req vs ${Math.round(gov.cap).toLocaleString()} lb capacity`);
  } else {
    checks.push("no rating for this orientation");
  }
  const utilPct = ev.utilization !== null && ev.utilization !== undefined ? Math.round(ev.utilization) : null;
  const utilBarColor = utilPct === null ? "bg-slate-300" : utilPct > 100 ? "bg-red-500" : utilPct >= 85 ? "bg-amber-500" : "bg-green-500";
  return (
    <div className="mt-2 space-y-1.5">
      <div className={`text-[11px] rounded px-2 py-1 border ${pass ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
        {pass ? "Pass" : "Fail"} — {checks.join(", ")}
      </div>
      {utilPct !== null && (
        <div className="px-0.5">
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
            <span>Lift capacity used</span>
            <span className="font-semibold text-slate-700">{utilPct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <div className={`h-full rounded-full ${utilBarColor}`} style={{ width: `${Math.min(100, utilPct)}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
