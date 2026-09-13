import type { Part, Settings } from "./calc";
import type { PartRow, ProfileRow } from "./types";

export function partRowToPart(row: PartRow): Part {
  return {
    id: row.id,
    name: row.name,
    pieceRole: row.piece_role,
    shape: row.shape,
    lengthIn: row.length_in,
    widthIn: row.width_in,
    diameterIn: row.diameter_in,
    wallThicknessIn: row.wall_thickness_in,
    legacySizeNote: row.legacy_size_note,
    weightLbs: row.weight_lbs,
    cubicYards: row.cubic_yards,
    height: row.height,
    thicknessIn: row.thickness_in,
    edgeDistanceTopIn: row.edge_distance_top_in,
    edgeDistanceBottomIn: row.edge_distance_bottom_in,
    edgeDistanceSideIn: row.edge_distance_side_in,
    liftOrientation: row.lift_orientation,
    anchorEntries: row.anchor_entries || [],
    stripPsi: row.strip_psi,
    notes: row.notes || "",
  };
}

export function profileToSettings(p: ProfileRow): Settings {
  return {
    pickPattern: p.pick_pattern,
    anchorsTakingLoad: p.anchors_taking_load,
    slaDeg: Number(p.sla_deg),
    riggingType: p.rigging_type as Settings["riggingType"],
    handlingCondition: p.handling_condition as Settings["handlingCondition"],
    unitWeightPcf: Number(p.unit_weight_pcf),
    concretePsi: Number(p.concrete_psi),
    useFullCatalog: p.use_full_catalog,
  };
}
