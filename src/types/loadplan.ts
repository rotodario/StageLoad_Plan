export type Department = "lighting" | "audio" | "video" | "rigging" | "cable" | "backline" | "misc";

export type ViewPreset = "iso" | "top" | "left" | "right" | "front" | "rear";

export type WorkspaceMode = "viewport" | "loadwalls";

export interface Vector3Mm {
  x: number;
  y: number;
  z: number;
}

export interface Truck {
  id: string;
  name: string;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  maxWeightKg: number;
  notes?: string;
}

export interface LoadItemTemplate {
  id: string;
  name: string;
  category: string;
  department: Department;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  weightKg: number;
  quantity: number;
  color: string;
  stackable: boolean;
  maxStack: number;
  canRotate: boolean;
  canLayFlat: boolean;
  fragile?: boolean;
  notes?: string;
}

export interface LoadItemInstance {
  id: string;
  templateId: string;
  label: string;
  position: Vector3Mm;
  rotation: Vector3Mm;
  locked: boolean;
  hidden: boolean;
  color?: string;
  department?: Department;
  loadOrder: number;
  unloadPriority: number;
  blockedBy: string[];
  wallNumber?: number;
  notes?: string;
}

export interface LoadPlan {
  id: string;
  name: string;
  truck: Truck;
  templates: LoadItemTemplate[];
  items: LoadItemInstance[];
  createdAt: string;
  updatedAt: string;
  version: string;
  snapMm: number;
  wallDepthMm: number;
}

export interface LoadWall {
  wallNumber: number;
  startMm: number;
  endMm: number;
  items: LoadItemInstance[];
  totalWeightKg: number;
}

export type WarningSeverity = "info" | "warning" | "error";

export interface CollisionWarning {
  id: string;
  itemAId: string;
  itemBId: string;
  message: string;
  severity: WarningSeverity;
}

export interface ValidationWarning {
  id: string;
  itemId?: string;
  message: string;
  severity: WarningSeverity;
}

export interface PlannerReport {
  totalItems: number;
  totalWeightKg: number;
  usedVolumeM3: number;
  truckVolumeM3: number;
  loadPercentage: number;
  collisions: CollisionWarning[];
  warnings: ValidationWarning[];
}
