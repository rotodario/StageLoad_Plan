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

export function boundsIntersect(a: BoundsMm, b: BoundsMm): boolean {
  return a.min.x < b.max.x && a.max.x > b.min.x
    && a.min.y < b.max.y && a.max.y > b.min.y
    && a.min.z < b.max.z && a.max.z > b.min.z;
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

export function findFreeFloorPosition(
  template: LoadItemTemplate,
  items: LoadItemInstance[],
  templates: LoadItemTemplate[],
  truck: Truck,
  snapMm: number,
  preferredItem?: LoadItemInstance,
  rotation: Vector3Mm = { x: 0, y: 0, z: 0 },
): Vector3Mm {
  const probe: LoadItemInstance = {
    id: "__probe__",
    templateId: template.id,
    label: template.name,
    position: { x: 0, y: 0, z: 0 },
    rotation,
    locked: false,
    hidden: false,
    loadOrder: 0,
    unloadPriority: 0,
    blockedBy: [],
  };
  const size = getRotatedSize(template, probe.rotation);
  const step = Math.max(snapMm, 50);
  const wallStep = 1200;

  function fits(position: Vector3Mm): boolean {
    const candidate = { ...probe, position };
    if (!isInsideTruck(candidate, template, truck)) return false;
    const candidateBox = getItemBoundingBox(candidate, template);
    return !items.some((item) => {
      if (item.hidden) return false;
      const itemTemplate = templates.find((entry) => entry.id === item.templateId);
      return itemTemplate ? boundsIntersect(candidateBox, getItemBoundingBox(item, itemTemplate)) : false;
    });
  }

  if (preferredItem) {
    const preferredTemplate = templates.find((entry) => entry.id === preferredItem.templateId);
    if (preferredTemplate) {
      const preferredBox = getItemBoundingBox(preferredItem, preferredTemplate);
      const sameWallCandidates = [
        { x: preferredBox.min.x, y: 0, z: preferredBox.max.z },
        { x: preferredBox.min.x, y: 0, z: preferredBox.min.z - size.z },
      ].map((position) => clampInsideTruck(snapVector(position, step), size, truck));
      const nextToPreferred = sameWallCandidates.find(fits);
      if (nextToPreferred) return nextToPreferred;
    }
  }

  for (let x = 0; x <= truck.lengthMm - size.x; x += wallStep) {
    for (let z = 0; z <= truck.widthMm - size.z; z += step) {
      const candidate = snapVector({ x, y: 0, z }, step);
      if (fits(candidate)) return candidate;
    }
  }

  for (let x = 0; x <= truck.lengthMm - size.x; x += step) {
    for (let z = 0; z <= truck.widthMm - size.z; z += step) {
      const candidate = snapVector({ x, y: 0, z }, step);
      if (fits(candidate)) return candidate;
    }
  }

  return { x: 0, y: 0, z: 0 };
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
