// ---------------------------------------------------------------------------
// Engineering calculation engine — ported verbatim (same numbers, same
// branching) from the original localStorage build's <script>. Do not "clean
// up" the formulas here without re-checking them against the original
// artifact; this governs pass/fail safety determinations.
// ---------------------------------------------------------------------------
import { ANGLES, DYNAMIC, LIFTERS, ORIENTATION_LABELS, type Band, type Lifter } from "./catalog";

export type Location = "top" | "bottom" | "side";
export type EntryType = "lifter" | "stripper";
export type LiftOrientation = "tension" | "shear";

export type AnchorEntry = {
  id: string;
  type: EntryType;
  location: Location;
  lifterId: string | null;
};

export type PieceRole = { id: string; label: string; hasWall: boolean };

export function defaultPieceRoles(): PieceRole[] {
  return [
    { id: "lid", label: "Lid", hasWall: false },
    { id: "lid_walls", label: "Lid / Walls", hasWall: true },
    { id: "riser", label: "Riser", hasWall: true },
    { id: "base", label: "Base", hasWall: false },
    { id: "base_walls", label: "Base / Walls", hasWall: true },
  ];
}

export type Part = {
  id: string;
  name: string;
  pieceRole: string;
  shape: "rect" | "round";
  lengthIn: number;
  widthIn: number;
  diameterIn: number;
  wallThicknessIn: number;
  legacySizeNote?: string | null;
  weightLbs: number;
  cubicYards: number;
  height: number;
  thicknessIn: number;
  edgeDistanceTopIn: number;
  edgeDistanceBottomIn: number;
  edgeDistanceSideIn: number;
  liftOrientation: LiftOrientation;
  anchorEntries: AnchorEntry[];
  stripPsi: number | null;
  notes: string;
};

export type Settings = {
  pickPattern: string;
  anchorsTakingLoad: number;
  slaDeg: number;
  riggingType: "cable" | "chain";
  handlingCondition: "stationary" | "smooth" | "uneven";
  unitWeightPcf: number;
  concretePsi: number;
  useFullCatalog: boolean;
};

export function defaultSettings(): Settings {
  return {
    pickPattern: "4pt-equalized",
    anchorsTakingLoad: 4,
    slaDeg: 60,
    riggingType: "cable",
    handlingCondition: "stationary",
    unitWeightPcf: 150,
    concretePsi: 4000,
    useFullCatalog: false,
  };
}

export function roleIdGen(): string {
  return "role" + Date.now() + Math.floor(Math.random() * 1000);
}

export function newAnchorEntry(overrides: Partial<AnchorEntry> = {}): AnchorEntry {
  return {
    id: "ae" + Date.now() + Math.floor(Math.random() * 100000),
    type: "lifter",
    location: "top",
    lifterId: null,
    ...overrides,
  };
}

export function edgeDistanceFor(part: Part, location: Location): number {
  if (location === "bottom") return part.edgeDistanceBottomIn || 0;
  if (location === "side") return part.edgeDistanceSideIn || 0;
  return part.edgeDistanceTopIn || 0;
}

export function locationLabel(location: Location): string {
  if (location === "bottom") return "Bottom";
  if (location === "side") return "Side";
  return "Top";
}

export function angleInfo(sla: number) {
  return ANGLES.find((x) => x.sla === sla) || ANGLES[4];
}

export function dynamicFactor(riggingType: string, handlingCondition: string): number {
  const d = DYNAMIC[riggingType] || DYNAMIC.cable;
  return d[handlingCondition] !== undefined ? d[handlingCondition] : 1.0;
}

// Pick the highest published concrete-strength tier that does not exceed the actual psi
// (conservative); if the actual psi is below every published tier, fall back to the lowest
// published tier rather than extrapolating.
export function lifterTensionForPsi(lifter: Lifter, psi: number): number {
  if (lifter.swlTensionByPsi) {
    const tiers = Object.keys(lifter.swlTensionByPsi).map(Number).sort((a, b) => a - b);
    let chosen = tiers[0];
    for (const t of tiers) {
      if (psi >= t) chosen = t;
    }
    return lifter.swlTensionByPsi[chosen];
  }
  if (lifter.swlTension4000 !== undefined) {
    return psi >= 4000 ? lifter.swlTension4000 : (lifter.swlTension2500 as number);
  }
  return lifter.swlTension as number;
}

