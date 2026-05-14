import { create } from "zustand";
import type { LoadItemInstance, LoadItemTemplate, LoadPlan, LocalProjectSummary, PlannerReport, SceneVisualStyle, Truck, Vector3Mm, VehicleDisplayMode, VehicleDisplaySettings, VehicleWeightModel, ViewPreset, WorkspaceMode } from "../types/loadplan";
import { createDefaultPlan } from "../data/defaultTemplates";
import { defaultVehicleWeightModel, getVehiclePresetById } from "../data/vehiclePresets";
import { normalizeVehicleGeometry } from "../utils/vehicleGeometry";
import { boundsIntersect, calculateLoadPercentage, calculateTotalWeight, calculateTruckVolume, calculateUsedVolume, clampDeltaInsideTruck, clampInsideTruck, findFreeFloorPosition, getItemBoundingBox, getItemsBoundingBox, getRotatedSize, isInsideTruck, moveItemsWouldCollide, snapToNearbyFaces, snapVector } from "../utils/geometry";
import { assignLoadWalls, assignSpatialLoadOrder } from "../utils/loadWalls";
import { checkAllCollisions, validateLoadPlan } from "../utils/collisions";

const STORAGE_KEY = "stageload-planner-3d-plan";
const PROJECT_LIBRARY_KEY = "stageload-planner-3d-project-library";
const HISTORY_LIMIT = 50;

interface LoadPlanStore {
  plan: LoadPlan;
  pastPlans: LoadPlan[];
  futurePlans: LoadPlan[];
  selectedItemId?: string;
  selectedItemIds: string[];
  activeView: ViewPreset;
  workspaceMode: WorkspaceMode;
  showLabels: boolean;
  vehicleDisplay: VehicleDisplaySettings;
  projectLibrary: LocalProjectSummary[];
  report: PlannerReport;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  addTemplate: (template: Omit<LoadItemTemplate, "id">) => void;
  addItemFromTemplate: (templateId: string) => void;
  selectItem: (itemId?: string, additive?: boolean) => void;
  updateItem: (itemId: string, patch: Partial<LoadItemInstance>) => void;
  moveItem: (itemId: string, position: Vector3Mm, clamp?: boolean) => void;
  moveSelectedByDelta: (delta: Vector3Mm) => void;
  nudgeSelected: (axis: keyof Vector3Mm, direction: -1 | 1) => void;
  rotateSelected90: () => void;
  duplicateSelected: () => void;
  duplicateSelectedAbove: () => void;
  deleteSelected: () => void;
  setSnap: (snapMm: number) => void;
  setWallDepth: (wallDepthMm: number) => void;
  setWallNote: (wallNumber: number, note: string) => void;
  setVehicleWeightPreset: (presetId: string) => void;
  setTruck: (truck: Partial<Truck>) => void;
  setView: (view: ViewPreset) => void;
  setWorkspaceMode: (mode: WorkspaceMode) => void;
  setVehicleDisplayMode: (mode: VehicleDisplayMode) => void;
  setSceneVisualStyle: (style: SceneVisualStyle) => void;
  toggleVehicleLayer: (layer: keyof Omit<VehicleDisplaySettings, "mode" | "visualStyle">) => void;
  toggleLabels: () => void;
  saveLocal: () => void;
  saveProjectSnapshot: () => void;
  loadProjectSnapshot: (projectId: string) => void;
  deleteProjectSnapshot: (projectId: string) => void;
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
  const normalizedPlan = {
    ...plan,
    wallDepthMm: plan.wallDepthMm || 1200,
    wallNotes: plan.wallNotes || {},
    vehicleWeightModel: normalizeVehicleWeightModel(plan.vehicleWeightModel, plan.truck),
  };
  const orderedItems = assignSpatialLoadOrder(normalizedPlan.items, normalizedPlan.templates);
  const itemsWithWalls = assignLoadWalls(orderedItems, normalizedPlan.templates, normalizedPlan.wallDepthMm);
  // The old blocked-by heuristic used department priority and "closer to door"
  // checks. Load/unload order is now spatial and recalculated from the actual
  // plan, so path-blocking needs a dedicated aisle/door solver to avoid false
  // positives. Keep the field normalized but do not warn from stale heuristics.
  const itemsWithBlocking = itemsWithWalls.map((item) => ({ ...item, blockedBy: [] }));
  return {
    ...normalizedPlan,
    items: itemsWithBlocking,
    updatedAt: new Date().toISOString(),
  };
}

