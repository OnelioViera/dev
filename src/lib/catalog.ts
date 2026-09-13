// ---------------------------------------------------------------------------
// Static reference catalog — ported verbatim from the original ALP Lifter
// Selector (localStorage build). This is reference/product data, not user
// data, so it lives in code rather than the database. If ALP ever needs to
// edit this catalog without a code deploy, promote this file's contents into
// a `lifter_catalog` table instead.
// ---------------------------------------------------------------------------

export type Lifter = {
  id: string;
  family: string;
  series: string;
  size: string;
  minSlab: number;
  edgeDist?: number;
  edgeDistTension?: number;
  edgeDistShear?: number;
  swlTension?: number;
  swlTension4000?: number;
  swlTension2500?: number;
  swlTensionByPsi?: Record<number, number>;
  swlShear: number | null;
  weight: number;
};

export const LIFTERS: Lifter[] = [
  { id: "LUA44G", family: "Utility Lift Anchor", series: '.444" / .671" Wire', size: '4/4 — .444" wire', minSlab: 4, edgeDist: 9, swlTension: 3200, swlShear: 5800, weight: 0.4 },
  { id: "LUA54G", family: "Utility Lift Anchor", series: '.444" / .671" Wire', size: '5/4 — .444" wire', minSlab: 5, edgeDist: 10, swlTension: 3860, swlShear: 7710, weight: 0.49 },
  { id: "LUA64G", family: "Utility Lift Anchor", series: '.444" / .671" Wire', size: '6/4 — .444" wire', minSlab: 6, edgeDist: 12, swlTension: 4460, swlShear: 9460, weight: 0.58 },
  { id: "LUA56G", family: "Utility Lift Anchor", series: '.444" / .671" Wire', size: '5/6 — .671" wire', minSlab: 5, edgeDist: 10, swlTension: 4560, swlShear: 8430, weight: 1.09 },
  { id: "LUA66G", family: "Utility Lift Anchor", series: '.444" / .671" Wire', size: '6/6 — .671" wire', minSlab: 6, edgeDist: 12, swlTension: 7320, swlShear: 15780, weight: 1.27 },
  { id: "LUA86G", family: "Utility Lift Anchor", series: '.444" / .671" Wire', size: '8/6 — .671" wire', minSlab: 8, edgeDist: 16, swlTension: 10830, swlShear: 18850, weight: 1.73 },
  { id: "LUL414G", family: "Utility Lift Anchor", series: "14mm / 18mm Wire", size: "4/14 — 14mm wire", minSlab: 4, edgeDist: 9, swlTension: 3500, swlShear: 5400, weight: 0.61 },
  { id: "LUL514G", family: "Utility Lift Anchor", series: "14mm / 18mm Wire", size: "5/14 — 14mm wire", minSlab: 5, edgeDist: 10, swlTension: 5500, swlShear: 8500, weight: 0.76 },
  { id: "LUL614G", family: "Utility Lift Anchor", series: "14mm / 18mm Wire", size: "6/14 — 14mm wire", minSlab: 6, edgeDist: 12.5, swlTension: 6500, swlShear: 10100, weight: 1.11 },
  { id: "LUL518G", family: "Utility Lift Anchor", series: "14mm / 18mm Wire", size: "5/18 — 18mm wire", minSlab: 5, edgeDist: 10, swlTension: 6000, swlShear: 9300, weight: 1.44 },
  { id: "LUL618G", family: "Utility Lift Anchor", series: "14mm / 18mm Wire", size: "6/18 — 18mm wire", minSlab: 6, edgeDist: 12.5, swlTension: 7500, swlShear: 11600, weight: 1.66 },
  { id: "LUL818G", family: "Utility Lift Anchor", series: "14mm / 18mm Wire", size: "8/18 — 18mm wire", minSlab: 8, edgeDist: 15.5, swlTension: 13000, swlShear: 20000, weight: 2.25 },

  { id: "LLB", family: "Steel Core Lift Loop", series: "Face-Lift Loop", size: 'Blue — 1/8"', minSlab: 8, edgeDist: 8.06, swlTension4000: 500, swlTension2500: 500, swlShear: null, weight: 0.04 },
  { id: "LLW", family: "Steel Core Lift Loop", series: "Face-Lift Loop", size: 'White — 1/4"', minSlab: 8.25, edgeDist: 8.25, swlTension4000: 2000, swlTension2500: 2000, swlShear: null, weight: 0.19 },
  { id: "LLR", family: "Steel Core Lift Loop", series: "Face-Lift Loop", size: 'Red — 9/32"', minSlab: 8.875, edgeDist: 8.81, swlTension4000: 2400, swlTension2500: 2300, swlShear: null, weight: 0.29 },
  { id: "LLP", family: "Steel Core Lift Loop", series: "Face-Lift Loop", size: 'Purple — 5/16"', minSlab: 9.25, edgeDist: 9.19, swlTension4000: 3200, swlTension2500: 3000, swlShear: null, weight: 0.37 },
  { id: "LLLG", family: "Steel Core Lift Loop", series: "Face-Lift Loop", size: 'Light Green — 3/8"', minSlab: 11, edgeDist: 11.06, swlTension4000: 4500, swlTension2500: 4100, swlShear: null, weight: 0.56 },
  { id: "LLC", family: "Steel Core Lift Loop", series: "Face-Lift Loop", size: 'Charcoal — 25/64"', minSlab: 12.125, edgeDist: 12.19, swlTension4000: 5200, swlTension2500: 5000, swlShear: null, weight: 0.74 },
  { id: "LLDG", family: "Steel Core Lift Loop", series: "Face-Lift Loop", size: 'Dark Green — 15/32"', minSlab: 13.375, edgeDist: 13.31, swlTension4000: 7000, swlTension2500: 5800, swlShear: null, weight: 1.15 },
  { id: "LLY", family: "Steel Core Lift Loop", series: "Face-Lift Loop", size: 'Yellow — 9/16"', minSlab: 15, edgeDist: 15, swlTension4000: 10000, swlTension2500: 10000, swlShear: null, weight: 1.78 },

  // ALP Lifting Pin Anchors (LPA series) — from the 2026 catalog's Lifting Pin System section.
  // SWL is already computed with the catalog's 4:1 safety factor and varies across four
  // published concrete strengths (1,500 / 2,500 / 3,500 / 5,000 psi), so these use
  // swlTensionByPsi instead of a single swlTension value (see lifterTensionForPsi()).
  // Minimum slab/wall thickness = pin length (L) + the catalog's required 1" minimum concrete
  // cover below the anchor foot. Min. edge distance differs by orientation (see edgeDistTension /
  // edgeDistShear, used via lifterMinEdgeDist()). The catalog says this system has low shear
  // capacity and is "not typically recommended" for edge/shear-governed picks (it points to the
  // ALP QuikLift System for thin panels instead) and publishes no shear SWL, so swlShear stays
  // null — a shear-governed part correctly fails with these lifters, same as a Steel Core Lift Loop.
  { id: "LPA1T238G", family: "ALP Lifting Pin Anchor", series: "1 Ton", size: '1T — 2-3/8" pin', minSlab: 3.375, edgeDistTension: 8, edgeDistShear: 12, swlTensionByPsi: { 1500: 1045, 2500: 1350, 3500: 1600, 5000: 1910 }, swlShear: null, weight: 0.11 },
  { id: "LPA1T258G", family: "ALP Lifting Pin Anchor", series: "1 Ton", size: '1T — 2-5/8" pin', minSlab: 3.625, edgeDistTension: 8, edgeDistShear: 12, swlTensionByPsi: { 1500: 1160, 2500: 1500, 3500: 1770, 5000: 2000 }, swlShear: null, weight: 0.14 },
  { id: "LPA1T338G", family: "ALP Lifting Pin Anchor", series: "1 Ton", size: '1T — 3-3/8" pin', minSlab: 4.375, edgeDistTension: 8, edgeDistShear: 12, swlTensionByPsi: { 1500: 1900, 2500: 2000, 3500: 2000, 5000: 2000 }, swlShear: null, weight: 0.16 },
  { id: "LPA1T434G", family: "ALP Lifting Pin Anchor", series: "1 Ton", size: '1T — 4-3/4" pin', minSlab: 5.75, edgeDistTension: 10, edgeDistShear: 12, swlTensionByPsi: { 1500: 2000, 2500: 2000, 3500: 2000, 5000: 2000 }, swlShear: null, weight: 0.22 },

  { id: "LPA2T234G", family: "ALP Lifting Pin Anchor", series: "2 Ton", size: '2T — 2-3/4" pin', minSlab: 3.75, edgeDistTension: 8, edgeDistShear: 12, swlTensionByPsi: { 1500: 1375, 2500: 1775, 3500: 2100, 5000: 2510 }, swlShear: null, weight: 0.31 },
  { id: "LPA2T338G", family: "ALP Lifting Pin Anchor", series: "2 Ton", size: '2T — 3-3/8" pin', minSlab: 4.375, edgeDistTension: 8, edgeDistShear: 12, swlTensionByPsi: { 1500: 2000, 2500: 2700, 3500: 3250, 5000: 3900 }, swlShear: null, weight: 0.35 },
  { id: "LPA2T434G", family: "ALP Lifting Pin Anchor", series: "2 Ton", size: '2T — 4-3/4" pin', minSlab: 5.75, edgeDistTension: 10, edgeDistShear: 15, swlTensionByPsi: { 1500: 3250, 2500: 4000, 3500: 4000, 5000: 4000 }, swlShear: null, weight: 0.43 },
  { id: "LPA2T512G", family: "ALP Lifting Pin Anchor", series: "2 Ton", size: '2T — 5-1/2" pin', minSlab: 6.5, edgeDistTension: 11, edgeDistShear: 17, swlTensionByPsi: { 1500: 4000, 2500: 4000, 3500: 4000, 5000: 4000 }, swlShear: null, weight: 0.48 },
  { id: "LPA2T634G", family: "ALP Lifting Pin Anchor", series: "2 Ton", size: '2T — 6-3/4" pin', minSlab: 7.75, edgeDistTension: 11, edgeDistShear: 17, swlTensionByPsi: { 1500: 4000, 2500: 4000, 3500: 4000, 5000: 4000 }, swlShear: null, weight: 0.57 },
  { id: "LPA2T11G", family: "ALP Lifting Pin Anchor", series: "2 Ton", size: '2T — 11" pin', minSlab: 12, edgeDistTension: 11, edgeDistShear: 17, swlTensionByPsi: { 1500: 4000, 2500: 4000, 3500: 4000, 5000: 4000 }, swlShear: null, weight: 0.85 },

  { id: "LPA4T212G", family: "ALP Lifting Pin Anchor", series: "4 Ton", size: '4T — 2-1/2" pin', minSlab: 3.5, edgeDistTension: 8, edgeDistShear: 12, swlTensionByPsi: { 1500: 1400, 2500: 1810, 3500: 2150, 5000: 2560 }, swlShear: null, weight: 0.67 },
  { id: "LPA4T3G", family: "ALP Lifting Pin Anchor", series: "4 Ton", size: '4T — 3" pin', minSlab: 4, edgeDistTension: 8, edgeDistShear: 12, swlTensionByPsi: { 1500: 1960, 2500: 2530, 3500: 2990, 5000: 3570 }, swlShear: null, weight: 0.74 },
  { id: "LPA4T312G", family: "ALP Lifting Pin Anchor", series: "4 Ton", size: '4T — 3-1/2" pin', minSlab: 4.5, edgeDistTension: 8, edgeDistShear: 12, swlTensionByPsi: { 1500: 2275, 2500: 2935, 3500: 3475, 5000: 4150 }, swlShear: null, weight: 0.77 },
  { id: "LPA4T334G", family: "ALP Lifting Pin Anchor", series: "4 Ton", size: '4T — 3-3/4" pin', minSlab: 4.75, edgeDistTension: 8, edgeDistShear: 12, swlTensionByPsi: { 1500: 2550, 2500: 3250, 3500: 3950, 5000: 4700 }, swlShear: null, weight: 0.82 },
  { id: "LPA4T414G", family: "ALP Lifting Pin Anchor", series: "4 Ton", size: '4T — 4-1/4" pin', minSlab: 5.25, edgeDistTension: 9, edgeDistShear: 13, swlTensionByPsi: { 1500: 3000, 2500: 3850, 3500: 4550, 5000: 5450 }, swlShear: null, weight: 0.89 },
  { id: "LPA4T434G", family: "ALP Lifting Pin Anchor", series: "4 Ton", size: '4T — 4-3/4" pin', minSlab: 5.75, edgeDistTension: 10, edgeDistShear: 15, swlTensionByPsi: { 1500: 3650, 2500: 4700, 3500: 5600, 5000: 6700 }, swlShear: null, weight: 0.94 },
  { id: "LPA4T512G", family: "ALP Lifting Pin Anchor", series: "4 Ton", size: '4T — 5-1/2" pin', minSlab: 6.5, edgeDistTension: 11, edgeDistShear: 17, swlTensionByPsi: { 1500: 4550, 2500: 5850, 3500: 6950, 5000: 8000 }, swlShear: null, weight: 1.05 },
  { id: "LPA4T718G", family: "ALP Lifting Pin Anchor", series: "4 Ton", size: '4T — 7-1/8" pin', minSlab: 8.125, edgeDistTension: 15, edgeDistShear: 22, swlTensionByPsi: { 1500: 6900, 2500: 8000, 3500: 8000, 5000: 8000 }, swlShear: null, weight: 1.25 },
  { id: "LPA4T912G", family: "ALP Lifting Pin Anchor", series: "4 Ton", size: '4T — 9-1/2" pin', minSlab: 10.5, edgeDistTension: 17, edgeDistShear: 26, swlTensionByPsi: { 1500: 8000, 2500: 8000, 3500: 8000, 5000: 8000 }, swlShear: null, weight: 1.6 },

  { id: "LPA8T434G", family: "ALP Lifting Pin Anchor", series: "8 Ton", size: '8T — 4-3/4" pin', minSlab: 5.75, edgeDistTension: 10, edgeDistShear: 15, swlTensionByPsi: { 1500: 4050, 2500: 5200, 3500: 6200, 5000: 7450 }, swlShear: null, weight: 1.96 },
  { id: "LPA8T6G", family: "ALP Lifting Pin Anchor", series: "8 Ton", size: '8T — 6" pin', minSlab: 7, edgeDistTension: 12, edgeDistShear: 18, swlTensionByPsi: { 1500: 5805, 2500: 7495, 3500: 8870, 5000: 10600 }, swlShear: null, weight: 2.31 },
  { id: "LPA8T634G", family: "ALP Lifting Pin Anchor", series: "8 Ton", size: '8T — 6-3/4" pin', minSlab: 7.75, edgeDistTension: 14, edgeDistShear: 21, swlTensionByPsi: { 1500: 7000, 2500: 9000, 3500: 10750, 5000: 12850 }, swlShear: null, weight: 2.48 },
  { id: "LPA8T834G", family: "ALP Lifting Pin Anchor", series: "8 Ton", size: '8T — 8-3/4" pin', minSlab: 9.75, edgeDistTension: 18, edgeDistShear: 27, swlTensionByPsi: { 1500: 12940, 2500: 16000, 3500: 16000, 5000: 16000 }, swlShear: null, weight: 3.06 },
  { id: "LPA8T10G", family: "ALP Lifting Pin Anchor", series: "8 Ton", size: '8T — 10" pin', minSlab: 11, edgeDistTension: 20, edgeDistShear: 30, swlTensionByPsi: { 1500: 14790, 2500: 16000, 3500: 16000, 5000: 16000 }, swlShear: null, weight: 3.33 },
  { id: "LPA8T1338G", family: "ALP Lifting Pin Anchor", series: "8 Ton", size: '8T — 13-3/8" pin', minSlab: 14.375, edgeDistTension: 27, edgeDistShear: 41, swlTensionByPsi: { 1500: 16000, 2500: 16000, 3500: 16000, 5000: 16000 }, swlShear: null, weight: 4.26 },
  { id: "LPA8T2634G", family: "ALP Lifting Pin Anchor", series: "8 Ton", size: '8T — 26-3/4" pin', minSlab: 27.75, edgeDistTension: 27, edgeDistShear: 41, swlTensionByPsi: { 1500: 16000, 2500: 16000, 3500: 16000, 5000: 16000 }, swlShear: null, weight: 7.83 },

  { id: "LPA16T778G", family: "ALP Lifting Pin Anchor", series: "16 Ton", size: '16T — 7-7/8" pin', minSlab: 8.875, edgeDistTension: 14, edgeDistShear: 21, swlTensionByPsi: { 1500: 7000, 2500: 9000, 3500: 10750, 5000: 12850 }, swlShear: null, weight: 6.59 },

  { id: "LPA20T10G", family: "ALP Lifting Pin Anchor", series: "20 Ton", size: '20T — 10" pin', minSlab: 11, edgeDistTension: 20, edgeDistShear: 30, swlTensionByPsi: { 1500: 11750, 2500: 15150, 3500: 17950, 5000: 21500 }, swlShear: null, weight: 7.82 },
  { id: "LPA20T16G", family: "ALP Lifting Pin Anchor", series: "20 Ton", size: '20T — 16" pin', minSlab: 17, edgeDistTension: 24, edgeDistShear: 36, swlTensionByPsi: { 1500: 18920, 2500: 24425, 3500: 28900, 5000: 34500 }, swlShear: null, weight: 11.0 },
  { id: "LPA20T1934G", family: "ALP Lifting Pin Anchor", series: "20 Ton", size: '20T — 19-3/4" pin', minSlab: 20.75, edgeDistTension: 40, edgeDistShear: 48, swlTensionByPsi: { 1500: 26000, 2500: 33800, 3500: 40000, 5000: 40000 }, swlShear: null, weight: 13.35 },
];

