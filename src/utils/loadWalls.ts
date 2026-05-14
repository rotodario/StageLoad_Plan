import type { LoadItemInstance, LoadItemTemplate, LoadWall } from "../types/loadplan";
import { getItemBoundingBox } from "./geometry";

export const DEFAULT_WALL_DEPTH_MM = 1200;

export function assignLoadWalls(items: LoadItemInstance[], templates: LoadItemTemplate[], wallDepthMm = DEFAULT_WALL_DEPTH_MM): LoadItemInstance[] {
  return items.map((item) => ({
    ...item,
    wallNumber: Math.floor(item.position.x / wallDepthMm) + 1,
  }));
}

export function assignSpatialLoadOrder(items: LoadItemInstance[], templates: LoadItemTemplate[]): LoadItemInstance[] {
  const orderedIds = getSpatialLoadOrder(items, templates).map((item) => item.id);
  const total = orderedIds.length;
  const orderById = new Map(orderedIds.map((id, index) => [id, index + 1]));
  return items.map((item) => {
    const loadOrder = orderById.get(item.id) ?? item.loadOrder;
    return {
      ...item,
      loadOrder,
      unloadPriority: total - loadOrder + 1,
    };
  });
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

function getSpatialLoadOrder(items: LoadItemInstance[], templates: LoadItemTemplate[]): LoadItemInstance[] {
  return [...items]
    .filter((item) => !item.hidden)
    .sort((a, b) => compareSpatialLoadOrder(a, b, templates));
}

function compareSpatialLoadOrder(a: LoadItemInstance, b: LoadItemInstance, templates: LoadItemTemplate[]): number {
  const templateA = templates.find((template) => template.id === a.templateId);
  const templateB = templates.find((template) => template.id === b.templateId);
  if (!templateA || !templateB) return a.label.localeCompare(b.label);
  const boxA = getItemBoundingBox(a, templateA);
  const boxB = getItemBoundingBox(b, templateB);
  return boxA.min.x - boxB.min.x
    || boxA.min.y - boxB.min.y
    || boxA.min.z - boxB.min.z
    || a.label.localeCompare(b.label);
}
