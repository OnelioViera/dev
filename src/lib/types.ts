import type { AnchorEntry, LiftOrientation, PieceRole } from "./calc";

// Row shapes as they come back from Supabase (snake_case, matches
// supabase/migrations/0001_init.sql). Kept separate from the calc engine's
// camelCase `Part`/`Settings` types (lib/calc.ts) so the DB schema can evolve
// independently of the calculation engine.

export type ProfileRow = {
  id: string;
  display_name: string | null;
  inventory: string[];
  use_full_catalog: boolean;
  customer: string;
  job_name: string;
  job_number: string;
  structure_id: string;
  pick_pattern: string;
  anchors_taking_load: number;
  sla_deg: number;
  rigging_type: string;
  handling_condition: string;
  unit_weight_pcf: number;
  concrete_psi: number;
  piece_roles: PieceRole[];
  created_at: string;
  updated_at: string;
};

export type PartRow = {
  id: string;
  user_id: string;
  name: string;
  piece_role: string;
  shape: "rect" | "round";
  length_in: number;
  width_in: number;
  diameter_in: number;
  wall_thickness_in: number;
  legacy_size_note: string | null;
  weight_lbs: number;
  cubic_yards: number;
  height: number;
  thickness_in: number;
  edge_distance_top_in: number;
  edge_distance_bottom_in: number;
  edge_distance_side_in: number;
  lift_orientation: LiftOrientation;
  anchor_entries: AnchorEntry[];
  strip_psi: number | null;
  notes: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ReportRow = {
  id: string;
  user_id: string;
  customer: string;
  job_name: string;
  job_number: string;
  structure_id: string;
  settings: Record<string, unknown>;
  piece_roles: PieceRole[];
  parts: PartRow[];
  parts_count: number;
  result: "pass" | "fail" | "incomplete";
  created_at: string;
};
