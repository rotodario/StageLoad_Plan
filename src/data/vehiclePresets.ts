import type { VehicleWeightModel } from "../types/loadplan";

export const vehiclePresets: VehicleWeightModel[] = [
  {
    id: "semi-4x2-1360-3axle",
    name: "Tractora 4x2 + semirremolque 13.60 m / 3 ejes",
    vehicleType: "semi_trailer",
    trailerTareKg: 7200,
    tractorTareKg: 7800,
    maxGrossWeightKg: 40000,
    kingpinXmm: 900,
    trailerAxleGroupCenterXmm: 11400,
    recommendedKingpinLoadMinKg: 8500,
    recommendedKingpinLoadMaxKg: 12000,
    axles: [
      { id: "steer-1", name: "Direccional", xMm: -3300, maxLoadKg: 7500, axleType: "steer", wheelCount: 2, enabled: true },
      { id: "drive-1", name: "Tractora motriz", xMm: -850, maxLoadKg: 11500, axleType: "drive", wheelCount: 4, enabled: true },
      { id: "trailer-1", name: "Trailer eje 1", xMm: 10650, maxLoadKg: 9000, axleType: "trailer", wheelCount: 4, enabled: true },
      { id: "trailer-2", name: "Trailer eje 2", xMm: 11400, maxLoadKg: 9000, axleType: "trailer", wheelCount: 4, enabled: true },
      { id: "trailer-3", name: "Trailer eje 3", xMm: 12150, maxLoadKg: 9000, axleType: "trailer", wheelCount: 4, enabled: true },
    ],
    axleGroups: [
      { id: "tractor", name: "Tractora", axleIds: ["steer-1", "drive-1"], maxLoadKg: 19000 },
      { id: "trailer-bogie", name: "Grupo trailer", axleIds: ["trailer-1", "trailer-2", "trailer-3"], maxLoadKg: 27000 },
    ],
  },
  {
    id: "semi-6x2-1360-3axle",
    name: "Tractora 6x2 + semirremolque 13.60 m / 3 ejes",
    vehicleType: "semi_trailer",
    trailerTareKg: 7200,
    tractorTareKg: 8600,
    maxGrossWeightKg: 44000,
    kingpinXmm: 900,
    trailerAxleGroupCenterXmm: 11400,
    recommendedKingpinLoadMinKg: 9000,
    recommendedKingpinLoadMaxKg: 14500,
    axles: [
      { id: "steer-1", name: "Direccional", xMm: -3600, maxLoadKg: 8000, axleType: "steer", wheelCount: 2, enabled: true },
      { id: "drive-1", name: "Motriz", xMm: -1200, maxLoadKg: 11500, axleType: "drive", wheelCount: 4, enabled: true },
      { id: "tag-1", name: "Tag", xMm: -450, maxLoadKg: 7500, axleType: "tag", wheelCount: 2, enabled: true },
      { id: "trailer-1", name: "Trailer eje 1", xMm: 10650, maxLoadKg: 9000, axleType: "trailer", wheelCount: 4, enabled: true },
      { id: "trailer-2", name: "Trailer eje 2", xMm: 11400, maxLoadKg: 9000, axleType: "trailer", wheelCount: 4, enabled: true },
      { id: "trailer-3", name: "Trailer eje 3", xMm: 12150, maxLoadKg: 9000, axleType: "trailer", wheelCount: 4, enabled: true },
    ],
    axleGroups: [
      { id: "tractor", name: "Tractora", axleIds: ["steer-1", "drive-1", "tag-1"], maxLoadKg: 27000 },
      { id: "trailer-bogie", name: "Grupo trailer", axleIds: ["trailer-1", "trailer-2", "trailer-3"], maxLoadKg: 27000 },
    ],
  },
  {
    id: "rigid-2axle",
    name: "Camion rigido 2 ejes",
    vehicleType: "rigid",
    trailerTareKg: 0,
    tractorTareKg: 6500,
    maxGrossWeightKg: 18000,
    kingpinXmm: 0,
    trailerAxleGroupCenterXmm: 5200,
    axles: [
      { id: "front-1", name: "Delantero", xMm: 900, maxLoadKg: 7500, axleType: "steer", wheelCount: 2, enabled: true },
      { id: "rear-1", name: "Trasero", xMm: 5200, maxLoadKg: 11500, axleType: "drive", wheelCount: 4, enabled: true },
    ],
    axleGroups: [
      { id: "rigid", name: "Rigido", axleIds: ["front-1", "rear-1"], maxLoadKg: 18000 },
    ],
  },
  {
    id: "rigid-3axle",
    name: "Camion rigido 3 ejes",
    vehicleType: "rigid",
    trailerTareKg: 0,
    tractorTareKg: 8600,
    maxGrossWeightKg: 26000,
    kingpinXmm: 0,
    trailerAxleGroupCenterXmm: 5600,
    axles: [
      { id: "front-1", name: "Delantero", xMm: 900, maxLoadKg: 8000, axleType: "steer", wheelCount: 2, enabled: true },
      { id: "rear-1", name: "Trasero 1", xMm: 5200, maxLoadKg: 9500, axleType: "drive", wheelCount: 4, enabled: true },
      { id: "rear-2", name: "Trasero 2", xMm: 6000, maxLoadKg: 9500, axleType: "tag", wheelCount: 4, enabled: true },
    ],
    axleGroups: [
      { id: "front", name: "Delantero", axleIds: ["front-1"], maxLoadKg: 8000 },
      { id: "rear", name: "Grupo trasero", axleIds: ["rear-1", "rear-2"], maxLoadKg: 19000 },
    ],
  },
];

export const defaultVehicleWeightModel = vehiclePresets[0];

export function getVehiclePresetById(id: string): VehicleWeightModel | undefined {
  return vehiclePresets.find((preset) => preset.id === id);
}