export type Band = "typical" | "caution" | "donotuse";

export const ANGLES: { sla: number; pct: string; factor: number; band: Band }[] = [
  { sla: 90, pct: "0%", factor: 1.0, band: "typical" },
  { sla: 82.5, pct: "1%", factor: 1.01, band: "typical" },
  { sla: 75, pct: "4%", factor: 1.04, band: "typical" },
  { sla: 67.5, pct: "8%", factor: 1.08, band: "typical" },
  { sla: 60, pct: "16%", factor: 1.16, band: "typical" },
  { sla: 52.5, pct: "26%", factor: 1.26, band: "caution" },
  { sla: 45, pct: "41%", factor: 1.41, band: "caution" },
  { sla: 37.5, pct: "64%", factor: 1.64, band: "donotuse" },
  { sla: 30, pct: "100%", factor: 2.0, band: "donotuse" },
];

export const DYNAMIC: Record<string, Record<string, number>> = {
  cable: { stationary: 1.0, smooth: 1.65, uneven: 2.0 },
  chain: { stationary: 1.3, smooth: 2.5, uneven: 4.0 },
};

export const PATTERNS: { id: string; label: string; anchors: number | null; hint: string }[] = [
  { id: "2pt", label: "2-Point Pick (wall panel)", anchors: 2, hint: "Easiest pattern to equalize load; rig at ~90° from panel face per ALP guidance." },
  { id: "3pt", label: "3-Point Pick (slab, 120° spacing)", anchors: 3, hint: "All 3 anchors receive equal load when equally spaced about the center of gravity." },
  { id: "4pt-fixed", label: "4-Point Fixed Rigging (not recommended)", anchors: 2, hint: "Fixed 4-point rigging does not equalize load — ALP guidance says to assume only 2 anchors take the load. Avoid when possible." },
  { id: "4pt-equalized", label: "4-Point Equalized (spreader beam / rolling block)", anchors: 4, hint: "Requires a spreader beam or rolling blocks so all 4 anchors share the load equally." },
  { id: "8pt-equalized", label: "8-Point Equalized (main + sub spreader beams)", anchors: 8, hint: "Requires main + sub spreader beams (or 3 pulleys/rolling blocks) so all 8 anchors share the load equally." },
  { id: "custom", label: "Custom / Other", anchors: null, hint: "Enter the number of anchors that actually take the load for your rigging." },
];

