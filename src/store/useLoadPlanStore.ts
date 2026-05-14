import { create } from "zustand";
import type { LoadItemInstance, LoadItemTemplate, LoadPlan, PlannerReport, Truck, Vector3Mm, ViewPreset, WorkspaceMode } from "../types/loadplan";
import { createDefaultPlan } from "../data/defaultTemplates";
import { calculateLoadPercentage, calculateTotalWeight, calculateTruckVolume, calculateUsedVolume, clampInsideTruck, getItemBoundingBox, getRotatedSize, snapToNearbyFaces, snapVector } from "../utils/geometry";
import { assignLoadWalls } from "../utils/loadWalls";
import { checkAllCollisions, validateLoadPlan } from "../utils/collisions";

const STORAGE_KEY = "stageload-planner-3d-plan";

interface LoadPlanStore {
  plan: LoadPlan;
  selectedItemId?: string;
  activeView: ViewPreset;
  workspaceMode: WorkspaceMode;
  report: PlannerReport;
  addTemplate: (template: Omit<LoadItemTemplate, "id">) => void;
  addItemFromTemplate: (templateId: string) => void;
  selectItem: (itemId?: string) => void;
  updateItem: (itemId: string, patch: Partial<LoadItemInstance>) => void;
  moveItem: (itemId: string, position: Vector3Mm, clamp?: boolean) => void;
  nudgeSelected: (axis: keyof Vector3Mm, direction: -1 | 1) => void;
  rotateSelected90: () => void;
  duplicateSelected: () => void;
  deleteSelected: () => void;
  setSnap: (snapMm: number) => void;
  setTruck: (truck: Partial<Truck>) => void;
  setView: (view: ViewPreset) => void;
  setWorkspaceMode: (mode: WorkspaceMode) => void;
  saveLocal: () => void;
  loadPlan: (plan: LoadPlan) => void;
  resetPlan: () => void;
}

function makeReport(plan: LoadPlan): PlannerReport {
  return {
    totalItems: plan.items.length,
    totalWeightKg: calculateTotalWeight(plan.items, plan.templates),
    usedVolumeM3: calculateUsedVolume(plan.items, plan.templates),
    truckVolumeM3: calculateTruckVolume(plan.truck),
    loadPercentage: calculateLoadPercentage(plan.items, plan.templates, plan.truck),
    collisions: checkAllCollisions(plan.items, plan.templates),
    warnings: validateLoadPlan(plan),
  };
}

function withDerived(plan: LoadPlan): LoadPlan {
  const itemsWithWalls = assignLoadWalls(plan.items, plan.templates);
  const itemsWithBlocking = itemsWithWalls.map((item) => {
    const template = plan.templates.find((entry) => entry.id === item.templateId);
    if (!template) return { ...item, blockedBy: [] };
    const box = getItemBoundingBox(item, template);
    const blockedBy = itemsWithWalls
      .filter((other) => {
        if (other.id === item.id || other.hidden || other.unloadPriority <= item.unloadPriority) return false;
        const otherTemplate = plan.templates.find((entry) => entry.id === other.templateId);
        if (!otherTemplate) return false;
        const otherBox = getItemBoundingBox(other, otherTemplate);
        const betweenItemAndDoor = otherBox.min.x < box.min.x;
        const yOverlap = box.min.y < otherBox.max.y && box.max.y > otherBox.min.y;
        const zOverlap = box.min.z < otherBox.max.z && box.max.z > otherBox.min.z;
        return betweenItemAndDoor && yOverlap && zOverlap;
      })
      .map((other) => other.id);
    return { ...item, blockedBy };
  });
  return {
    ...plan,
    items: itemsWithBlocking,
    updatedAt: new Date().toISOString(),
  };
}

function initialPlan(): LoadPlan {
  const source = localStorage.getItem(STORAGE_KEY);
  if (!source) return createDefaultPlan();
  try {
    return withDerived(JSON.parse(source) as LoadPlan);
  } catch {
    return createDefaultPlan();
  }
}

const loadedPlan = initialPlan();