// Minimum edge distance for a lifter, accounting for families (like the ALP Lifting Pin
// Anchor) that publish separate tension- and shear-orientation minimums instead of one value.
export function lifterMinEdgeDist(lifter: Lifter, orientation: LiftOrientation): number {
  if (orientation === "shear" && lifter.edgeDistShear !== undefined) return lifter.edgeDistShear;
  if (orientation !== "shear" && lifter.edgeDistTension !== undefined) return lifter.edgeDistTension;
  return lifter.edgeDist as number;
}

export type PartCalc = {
  angle: { sla: number; pct: string; factor: number; band: Band };
  dynFac: number;
  anchors: number;
  baseLoad: number;
  reqTension: number;
  reqShear: number;
};

export function computePartCalc(part: Part, settings: Settings): PartCalc {
  const angle = angleInfo(settings.slaDeg);
  const dynFac = dynamicFactor(settings.riggingType, settings.handlingCondition);
  const anchors = Math.max(1, settings.anchorsTakingLoad || 1);
  const baseLoad = part.weightLbs > 0 ? part.weightLbs / anchors : 0;
  const reqTension = baseLoad * angle.factor * dynFac;
  const reqShear = reqTension * Math.cos((settings.slaDeg * Math.PI) / 180);
  return { angle, dynFac, anchors, baseLoad, reqTension, reqShear };
}

export function orientationLabel(part: Part): string {
  return ORIENTATION_LABELS[part.liftOrientation] || "Tension";
}

export function orientationFullLabel(part: Part): string {
  return part.liftOrientation === "shear" ? "Tilt-Up / Laydown Pick (shear-governed)" : "Vertical / Flat Pick (tension-governed)";
}

// Which physical thickness value governs the ALP "min. slab/panel thickness" check for this
// part: wall-bearing roles (Riser, and any role the user has flagged "has wall") use the Wall
// Thickness field; everything else uses the Lid / Slab Thickness field.
export function effectiveThicknessIn(part: Part, roleHasWallFn: (part: Part) => boolean): number {
  return roleHasWallFn(part) ? part.wallThicknessIn || 0 : part.thicknessIn || 0;
}

export type LifterEval = {
  kind: "lifter";
  lifter: Lifter;
  tensionCap: number;
  thicknessOK: boolean;
  edgeOK: boolean;
  tensionOK: boolean;
  shearOK: boolean;
  hasShearRating: boolean;
  shearNote: string;
  orientation: LiftOrientation;
  governingCap: number | null;
  governingReq: number;
  pass: boolean;
  utilization: number | null;
  location: Location;
  edgeDistanceIn: number;
};

export function evaluateLifter(
  lifter: Lifter,
  calc: PartCalc,
  part: Part,
  settings: Settings,
  location: Location,
  roleHasWallFn: (part: Part) => boolean
): LifterEval {
  const loc: Location = location === "bottom" ? "bottom" : location === "side" ? "side" : "top";
  const orientation: LiftOrientation = part.liftOrientation === "shear" ? "shear" : "tension";
  const tensionCap = lifterTensionForPsi(lifter, settings.concretePsi);
  const thicknessOK = effectiveThicknessIn(part, roleHasWallFn) >= lifter.minSlab;
  const edgeDistanceIn = edgeDistanceFor(part, loc);
  const edgeOK = edgeDistanceIn >= lifterMinEdgeDist(lifter, orientation);
  const tensionOK = tensionCap >= calc.reqTension;
  const hasShearRating = lifter.swlShear !== null && lifter.swlShear !== undefined;
  const shearOK = hasShearRating ? (lifter.swlShear as number) >= calc.reqShear : false;
  const shearNote = hasShearRating ? "" : "This lifter has no published shear rating — not suitable for a shear-governed (tilt-up / laydown) pick.";

  const loadOK = orientation === "shear" ? shearOK : tensionOK;
  const pass = thicknessOK && edgeOK && loadOK;

  let utilization: number | null;
  if (orientation === "shear") {
    utilization = hasShearRating && (lifter.swlShear as number) > 0 ? (calc.reqShear / (lifter.swlShear as number)) * 100 : null;
  } else {
    utilization = tensionCap > 0 ? (calc.reqTension / tensionCap) * 100 : 0;
  }
  const governingCap = orientation === "shear" ? (hasShearRating ? (lifter.swlShear as number) : null) : tensionCap;
  const governingReq = orientation === "shear" ? calc.reqShear : calc.reqTension;

  return {
    kind: "lifter",
    lifter,
    tensionCap,
    thicknessOK,
    edgeOK,
    tensionOK,
    shearOK,
    hasShearRating,
    shearNote,
    orientation,
    governingCap,
    governingReq,
    pass,
    utilization,
    location: loc,
    edgeDistanceIn,
  };
}