function normalizeVehicleWeightModel(model: VehicleWeightModel | undefined, truck: Truck): VehicleWeightModel {
  const source = model ?? defaultVehicleWeightModel;
  const normalized = {
    ...defaultVehicleWeightModel,
    ...source,
    axles: (source.axles?.length ? source.axles : defaultVehicleWeightModel.axles).map((axle) => ({ ...axle, enabled: axle.enabled ?? true })),
    axleGroups: source.axleGroups?.length ? source.axleGroups : defaultVehicleWeightModel.axleGroups,
  };
  return {
    ...normalized,
    visualGeometry: normalizeVehicleGeometry(normalized, truck),
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

function readProjectLibrary(): LoadPlan[] {
  try {
    const source = localStorage.getItem(PROJECT_LIBRARY_KEY);
    return source ? (JSON.parse(source) as LoadPlan[]).map(withDerived) : [];
  } catch {
    return [];
  }
}

function writeProjectLibrary(plans: LoadPlan[]): void {
  localStorage.setItem(PROJECT_LIBRARY_KEY, JSON.stringify(plans));
}

function summarizeProjects(plans: LoadPlan[]): LocalProjectSummary[] {
  return plans
    .map((plan) => ({
      id: plan.id,
      name: plan.name,
      updatedAt: plan.updatedAt,
      itemCount: plan.items.length,
      truckName: plan.truck.name,
    }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

const loadedProjectLibrary = readProjectLibrary();

const defaultVehicleDisplay: VehicleDisplaySettings = {
  mode: "hybrid",
  visualStyle: "technical",
  showCab: true,
  showTrailerShell: true,
  showChassis: true,
  showAxles: true,
  showWheels: true,
  showCenterOfGravity: true,
  showWeightBars: true,
  showWeightHeatmap: false,
};

function commitPlan(state: LoadPlanStore, plan: LoadPlan, selectedItemId = state.selectedItemId): Partial<LoadPlanStore> {
  const existingIds = new Set(plan.items.map((item) => item.id));
  const selectedItemIds = selectedItemId
    ? (state.selectedItemIds.includes(selectedItemId) ? state.selectedItemIds : [selectedItemId]).filter((id) => existingIds.has(id))
    : [];
  const nextSelectedItemId = selectedItemId && existingIds.has(selectedItemId) ? selectedItemId : selectedItemIds[selectedItemIds.length - 1];
  return {
    plan,
    selectedItemId: nextSelectedItemId,
    selectedItemIds,
    pastPlans: [...state.pastPlans, state.plan].slice(-HISTORY_LIMIT),
    futurePlans: [],
    canUndo: true,
    canRedo: false,
    report: makeReport(plan),
  };
}

function snapDelta(delta: Vector3Mm, snapMm: number): Vector3Mm {
  const snap = Math.max(snapMm, 1);
  return {
    x: Math.round(delta.x / snap) * snap,
    y: Math.round(delta.y / snap) * snap,
    z: Math.round(delta.z / snap) * snap,
  };
}

export const useLoadPlanStore = create<LoadPlanStore>((set, get) => ({
  plan: loadedPlan,
  pastPlans: [],
  futurePlans: [],
  selectedItemId: undefined,
  selectedItemIds: [],
  activeView: "iso",
  workspaceMode: "viewport",
  showLabels: true,
  vehicleDisplay: defaultVehicleDisplay,
  projectLibrary: summarizeProjects(loadedProjectLibrary),
  report: makeReport(loadedPlan),
  canUndo: false,
  canRedo: false,

  undo: () => set((state) => {
    const previousPlan = state.pastPlans[state.pastPlans.length - 1];
    if (!previousPlan) return state;
    const pastPlans = state.pastPlans.slice(0, -1);
    return {
      plan: previousPlan,
      selectedItemId: undefined,
      selectedItemIds: [],
      pastPlans,
      futurePlans: [state.plan, ...state.futurePlans].slice(0, HISTORY_LIMIT),
      canUndo: pastPlans.length > 0,
      canRedo: true,
      report: makeReport(previousPlan),
    };
  }),

  redo: () => set((state) => {
    const nextPlan = state.futurePlans[0];
    if (!nextPlan) return state;
    const futurePlans = state.futurePlans.slice(1);
    return {
      plan: nextPlan,
      selectedItemId: undefined,
      selectedItemIds: [],
      pastPlans: [...state.pastPlans, state.plan].slice(-HISTORY_LIMIT),
      futurePlans,
      canUndo: true,
      canRedo: futurePlans.length > 0,
      report: makeReport(nextPlan),
    };
  }),

  addTemplate: (template) => set((state) => {
    const plan = withDerived({
      ...state.plan,
      templates: [...state.plan.templates, { ...template, id: crypto.randomUUID() }],
    });
    return commitPlan(state, plan);
  }),

  addItemFromTemplate: (templateId) => set((state) => {
    const template = state.plan.templates.find((entry) => entry.id === templateId);
    if (!template) return state;
    const countForTemplate = state.plan.items.filter((item) => item.templateId === templateId).length + 1;
    const nextPosition = findFreeFloorPosition(template, state.plan.items, state.plan.templates, state.plan.truck, state.plan.snapMm);
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
    return commitPlan(state, plan, nextItem.id);
  }),

  selectItem: (itemId, additive = false) => set((state) => {
    if (!itemId) return { selectedItemId: undefined, selectedItemIds: [] };
    if (!additive) return { selectedItemId: itemId, selectedItemIds: [itemId] };

    const alreadySelected = state.selectedItemIds.includes(itemId);
    const selectedItemIds = alreadySelected
      ? state.selectedItemIds.filter((id) => id !== itemId)
      : [...state.selectedItemIds, itemId];
    return {
      selectedItemId: selectedItemIds[selectedItemIds.length - 1],
      selectedItemIds,
    };
  }),

  updateItem: (itemId, patch) => set((state) => {
    const plan = withDerived({
      ...state.plan,
      items: state.plan.items.map((item) => item.id === itemId ? { ...item, ...patch } : item),
    });
    return commitPlan(state, plan);
  }),

  moveItem: (itemId, position, shouldClamp = true) => set((state) => {
    const item = state.plan.items.find((entry) => entry.id === itemId);
    const template = item ? state.plan.templates.find((entry) => entry.id === item.templateId) : undefined;
    if (!item || !template || item.locked) return state;
    const snapped = snapVector(position, state.plan.snapMm);
    const snappedToFaces = snapToNearbyFaces(item, template, snapped, state.plan.items, state.plan.templates, state.plan.snapMm);
    const size = getRotatedSize(template, item.rotation);
    const nextPosition = shouldClamp ? clampInsideTruck(snappedToFaces, size, state.plan.truck) : snappedToFaces;
    const delta = {
      x: nextPosition.x - item.position.x,
      y: nextPosition.y - item.position.y,
      z: nextPosition.z - item.position.z,
    };
    if (moveItemsWouldCollide([item.id], state.plan.items, state.plan.templates, delta)) return state;
    const plan = withDerived({
      ...state.plan,
      items: state.plan.items.map((entry) => entry.id === itemId ? { ...entry, position: nextPosition } : entry),
    });
    return commitPlan(state, plan);
  }),

  moveSelectedByDelta: (delta) => set((state) => {
    const selectedIds = state.selectedItemIds.length > 0 ? state.selectedItemIds : state.selectedItemId ? [state.selectedItemId] : [];
    const selectedItems = state.plan.items.filter((item) => selectedIds.includes(item.id) && !item.locked);
    if (selectedItems.length === 0) return state;

    const snappedDelta = snapDelta(delta, state.plan.snapMm);
    const groupBounds = getItemsBoundingBox(selectedItems, state.plan.templates);
    if (!groupBounds) return state;
    const safeDelta = clampDeltaInsideTruck(groupBounds, snappedDelta, state.plan.truck);
    if (safeDelta.x === 0 && safeDelta.y === 0 && safeDelta.z === 0) return state;
    if (moveItemsWouldCollide(selectedItems.map((item) => item.id), state.plan.items, state.plan.templates, safeDelta)) return state;

    const plan = withDerived({
      ...state.plan,
      items: state.plan.items.map((item) => selectedIds.includes(item.id) && !item.locked
        ? {
          ...item,
          position: {
            x: item.position.x + safeDelta.x,
            y: item.position.y + safeDelta.y,
            z: item.position.z + safeDelta.z,
          },
        }
        : item),
    });
    return commitPlan(state, plan);
  }),

  nudgeSelected: (axis, direction) => set((state) => {
    const selectedIds = state.selectedItemIds.length > 0 ? state.selectedItemIds : state.selectedItemId ? [state.selectedItemId] : [];
    const selectedItems = state.plan.items.filter((item) => selectedIds.includes(item.id) && !item.locked);
    if (selectedItems.length === 0) return state;
    const delta: Vector3Mm = { x: 0, y: 0, z: 0 };
    delta[axis] = state.plan.snapMm * direction;
    const groupBounds = getItemsBoundingBox(selectedItems, state.plan.templates);
    if (!groupBounds) return state;
    const safeDelta = clampDeltaInsideTruck(groupBounds, delta, state.plan.truck);
    if (safeDelta.x === 0 && safeDelta.y === 0 && safeDelta.z === 0) return state;
    if (moveItemsWouldCollide(selectedItems.map((item) => item.id), state.plan.items, state.plan.templates, safeDelta)) return state;
    const plan = withDerived({
      ...state.plan,
      items: state.plan.items.map((item) => selectedIds.includes(item.id) && !item.locked
        ? { ...item, position: { x: item.position.x + safeDelta.x, y: item.position.y + safeDelta.y, z: item.position.z + safeDelta.z } }
        : item),
    });
    return commitPlan(state, plan);
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
    return commitPlan(state, plan);
  }),

  duplicateSelected: () => set((state) => {
    const selected = state.plan.items.find((item) => item.id === state.selectedItemId);
    if (!selected) return state;
    const template = state.plan.templates.find((entry) => entry.id === selected.templateId);
    if (!template) return state;
    const copy = {
      ...selected,
      id: crypto.randomUUID(),
      label: `${selected.label} copy`,
      position: findFreeFloorPosition(template, state.plan.items, state.plan.templates, state.plan.truck, state.plan.snapMm, selected, selected.rotation),
      loadOrder: state.plan.items.length + 1,
    };
    const plan = withDerived({ ...state.plan, items: [...state.plan.items, copy] });
    return commitPlan(state, plan, copy.id);
  }),

  duplicateSelectedAbove: () => set((state) => {
    const selected = state.plan.items.find((item) => item.id === state.selectedItemId);
    if (!selected || selected.hidden) return state;
    const template = state.plan.templates.find((entry) => entry.id === selected.templateId);
    if (!template) return state;

    const selectedBox = getItemBoundingBox(selected, template);
    const copy: LoadItemInstance = {
      ...selected,
      id: crypto.randomUUID(),
      label: `${selected.label} top`,
      position: {
        x: selected.position.x,
        y: selectedBox.max.y,
        z: selected.position.z,
      },
      loadOrder: state.plan.items.length + 1,
    };

    if (!isInsideTruck(copy, template, state.plan.truck)) return state;
    const copyBox = getItemBoundingBox(copy, template);
    const collides = state.plan.items.some((item) => {
      if (item.hidden) return false;
      const itemTemplate = state.plan.templates.find((entry) => entry.id === item.templateId);
      return itemTemplate ? boundsIntersect(copyBox, getItemBoundingBox(item, itemTemplate)) : false;
    });
    if (collides) return state;

    const plan = withDerived({ ...state.plan, items: [...state.plan.items, copy] });
    return commitPlan(state, plan, copy.id);
  }),

  deleteSelected: () => set((state) => {
    const selectedIds = state.selectedItemIds.length > 0 ? state.selectedItemIds : state.selectedItemId ? [state.selectedItemId] : [];
    if (selectedIds.length === 0) return state;
    const plan = withDerived({ ...state.plan, items: state.plan.items.filter((item) => !selectedIds.includes(item.id)) });
    return commitPlan(state, plan, undefined);
  }),

  setSnap: (snapMm) => set((state) => {
    const plan = withDerived({ ...state.plan, snapMm });
    return commitPlan(state, plan);
  }),

  setWallDepth: (wallDepthMm) => set((state) => {
    const plan = withDerived({ ...state.plan, wallDepthMm: Math.max(250, wallDepthMm) });
    return commitPlan(state, plan);
  }),

  setWallNote: (wallNumber, note) => set((state) => {
    const nextNotes = { ...state.plan.wallNotes, [wallNumber]: note };
    if (!note.trim()) {
      delete nextNotes[wallNumber];
    }
    const plan = withDerived({ ...state.plan, wallNotes: nextNotes });
    return commitPlan(state, plan);
  }),

  setVehicleWeightPreset: (presetId) => set((state) => {
    const preset = getVehiclePresetById(presetId);
    if (!preset) return state;
    const plan = withDerived({ ...state.plan, vehicleWeightModel: preset });
    return commitPlan(state, plan);
  }),

  setTruck: (truck) => set((state) => {
    const plan = withDerived({ ...state.plan, truck: { ...state.plan.truck, ...truck } });
    return commitPlan(state, plan);
  }),

  setView: (view) => set({ activeView: view }),

  setWorkspaceMode: (mode) => set({ workspaceMode: mode }),

  setVehicleDisplayMode: (mode) => set({ vehicleDisplay: { ...get().vehicleDisplay, mode } }),

  setSceneVisualStyle: (visualStyle) => set({ vehicleDisplay: { ...get().vehicleDisplay, visualStyle } }),

  toggleVehicleLayer: (layer) => set((state) => ({
    vehicleDisplay: {
      ...state.vehicleDisplay,
      [layer]: !state.vehicleDisplay[layer],
    },
  })),

  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),

  saveLocal: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(get().plan));
  },

  saveProjectSnapshot: () => set((state) => {
    const plan = withDerived({ ...state.plan, updatedAt: new Date().toISOString() });
    const library = readProjectLibrary();
    const withoutCurrent = library.filter((entry) => entry.id !== plan.id);
    const nextLibrary = [plan, ...withoutCurrent];
    writeProjectLibrary(nextLibrary);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    return { plan, projectLibrary: summarizeProjects(nextLibrary), report: makeReport(plan) };
  }),

  loadProjectSnapshot: (projectId) => set(() => {
    const library = readProjectLibrary();
    const sourcePlan = library.find((entry) => entry.id === projectId);
    if (!sourcePlan) return {};
    const plan = withDerived(sourcePlan);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    return {
      plan,
      selectedItemId: undefined,
      selectedItemIds: [],
      pastPlans: [],
      futurePlans: [],
      canUndo: false,
      canRedo: false,
      projectLibrary: summarizeProjects(library),
      report: makeReport(plan),
    };
  }),

  deleteProjectSnapshot: (projectId) => set(() => {
    const nextLibrary = readProjectLibrary().filter((entry) => entry.id !== projectId);
    writeProjectLibrary(nextLibrary);
    return { projectLibrary: summarizeProjects(nextLibrary) };
  }),

  loadPlan: (nextPlan) => set(() => {
    const plan = withDerived(nextPlan);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    return { plan, selectedItemId: undefined, selectedItemIds: [], pastPlans: [], futurePlans: [], canUndo: false, canRedo: false, report: makeReport(plan) };
  }),

  resetPlan: () => set(() => {
    const plan = createDefaultPlan();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    return { plan, selectedItemId: undefined, selectedItemIds: [], pastPlans: [], futurePlans: [], canUndo: false, canRedo: false, report: makeReport(plan) };
  }),
}));