export const useLoadPlanStore = create<LoadPlanStore>((set, get) => ({
  plan: loadedPlan,
  selectedItemId: undefined,
  activeView: "iso",
  workspaceMode: "viewport",
  report: makeReport(loadedPlan),

  addTemplate: (template) => set((state) => {
    const plan = withDerived({
      ...state.plan,
      templates: [...state.plan.templates, { ...template, id: crypto.randomUUID() }],
    });
    return { plan, report: makeReport(plan) };
  }),

  addItemFromTemplate: (templateId) => set((state) => {
    const template = state.plan.templates.find((entry) => entry.id === templateId);
    if (!template) return state;
    const countForTemplate = state.plan.items.filter((item) => item.templateId === templateId).length + 1;
    const nextPosition = snapVector({
      x: Math.min((countForTemplate - 1) * state.plan.snapMm, state.plan.truck.lengthMm - template.lengthMm),
      y: 0,
      z: 0,
    }, state.plan.snapMm);
    const nextItem: LoadItemInstance = {
      id: crypto.randomUUID(),
      templateId,
      label: `${template.name} ${countForTemplate}`,
      position: nextPosition,
      rotation: { x: 0, y: 0, z: 0 },
      locked: false,
      hidden: false,
      color: template.color,
      department: template.department,
      loadOrder: state.plan.items.length + 1,
      unloadPriority: template.department === "rigging" ? 1 : template.department === "audio" ? 2 : 5,
      blockedBy: [],
      notes: template.notes,
    };
    const plan = withDerived({ ...state.plan, items: [...state.plan.items, nextItem] });
    return { plan, selectedItemId: nextItem.id, report: makeReport(plan) };
  }),

  selectItem: (itemId) => set({ selectedItemId: itemId }),

  updateItem: (itemId, patch) => set((state) => {
    const plan = withDerived({
      ...state.plan,
      items: state.plan.items.map((item) => item.id === itemId ? { ...item, ...patch } : item),
    });
    return { plan, report: makeReport(plan) };
  }),

  moveItem: (itemId, position, shouldClamp = true) => set((state) => {
    const item = state.plan.items.find((entry) => entry.id === itemId);
    const template = item ? state.plan.templates.find((entry) => entry.id === item.templateId) : undefined;
    if (!item || !template || item.locked) return state;
    const snapped = snapVector(position, state.plan.snapMm);
    const snappedToFaces = snapToNearbyFaces(item, template, snapped, state.plan.items, state.plan.templates, state.plan.snapMm);
    const size = getRotatedSize(template, item.rotation);
    const nextPosition = shouldClamp ? clampInsideTruck(snappedToFaces, size, state.plan.truck) : snappedToFaces;
    const plan = withDerived({
      ...state.plan,
      items: state.plan.items.map((entry) => entry.id === itemId ? { ...entry, position: nextPosition } : entry),
    });
    return { plan, report: makeReport(plan) };
  }),

  nudgeSelected: (axis, direction) => set((state) => {
    const selected = state.plan.items.find((item) => item.id === state.selectedItemId);
    if (!selected || selected.locked) return state;
    const nextPosition = {
      ...selected.position,
      [axis]: selected.position[axis] + state.plan.snapMm * direction,
    };
    const template = state.plan.templates.find((entry) => entry.id === selected.templateId);
    if (!template) return state;
    const snappedToFaces = snapToNearbyFaces(selected, template, snapVector(nextPosition, state.plan.snapMm), state.plan.items, state.plan.templates, state.plan.snapMm);
    const position = clampInsideTruck(snappedToFaces, getRotatedSize(template, selected.rotation), state.plan.truck);
    const plan = withDerived({
      ...state.plan,
      items: state.plan.items.map((item) => item.id === selected.id ? { ...item, position } : item),
    });
    return { plan, report: makeReport(plan) };
  }),

  rotateSelected90: () => set((state) => {
    const selected = state.plan.items.find((item) => item.id === state.selectedItemId);
    if (!selected || selected.locked) return state;
    const template = state.plan.templates.find((entry) => entry.id === selected.templateId);
    if (!template?.canRotate) return state;
    const nextRotation = { ...selected.rotation, y: (selected.rotation.y + 90) % 360 };
    const size = getRotatedSize(template, nextRotation);
    const position = clampInsideTruck(selected.position, size, state.plan.truck);
    const plan = withDerived({
      ...state.plan,
      items: state.plan.items.map((item) => item.id === selected.id ? { ...item, rotation: nextRotation, position } : item),
    });
    return { plan, report: makeReport(plan) };
  }),

  duplicateSelected: () => set((state) => {
    const selected = state.plan.items.find((item) => item.id === state.selectedItemId);
    if (!selected) return state;
    const copy = {
      ...selected,
      id: crypto.randomUUID(),
      label: `${selected.label} copy`,
      position: snapVector({ ...selected.position, x: selected.position.x + state.plan.snapMm * 2 }, state.plan.snapMm),
      loadOrder: state.plan.items.length + 1,
    };
    const plan = withDerived({ ...state.plan, items: [...state.plan.items, copy] });
    return { plan, selectedItemId: copy.id, report: makeReport(plan) };
  }),

  deleteSelected: () => set((state) => {
    if (!state.selectedItemId) return state;
    const plan = withDerived({ ...state.plan, items: state.plan.items.filter((item) => item.id !== state.selectedItemId) });
    return { plan, selectedItemId: undefined, report: makeReport(plan) };
  }),

  setSnap: (snapMm) => set((state) => {
    const plan = withDerived({ ...state.plan, snapMm });
    return { plan, report: makeReport(plan) };
  }),

  setTruck: (truck) => set((state) => {
    const plan = withDerived({ ...state.plan, truck: { ...state.plan.truck, ...truck } });
    return { plan, report: makeReport(plan) };
  }),

  setView: (view) => set({ activeView: view }),

  setWorkspaceMode: (mode) => set({ workspaceMode: mode }),

  saveLocal: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(get().plan));
  },

  loadPlan: (nextPlan) => set(() => {
    const plan = withDerived(nextPlan);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    return { plan, selectedItemId: undefined, report: makeReport(plan) };
  }),

  resetPlan: () => set(() => {
    const plan = createDefaultPlan();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    return { plan, selectedItemId: undefined, report: makeReport(plan) };
  }),
}));