// --- Form Stripper checks -------------------------------------------------
// Stripping is treated as a simple static pull, not a full rigging pick: required load per
// strip anchor = part weight ÷ number of Form Stripper entries currently on the part (a part
// with no Form Stripper entries yet defaults to 1, so recommendations are still meaningful
// before the user has added any). No sling-angle or dynamic factors apply. Capacity is looked
// up at the part's strip-time concrete strength if one was entered, else the same design psi
// used everywhere else.
export function stripAnchorCountFor(part: Part): number {
  const n = (part.anchorEntries || []).filter((e) => e.type === "stripper").length;
  return Math.max(1, n);
}

export function effectiveStripPsi(part: Part, settings: Settings): number {
  return part.stripPsi !== null && part.stripPsi !== undefined ? Number(part.stripPsi) : settings.concretePsi;
}

export function stripReqLoad(part: Part): number {
  return (part.weightLbs || 0) / stripAnchorCountFor(part);
}

export type StripperEval = {
  kind: "stripper";
  lifter: Lifter;
  tensionCap: number;
  thicknessOK: boolean;
  edgeOK: boolean;
  loadOK: boolean;
  reqLoad: number;
  pass: boolean;
  utilization: number | null;
  psi: number;
  location: Location;
  edgeDistanceIn: number;
};

export function evaluateStripperEntry(
  lifter: Lifter,
  part: Part,
  settings: Settings,
  location: Location,
  roleHasWallFn: (part: Part) => boolean
): StripperEval {
  const loc: Location = location === "top" ? "top" : location === "side" ? "side" : "bottom";
  const psi = effectiveStripPsi(part, settings);
  const reqLoad = stripReqLoad(part);
  const tensionCap = lifterTensionForPsi(lifter, psi);
  const thicknessOK = effectiveThicknessIn(part, roleHasWallFn) >= lifter.minSlab;
  const edgeDistanceIn = edgeDistanceFor(part, loc);
  const edgeOK = edgeDistanceIn >= lifterMinEdgeDist(lifter, "tension");
  const loadOK = tensionCap >= reqLoad;
  const pass = thicknessOK && edgeOK && loadOK;
  const utilization = tensionCap > 0 ? (reqLoad / tensionCap) * 100 : null;
  return { kind: "stripper", lifter, tensionCap, thicknessOK, edgeOK, loadOK, reqLoad, pass, utilization, psi, location: loc, edgeDistanceIn };
}

export type AnyEval = LifterEval | StripperEval;

// Evaluates one anchor entry (Lifter or Form Stripper) against its part. Returns null if the
// entry has no lifter picked yet, or the picked id no longer resolves to a catalog lifter.
export function evaluateAnchorEntry(
  entry: AnchorEntry,
  part: Part,
  calc: PartCalc,
  settings: Settings,
  roleHasWallFn: (part: Part) => boolean
): AnyEval | null {
  if (!entry || !entry.lifterId) return null;
  const lifter = LIFTERS.find((l) => l.id === entry.lifterId);
  if (!lifter) return null;
  if (entry.type === "stripper") {
    return evaluateStripperEntry(lifter, part, settings, entry.location, roleHasWallFn);
  }
  return evaluateLifter(lifter, calc, part, settings, entry.location, roleHasWallFn);
}

// The minimum edge distance the picked lifter itself requires for this entry (from the
// catalog), independent of whatever edge distance the part actually has available.
export function entryMinEdgeDistance(entry: AnchorEntry, ev: AnyEval | null): number | null {
  if (!ev || !ev.lifter) return null;
  const orientation: LiftOrientation = entry.type === "stripper" ? "tension" : ((ev as LifterEval).orientation || "tension");
  return lifterMinEdgeDist(ev.lifter, orientation);
}

