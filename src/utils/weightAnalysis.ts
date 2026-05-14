import type { Axle, LoadPlan, VehicleWeightAnalysis, Vector3Mm } from "../types/loadplan";
import { getItemBoundingBox } from "./geometry";

export function analyzeVehicleWeight(plan: LoadPlan): VehicleWeightAnalysis {
  const model = plan.vehicleWeightModel;
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
  const grossWeightKg = totalLoadKg + model.trailerTareKg + (model.tractorTareKg ?? 0);
  const centerOfGravityMm = totalLoadKg > 0
    ? {
      x: weighted.reduce((sum, entry) => sum + entry.center.x * entry.weightKg, 0) / totalLoadKg,
      y: weighted.reduce((sum, entry) => sum + entry.center.y * entry.weightKg, 0) / totalLoadKg,
      z: weighted.reduce((sum, entry) => sum + entry.center.z * entry.weightKg, 0) / totalLoadKg,
    }
    : { x: plan.truck.lengthMm / 2, y: 0, z: plan.truck.widthMm / 2 };

  const enabledAxles = model.axles.filter((axle) => axle.enabled);
  const trailerAxles = enabledAxles.filter((axle) => axle.axleType === "trailer" || axle.axleType === "tag" || axle.axleType === "lift");
  const supportAxles = model.vehicleType === "semi_trailer" ? trailerAxles : enabledAxles;
  const axleGroupCenterXmm = model.trailerAxleGroupCenterXmm;

  // Static beam approximation: the payload is treated as a point load at CG,
  // supported between the kingpin and trailer axle group center for semis.
  const span = Math.max(1, axleGroupCenterXmm - model.kingpinXmm);
  const rawAxleGroupLoad = model.vehicleType === "semi_trailer"
    ? totalLoadKg * ((centerOfGravityMm.x - model.kingpinXmm) / span)
    : distributeRigidLoad(totalLoadKg, centerOfGravityMm.x, enabledAxles);
  const axleGroupLoadKg = clamp(rawAxleGroupLoad, 0, totalLoadKg);
  const kingpinLoadKg = model.vehicleType === "semi_trailer" ? totalLoadKg - axleGroupLoadKg : 0;
  const axleLoads = distributeToAxles(supportAxles, axleGroupLoadKg);
  const axleGroupLoads = model.axleGroups.map((group) => {
    const loadKg = axleLoads
      .filter((axleLoad) => group.axleIds.includes(axleLoad.axleId))
      .reduce((sum, axleLoad) => sum + axleLoad.loadKg, 0);
    return {
      groupId: group.id,
      name: group.name,
      loadKg,
      maxLoadKg: group.maxLoadKg,
      usage: group.maxLoadKg > 0 ? loadKg / group.maxLoadKg : 0,
    };
  });
  const balanceRatio = totalLoadKg > 0 ? axleGroupLoadKg / totalLoadKg : 0;
  const lateralOffsetMm = centerOfGravityMm.z - plan.truck.widthMm / 2;
  const cgHeightRatio = plan.truck.heightMm > 0 ? centerOfGravityMm.y / plan.truck.heightMm : 0;
  const warnings = buildWarnings(plan, {
    grossWeightKg,
    kingpinLoadKg,
    balanceRatio,
    lateralOffsetMm,
    cgHeightRatio,
    axleLoads,
    axleGroupLoads,
  });

  return {
    totalLoadKg,
    grossWeightKg,
    centerOfGravityMm,
    kingpinLoadKg,
    axleGroupLoadKg,
    axleLoads,
    axleGroupLoads,
    kingpinXmm: model.kingpinXmm,
    axleGroupCenterXmm,
    balanceRatio,
    lateralOffsetMm,
    cgHeightRatio,
    warnings,
  };
}

function distributeToAxles(axles: Axle[], loadKg: number): VehicleWeightAnalysis["axleLoads"] {
  const enabled = axles.filter((axle) => axle.enabled);
  const totalCapacity = enabled.reduce((sum, axle) => sum + axle.maxLoadKg, 0);
  return enabled.map((axle) => {
    const share = totalCapacity > 0 ? axle.maxLoadKg / totalCapacity : 1 / Math.max(enabled.length, 1);
    const axleLoad = loadKg * share;
    return {
      axleId: axle.id,
      name: axle.name,
      loadKg: axleLoad,
      maxLoadKg: axle.maxLoadKg,
      usage: axle.maxLoadKg > 0 ? axleLoad / axle.maxLoadKg : 0,
      xMm: axle.xMm,
      wheelCount: axle.wheelCount,
    };
  });
}

function distributeRigidLoad(totalLoadKg: number, cgXmm: number, axles: Axle[]): number {
  if (axles.length <= 1) return totalLoadKg;
  const minX = Math.min(...axles.map((axle) => axle.xMm));
  const maxX = Math.max(...axles.map((axle) => axle.xMm));
  const ratio = clamp((cgXmm - minX) / Math.max(1, maxX - minX), 0, 1);
  return totalLoadKg * ratio;
}

function buildWarnings(
  plan: LoadPlan,
  data: Pick<VehicleWeightAnalysis, "grossWeightKg" | "kingpinLoadKg" | "balanceRatio" | "lateralOffsetMm" | "cgHeightRatio" | "axleLoads" | "axleGroupLoads">,
): string[] {
  const model = plan.vehicleWeightModel;
  const warnings: string[] = [];

  if (data.grossWeightKg > model.maxGrossWeightKg) warnings.push("Se supera el peso bruto maximo del modelo de vehiculo.");
  data.axleLoads.forEach((axle) => {
    if (axle.loadKg > axle.maxLoadKg) warnings.push(`${axle.name} supera su limite de eje.`);
  });
  data.axleGroupLoads.forEach((group) => {
    if (group.loadKg > group.maxLoadKg) warnings.push(`${group.name} supera su limite de grupo.`);
  });
  if (model.recommendedKingpinLoadMaxKg && data.kingpinLoadKg > model.recommendedKingpinLoadMaxKg) warnings.push("Carga excesiva en kingpin.");
  if (model.recommendedKingpinLoadMinKg && data.kingpinLoadKg < model.recommendedKingpinLoadMinKg && plan.items.length > 0) warnings.push("Carga de kingpin demasiado baja.");
  if (data.balanceRatio < 0.45 && plan.items.length > 0) warnings.push("Carga demasiado adelantada.");
  if (data.balanceRatio > 0.78 && plan.items.length > 0) warnings.push("Carga demasiado retrasada.");
  if (data.cgHeightRatio > 0.62) warnings.push("Centro de gravedad alto.");
  if (Math.abs(data.lateralOffsetMm) > plan.truck.widthMm * 0.12) warnings.push("Desequilibrio lateral relevante.");

  return warnings;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
