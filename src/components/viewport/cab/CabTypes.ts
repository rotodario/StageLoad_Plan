import type { VehicleDisplayMode, VehicleWeightModel } from "../../../types/loadplan";

export type CabRenderMode = "procedural" | "glb";

export interface CabDimensions {
  length: number;
  width: number;
  height: number;
  opacity: number;
  mode: VehicleDisplayMode;
  sketch: boolean;
  model: VehicleWeightModel;
  cabCenterXmm: number;
}

export function cabColors(sketch: boolean) {
  return {
    body: sketch ? "#ededeb" : "#39424f",
    bodyDark: sketch ? "#c8c8c4" : "#20262e",
    glass: sketch ? "#d8d8d4" : "#17212b",
    trim: sketch ? "#161616" : "#151a21",
    detail: sketch ? "#f7f7f3" : "#aeb7c5",
    edge: sketch ? "#151515" : "#d6dde8",
    light: sketch ? "#f4f4f1" : "#f2d28b",
  };
}

export const ignoreCabRaycast = () => undefined;