export function entryGoverningNumbers(entry: AnchorEntry, ev: AnyEval | null, calc: PartCalc): { reqLoad: number | null; cap: number | null } {
  if (!ev) return { reqLoad: null, cap: null };
  if (entry.type === "stripper") {
    const se = ev as StripperEval;
    return { reqLoad: se.reqLoad, cap: se.tensionCap };
  }
  const le = ev as LifterEval;
  if (le.orientation === "shear") {
    return { reqLoad: calc.reqShear, cap: le.hasShearRating ? (le.lifter.swlShear as number) : null };
  }
  return { reqLoad: calc.reqTension, cap: le.tensionCap };
}

export type PartStatus = {
  state: "missing" | "incomplete" | "pass" | "fail";
  calc: PartCalc;
  worstUtil?: number | null;
  lifterEvals?: (AnyEval | null)[];
  stripperEvals?: (AnyEval | null)[];
};

// Rolls every anchor entry on a part up into one overall status for the row badge and the
// job-wide summary banner. "missing" = no entries at all, or no Lifter-type entry at all
// (a part can't actually be picked with Form Strippers alone). "incomplete" = at least one
// entry exists but hasn't had a lifter picked yet. "pass"/"fail" = every entry that has a
// lifter picked evaluates against its own check.
export function partOverallStatus(part: Part, settings: Settings, roleHasWallFn: (part: Part) => boolean): PartStatus {
  const calc = computePartCalc(part, settings);
  const entries = part.anchorEntries || [];
  const lifterEntries = entries.filter((e) => e.type === "lifter");
  const stripperEntries = entries.filter((e) => e.type === "stripper");
  if (!entries.length || !lifterEntries.length) {
    return { state: "missing", calc };
  }
  if (lifterEntries.some((e) => !e.lifterId) || stripperEntries.some((e) => !e.lifterId)) {
    return { state: "incomplete", calc };
  }
  const lifterEvals = lifterEntries.map((e) => evaluateAnchorEntry(e, part, calc, settings, roleHasWallFn));
  const stripperEvals = stripperEntries.map((e) => evaluateAnchorEntry(e, part, calc, settings, roleHasWallFn));
  const allEvals = [...lifterEvals, ...stripperEvals];
  const allPass = allEvals.every((e) => e && e.pass);
  const utils = allEvals.map((e) => (e && e.utilization !== null && e.utilization !== undefined ? e.utilization : null)).filter((u): u is number => u !== null);
  const worstUtil = utils.length ? Math.max(...utils) : null;
  return { state: allPass ? "pass" : "fail", worstUtil, calc, lifterEvals, stripperEvals };
}

export function scopedLifters(inventory: string[], settings: Settings): Lifter[] {
  if (settings.useFullCatalog) return LIFTERS;
  return LIFTERS.filter((l) => inventory.indexOf(l.id) !== -1);
}

export function roleHasWall(pieceRoles: PieceRole[], part: Part): boolean {
  const r = pieceRoles.find((x) => x.id === part.pieceRole);
  return !!(r && r.hasWall);
}

export function getRoleLabel(pieceRoles: PieceRole[], id: string): string {
  const r = pieceRoles.find((x) => x.id === id);
  if (r) return r.label;
  if (!id) return "—";
  return id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function fmtIn(n: number | null | undefined): string | null {
  if (n === null || n === undefined || isNaN(n) || n === 0) return null;
  const r = Math.round(n * 100) / 100;
  return String(r);
}

// For wall-bearing pieces only (Riser and any role flagged "has wall"): entered Length/Width/
// Diameter are treated as INSIDE dimensions, and the outside dimension is the inside dimension
// plus 2x wall thickness (thickness applies to both sides of the wall).
export function outsideDims(pieceRoles: PieceRole[], part: Part): { diameterIn?: number; lengthIn?: number; widthIn?: number } | null {
  if (!roleHasWall(pieceRoles, part)) return null;
  const t = part.wallThicknessIn || 0;
  if (!t) return null;
  if (part.shape === "round") {
    if (!part.diameterIn) return null;
    return { diameterIn: part.diameterIn + 2 * t };
  }
  if (!part.lengthIn && !part.widthIn) return null;
  return { lengthIn: (part.lengthIn || 0) + 2 * t, widthIn: (part.widthIn || 0) + 2 * t };
}
