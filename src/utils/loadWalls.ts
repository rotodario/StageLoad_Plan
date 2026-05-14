import type { LoadItemInstance, LoadItemTemplate, LoadWall } from "../types/loadplan";
import { getItemBoundingBox } from "./geometry";

export const DEFAULT_WALL_DEPTH_MM = 1200;
const ROW_CLUSTER_TOLERANCE_MM = 150;

export function assignLoadWalls(items: LoadItemInstance[], templates: LoadItemTemplate[], wallDepthMm = DEFAULT_WALL_DEPTH_MM): LoadItemInstance[] {
  const walls = generateLoadWalls(items, templates, Number.POSITIVE_INFINITY, wallDepthMm);
  return items.map((item) => ({
    ...item,
    wallNumber: findPrimaryWallNumber(item, templates, walls),
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
  const visibleBoxes = items
    .filter((item) => !item.hidden)
    .map((item) => {
      const template = templates.find((entry) => entry.id === item.templateId);
      return template ? { item, template, box: getItemBoundingBox(item, template) } : undefined;
    })
    .filter((entry): entry is { item: LoadItemInstance; template: LoadItemTemplate; box: ReturnType<typeof getItemBoundingBox> } => Boolean(entry))
    .sort((a, b) => a.box.min.x - b.box.min.x);

  if (visibleBoxes.length === 0) return [];

  const rowStarts = clusterRowStarts(visibleBoxes.map((entry) => entry.box.min.x), Math.max(ROW_CLUSTER_TOLERANCE_MM, Math.min(wallDepthMm * 0.25, 300)));
  const lastItemEnd = Math.max(...visibleBoxes.map((entry) => entry.box.max.x));

  return rowStarts.map((startMm, index) => {
    const wallNumber = index + 1;
    const nextRowStart = rowStarts[index + 1];
    const endMm = Math.min(nextRowStart ?? lastItemEnd, truckLengthMm);
    const wallItems = visibleBoxes
      .filter((entry) => entry.box.min.x < endMm && entry.box.max.x > startMm)
      .map((entry) => entry.item);
    return {
      wallNumber,
      startMm,
      endMm,
      items: wallItems,
      totalWeightKg: wallItems.reduce((sum, item) => sum + (templates.find((entry) => entry.id === item.templateId)?.weightKg ?? 0), 0),
    };
  });
}

function clusterRowStarts(starts: number[], toleranceMm: number): number[] {
  const clusters: number[][] = [];
  starts.forEach((start) => {
    const current = clusters[clusters.length - 1];
    if (!current || Math.abs(start - current[0]) > toleranceMm) {
      clusters.push([start]);
      return;
    }
    current.push(start);
  });
  return clusters.map((cluster) => Math.min(...cluster));
}

function findPrimaryWallNumber(item: LoadItemInstance, templates: LoadItemTemplate[], walls: LoadWall[]): number | undefined {
  const template = templates.find((entry) => entry.id === item.templateId);
  if (!template) return undefined;
  const box = getItemBoundingBox(item, template);
  return walls.find((wall, index) => {
    const nextWall = walls[index + 1];
    const endMm = nextWall?.startMm ?? wall.endMm;
    return box.min.x >= wall.startMm && box.min.x < endMm;
  })?.wallNumber ?? walls[walls.length - 1]?.wallNumber;
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
