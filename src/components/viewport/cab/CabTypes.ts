import type { VehicleDisplayMode, VehicleWeightModel } from "../../../types/loadplan";

export type CabRenderMode = "procedural" | "glb";

export interface CabModelContext {
  length: number;
  width: number;
  height: number;
  frontX: number;
  rearX: number;
  bottomY: number;
  topY: number;
  halfWidth: number;
  opacity: number;
  mode: VehicleDisplayMode;
  sketch: boolean;
  model: VehicleWeightModel;
  cabCenterXmm: number;
  tractorAxleXs: number[];
}

export function cabPalette(sketch: boolean) {
  return {
    body: sketch ? "#f1f0eb" : "#3d4652",
    bodySide: sketch ? "#e2e1dc" : "#313946",
    lower: sketch ? "#bfc0bb" : "#20262e",
    chassis: sketch ? "#1f1f1f" : "#1c2229",
    glass: sketch ? "#d7d8d4" : "#15202a",
    grille: sketch ? "#202020" : "#10151b",
    trim: sketch ? "#343434" : "#aeb7c5",
    edge: sketch ? "#111111" : "#d6dde8",
    light: sketch ? "#faf8ec" : "#f0d492",
  };
}

export const ignoreCabRaycast = () => undefined;