export const FERRULE_REF = [
  { group: 'FI-42 Flared Loop Ferrule Insert (3:1 SWL, 3,000 psi)', rows: [
    ["FI4238P", '3/8"', '10"', '15"', "2,000", "2,000"],
    ["FI4212P", '1/2"', '7"', '10"', "2,000", "2,000"],
    ["FI4258P", '5/8"', '8"', '8"', "2,200", "2,200"],
    ["FI4234P", '3/4"', '8"', '8"', "2,200", "2,200"],
    ["FI4278P", '7/8"', '10"', '15"', "5,300", "5,300"],
    ["FI421P", '1"', '10"', '15"', "5,300", "5,300"],
  ]},
  { group: 'FI-64 Straight Loop Ferrule Insert (3:1 SWL, 3,000 psi)', rows: [
    ["FI64124P", '1/2"', '9"', '15"', "3,000", "3,000"],
    ["FI64126P", '1/2"', '9"', '12"', "4,800", "3,410"],
    ["FI64584P", '5/8"', '9"', '12"', "3,000", "3,000"],
    ["FI64586P", '5/8"', '11"', '15"', "5,000", "5,000"],
    ["FI64344P", '3/4"', '9"', '12"', "3,000", "3,000"],
    ["FI64346P", '3/4"', '11"', '15"', "5,000", "5,000"],
    ["FI6416P", '1"', '11"', '12"', "5,000", "5,000"],
  ]},
];

