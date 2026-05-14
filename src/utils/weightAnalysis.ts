import type { LoadPlan, VehicleWeightAnalysis, Vector3Mm } from "../types/loadplan";
import { getItemBoundingBox } from "./geometry";

const AXLE_COUNT = 3;

export function analyzeVehicleWeight(plan: LoadPlan): VehicleWeightAnalysis {
  const weighted = plan.items
    .filter((item) => !item.hidden)
    .map((item) => {
      const template = plan.templates.find((entry) => entry.id === item.templateId);
      if (!template) return undefined;
      const box = getItemBoundingBox(item, template);
      return {
        weightKg: template.weightKg,
        center: {
          x: box.min.x + box.size.x / 2,
          y: box.min.y + box.size.y / 2,
          z: box.min.z + box.size.z / 2,
        },
      };
    })
    .filter((entry): entry is { weightKg: number; center: Vector3Mm } => Boolean(entry));

  const totalLoadKg = weighted.reduce((sum, entry) => sum + entry.weightKg, 0);
  const centerOfGravityMm = totalLoadKg > 0
    ? {
      x: weighted.reduce((sum, entry) => sum + entry.center.x * entry.weightKg, 0) / totalLoadKg,
      y: weighted.reduce((sum, entry) => sum + entry.center.y * entry.weightKg, 0) / totalLoadKg,
      z: weighted.reduce((sum, entry) => sum + entry.center.z * entry.weightKg, 0) / totalLoadKg,
    }
    : { x: plan.truck.lengthMm / 2, y: 0, z: plan.truck.widthMm / 2 };

  const kingpinXmm = 900;
  const axleGroupCenterXmm = Math.max(kingpinXmm + 1, plan.truck.lengthMm - 2200);
  const span = axleGroupCenterXmm - kingpinXmm;
  const rawAxleGroupLoad = totalLoadKg * ((centerOfGravityMm.x - kingpinXmm) / span);
  const axleGroupLoadKg = clamp(rawAxleGroupLoad, 0, totalLoadKg);
  const kingpinLoadKg = totalLoadKg - axleGroupLoadKg;
  const axleLoadsKg = Array.from({ length: AXLE_COUNT }, () => axleGroupLoadKg / AXLE_COUNT);
  const balanceRatio = totalLoadKg > 0 ? axleGroupLoadKg / totalLoadKg : 0;
  const warnings: string[] = [];

  if (totalLoadKg > plan.truck.maxWeightKg) warnings.push("Se supera el peso maximo del camion.");
  if (balanceRatio < 0.45 && totalLoadKg > 0) warnings.push("Carga adelantada: revisar apoyo en kingpin.");
  if (balanceRatio > 0.78 && totalLoadKg > 0) warnings.push("Carga retrasada: revisar grupo de ejes.");

  return {
    totalLoadKg,
    centerOfGravityMm,
    kingpinLoadKg,
    axleGroupLoadKg,
    axleLoadsKg,
    kingpinXmm,
    axleGroupCenterXmm,
    balanceRatio,
    warnings,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
