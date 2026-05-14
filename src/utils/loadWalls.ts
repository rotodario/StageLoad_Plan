import type { LoadItemInstance, LoadItemTemplate, LoadWall } from "../types/loadplan";
import { getItemBoundingBox } from "./geometry";

export const DEFAULT_WALL_DEPTH_MM = 1200;

export function assignLoadWalls(items: LoadItemInstance[], templates: LoadItemTemplate[], wallDepthMm = DEFAULT_WALL_DEPTH_MM): LoadItemInstance[] {
  return items.map((item) => ({
    ...item,
    wallNumber: Math.floor(item.position.x / wallDepthMm) + 1,
  }));
}

export function getItemsByWall(items: LoadItemInstance[], wallNumber: number): LoadItemInstance[] {
  return items.filter((item) => item.wallNumber === wallNumber);
}

export function generateLoadWalls(items: LoadItemInstance[], templates: LoadItemTemplate[], truckLengthMm: number, wallDepthMm = DEFAULT_WALL_DEPTH_MM): LoadWall[] {
  const wallCount = Math.ceil(truckLengthMm / wallDepthMm);
  return Array.from({ length: wallCount }, (_, index) => {
    const wallNumber = index + 1;
    const startMm = index * wallDepthMm;
    const endMm = Math.min(startMm + wallDepthMm, truckLengthMm);
    const wallItems = items.filter((item) => {
      const template = templates.find((entry) => entry.id === item.templateId);
      if (!template) return false;
      const box = getItemBoundingBox(item, template);
      return box.min.x < endMm && box.max.x > startMm;
    });
    return {
      wallNumber,
      startMm,
      endMm,
      items: wallItems,
      totalWeightKg: wallItems.reduce((sum, item) => sum + (templates.find((entry) => entry.id === item.templateId)?.weightKg ?? 0), 0),
    };
  });
}

export function getLoadOrder(items: LoadItemInstance[]): LoadItemInstance[] {
  return [...items].sort((a, b) => a.loadOrder - b.loadOrder);
}

export function getUnloadOrder(items: LoadItemInstance[]): LoadItemInstance[] {
  return [...items].sort((a, b) => a.unloadPriority - b.unloadPriority || b.loadOrder - a.loadOrder);
}