// ALP Lifting Eye (LPLE series) — a reusable rigging attachment (not a cast-in anchor) that
// engages the head of an ALP Lifting Pin Anchor via a "T" slot. This is NOT part of the
// LIFTERS pool and never affects a part's pass/fail: per the catalog, "Rated Load Range (K)
// has a 5:1 safety factor," so swl5to1 = ultimateTension / 5.
export type LiftingEye = { id: string; loadRangeTons: string; ultimateTension: number; swl5to1: number; weight: number };

export const LIFTING_EYES: LiftingEye[] = [
  { id: "LPLE1T", loadRangeTons: "1 – 1.3", ultimateTension: 13000, swl5to1: 2600, weight: 2.07 },
  { id: "LPLE2T", loadRangeTons: "1.5 – 2.5", ultimateTension: 25000, swl5to1: 5000, weight: 3.35 },
  { id: "LPLE4T", loadRangeTons: "3 – 5", ultimateTension: 50000, swl5to1: 10000, weight: 7.7 },
  { id: "LPLE8T", loadRangeTons: "6 – 10", ultimateTension: 100000, swl5to1: 20000, weight: 21.85 },
  { id: "LPLE20T", loadRangeTons: "12 – 20", ultimateTension: 200000, swl5to1: 40000, weight: 44.93 },
];

// Maps an ALP Lifting Pin Anchor's series (its tonnage class) to the matching Lifting Eye.
// There is no dedicated 16-Ton-rated eye SKU — a 16T pin anchor's eye needs are covered by
// the LPLE20T (rated 12–20T). Returns null for any lifter that isn't a Lifting Pin Anchor.
export function liftingEyeFor(lifter: Lifter | null | undefined): LiftingEye | null {
  if (!lifter || lifter.family !== "ALP Lifting Pin Anchor") return null;
  const map: Record<string, string> = { "1 Ton": "LPLE1T", "2 Ton": "LPLE2T", "4 Ton": "LPLE4T", "8 Ton": "LPLE8T", "16 Ton": "LPLE20T", "20 Ton": "LPLE20T" };
  const eyeId = map[lifter.series];
  if (!eyeId) return null;
  return LIFTING_EYES.find((e) => e.id === eyeId) || null;
}

export const ORIENTATION_LABELS: Record<string, string> = { tension: "Tension", shear: "Shear" };
