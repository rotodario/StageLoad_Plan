import type { LoadItemInstance, LoadItemTemplate, Truck, Vector3Mm } from "../types/loadplan";

export interface BoundsMm {
  min: Vector3Mm;
  max: Vector3Mm;
  size: Vector3Mm;
}

export function getRotatedSize(template: LoadItemTemplate, rotation: Vector3Mm): Vector3Mm {
  const quarterTurns = Math.round((rotation.y % 360) / 90);
  const swapFloorAxes = Math.abs(quarterTurns) % 2 === 1;
  return {
    x: swapFloorAxes ? template.widthMm : template.lengthMm,
    y: template.heightMm,
    z: swapFloorAxes ? template.lengthMm : template.widthMm,
  };
}

export function getItemBoundingBox(instance: LoadItemInstance, template: LoadItemTemplate): BoundsMm {
  const size = getRotatedSize(template, instance.rotation);
  return {
    min: { ...instance.position },
    max: {
      x: instance.position.x + size.x,
      y: instance.position.y + size.y,
      z: instance.position.z + size.z,
    },
    size,
  };
}

export function snapVector(position: Vector3Mm, snapMm: number): Vector3Mm {
  const snap = Math.max(snapMm, 1);
  return {
    x: Math.round(position.x / snap) * snap,
    y: Math.max(0, Math.round(position.y / snap) * snap),
    z: Math.round(position.z / snap) * snap,
  };
}

export function clampInsideTruck(position: Vector3Mm, size: Vector3Mm, truck: Truck): Vector3Mm {
  return {
    x: Math.min(Math.max(position.x, 0), Math.max(0, truck.lengthMm - size.x)),
    y: Math.min(Math.max(position.y, 0), Math.max(0, truck.heightMm - size.y)),
    z: Math.min(Math.max(position.z, 0), Math.max(0, truck.widthMm - size.z)),
  };
}

export function snapToNearbyFaces(
  item: LoadItemInstance,
  template: LoadItemTemplate,
  position: Vector3Mm,
  otherItems: LoadItemInstance[],
  templates: LoadItemTemplate[],
  snapMm: number,
): Vector3Mm {
  const size = getRotatedSize(template, item.rotation);
  const threshold = Math.max(50, snapMm);
  const next = { ...position };

  otherItems.forEach((other) => {
    if (other.id === item.id || other.hidden) return;
    const otherTemplate = templates.find((entry) => entry.id === other.templateId);
    if (!otherTemplate) return;
    const otherBox = getItemBoundingBox(other, otherTemplate);
    const candidates = [
      { axis: "x" as const, value: otherBox.min.x - size.x, source: next.x },
      { axis: "x" as const, value: otherBox.max.x, source: next.x },
      { axis: "z" as const, value: otherBox.min.z - size.z, source: next.z },
      { axis: "z" as const, value: otherBox.max.z, source: next.z },
      { axis: "y" as const, value: otherBox.max.y, source: next.y },
    ];

    candidates.forEach((candidate) => {
      if (Math.abs(candidate.source - candidate.value) <= threshold) {
        next[candidate.axis] = candidate.value;
      }
    });
  });

  return next;
}

export function isInsideTruck(instance: LoadItemInstance, template: LoadItemTemplate, truck: Truck): boolean {
  const box = getItemBoundingBox(instance, template);
  return box.min.x >= 0 && box.min.y >= 0 && box.min.z >= 0
    && box.max.x <= truck.lengthMm
    && box.max.y <= truck.heightMm
    && box.max.z <= truck.widthMm;
}

export function calculateTotalWeight(items: LoadItemInstance[], templates: LoadItemTemplate[]): number {
  return items.reduce((total, item) => total + (templates.find((template) => template.id === item.templateId)?.weightKg ?? 0), 0);
}

export function calculateUsedVolume(items: LoadItemInstance[], templates: LoadItemTemplate[]): number {
  const volumeMm3 = items.reduce((total, item) => {
    const template = templates.find((entry) => entry.id === item.templateId);
    return template ? total + template.lengthMm * template.widthMm * template.heightMm : total;
  }, 0);
  return volumeMm3 / 1_000_000_000;
}

export function calculateTruckVolume(truck: Truck): number {
  return (truck.lengthMm * truck.widthMm * truck.heightMm) / 1_000_000_000;
}

export function calculateLoadPercentage(items: LoadItemInstance[], templates: LoadItemTemplate[], truck: Truck): number {
  const truckVolume = calculateTruckVolume(truck);
  return truckVolume === 0 ? 0 : (calculateUsedVolume(items, templates) / truckVolume) * 100;
}
