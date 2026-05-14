export type Department = "lighting" | "audio" | "video" | "rigging" | "cable" | "backline" | "misc";

export type ViewPreset = "iso" | "top" | "left" | "right" | "front" | "rear";

export type WorkspaceMode = "viewport" | "loadwalls";

export type VehicleDisplayMode = "solid" | "xray" | "hybrid";

export type LoadFlowMode = "load" | "unload";

export interface VehicleDisplaySettings {
  mode: VehicleDisplayMode;
  showCab: boolean;
  showTrailerShell: boolean;
  showChassis: boolean;
  showAxles: boolean;
  showWheels: boolean;
  showCenterOfGravity: boolean;
  showWeightBars: boolean;
  showWeightHeatmap: boolean;
}

export interface Axle {
  id: string;
  name: string;
  xMm: number;
  zMm?: number;
  maxLoadKg: number;
  axleType: "steer" | "drive" | "trailer" | "tag" | "lift";
  wheelCount: number;
  enabled: boolean;
}

export interface AxleGroup {
  id: string;
  name: string;
  axleIds: string[];
  maxLoadKg: number;
}

export interface VehicleGeometryModel {
  cabLengthMm: number;
  cabWidthMm: number;
  cabHeightMm: number;
  cabFrontXmm: number;
  cabRearXmm: number;
  tractorFrameRearXmm: number;
  fifthWheelXmm?: number;
  trailerFrontXmm: number;
  trailerRearXmm: number;
  trailerBoxFrontXmm: number;
  trailerBoxRearXmm: number;
}

export interface VehicleWeightModel {
  id: string;
  name: string;
  vehicleType: "semi_trailer" | "rigid" | "road_train";
  trailerTareKg: number;
  tractorTareKg?: number;
  maxGrossWeightKg: number;
  kingpinXmm: number;
  trailerAxleGroupCenterXmm: number;
  axles: Axle[];
  axleGroups: AxleGroup[];
  visualGeometry: VehicleGeometryModel;
  recommendedKingpinLoadMinKg?: number;
  recommendedKingpinLoadMaxKg?: number;
}

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
  wallNotes: Record<number, string>;
  vehicleWeightModel: VehicleWeightModel;
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

export interface LocalProjectSummary {
  id: string;
  name: string;
  updatedAt: string;
  itemCount: number;
  truckName: string;
}

export interface VehicleWeightAnalysis {
  totalLoadKg: number;
  grossWeightKg: number;
  centerOfGravityMm: Vector3Mm;
  kingpinLoadKg: number;
  axleGroupLoadKg: number;
  axleLoads: Array<{
    axleId: string;
    name: string;
    loadKg: number;
    maxLoadKg: number;
    usage: number;
    xMm: number;
    wheelCount: number;
  }>;
  axleGroupLoads: Array<{
    groupId: string;
    name: string;
    loadKg: number;
    maxLoadKg: number;
    usage: number;
  }>;
  kingpinXmm: number;
  axleGroupCenterXmm: number;
  balanceRatio: number;
  lateralOffsetMm: number;
  cgHeightRatio: number;
  warnings: string[];
}
