import type { LoadItemTemplate, LoadPlan, Truck } from "../types/loadplan";

export const departmentColors = {
  lighting: "#d9912b",
  audio: "#2f80d1",
  video: "#8d5bd6",
  rigging: "#c94f4f",
  cable: "#3a9b68",
  backline: "#8d99ae",
  misc: "#707780",
} as const;

export const defaultTruck: Truck = {
  id: "truck-1360",
  name: "Trailer 13.60 m",
  lengthMm: 13600,
  widthMm: 2450,
  heightMm: 2700,
  maxWeightKg: 24000,
  notes: "Semirremolque estandar con dimensiones interiores utiles.",
};

export const defaultTemplates: LoadItemTemplate[] = [
  { id: "tpl-moving-head", name: "Case Moving Head x4", category: "Flightcase", department: "lighting", lengthMm: 1200, widthMm: 800, heightMm: 900, weightKg: 180, quantity: 4, color: departmentColors.lighting, stackable: true, maxStack: 2, canRotate: true, canLayFlat: false, notes: "Cabezas moviles en case." },
  { id: "tpl-wash", name: "Case Wash x6", category: "Flightcase", department: "lighting", lengthMm: 1200, widthMm: 800, heightMm: 1000, weightKg: 220, quantity: 6, color: departmentColors.lighting, stackable: true, maxStack: 2, canRotate: true, canLayFlat: false },
  { id: "tpl-truss-2m", name: "Truss H30V 2m", category: "Truss", department: "rigging", lengthMm: 2000, widthMm: 300, heightMm: 300, weightKg: 18, quantity: 12, color: departmentColors.rigging, stackable: true, maxStack: 6, canRotate: true, canLayFlat: true },
  { id: "tpl-truss-3m", name: "Truss H30V 3m", category: "Truss", department: "rigging", lengthMm: 3000, widthMm: 300, heightMm: 300, weightKg: 25, quantity: 10, color: departmentColors.rigging, stackable: true, maxStack: 6, canRotate: true, canLayFlat: true },
  { id: "tpl-cable-dolly", name: "Dolly Cable Grande", category: "Dolly", department: "cable", lengthMm: 1200, widthMm: 1000, heightMm: 1400, weightKg: 350, quantity: 3, color: departmentColors.cable, stackable: false, maxStack: 1, canRotate: true, canLayFlat: false },
  { id: "tpl-audio-rack", name: "Rack Audio", category: "Rack", department: "audio", lengthMm: 600, widthMm: 800, heightMm: 1200, weightKg: 120, quantity: 4, color: departmentColors.audio, stackable: false, maxStack: 1, canRotate: true, canLayFlat: false, fragile: true },
  { id: "tpl-motor-case", name: "Motor Case", category: "Motor", department: "rigging", lengthMm: 800, widthMm: 600, heightMm: 700, weightKg: 160, quantity: 6, color: departmentColors.rigging, stackable: true, maxStack: 2, canRotate: true, canLayFlat: false },
  { id: "tpl-base-plate", name: "Base Plate Case", category: "Base", department: "rigging", lengthMm: 1000, widthMm: 800, heightMm: 400, weightKg: 300, quantity: 4, color: departmentColors.rigging, stackable: true, maxStack: 3, canRotate: true, canLayFlat: true },
];

export function createDefaultPlan(): LoadPlan {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: "StageLoad Plan",
    truck: defaultTruck,
    templates: defaultTemplates,
    items: [],
    createdAt: now,
    updatedAt: now,
    version: "0.1.0",
    snapMm: 100,
    wallDepthMm: 1200,
    wallNotes: {},
  };
}
