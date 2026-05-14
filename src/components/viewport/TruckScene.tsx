import { OrbitControls, PerspectiveCamera, TransformControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useLoadPlanStore } from "../../store/useLoadPlanStore";
import type { LoadFlowMode } from "../../types/loadplan";
import { mmToMeters } from "../../utils/units";
import { GridFloor } from "./GridFloor";
import { LoadItemMesh } from "./LoadItemMesh";
import { VehicleModel } from "./VehicleModel";
import { ViewCube } from "./ViewCube";
import { clampDeltaInsideTruck, getItemsBoundingBox, moveItemsWouldCollide } from "../../utils/geometry";
import { metersToMm } from "../../utils/units";
import { analyzeVehicleWeight } from "../../utils/weightAnalysis";
import { getVehicleVisualBounds } from "../../utils/vehicleGeometry";
import { getLoadOrder, getUnloadOrder } from "../../utils/loadWalls";

interface Props {
  flowMode?: LoadFlowMode;
  flowStep: number;
}

export function TruckScene({ flowMode, flowStep }: Props) {
  const controlsRef = useRef<any>(null);
  const groupControlRef = useRef<THREE.Group | null>(null);
  const isTransformPointerActiveRef = useRef(false);
  const lastValidPreviewDeltaRef = useRef({ x: 0, y: 0, z: 0 });
  const [groupControlObject, setGroupControlObject] = useState<THREE.Group | null>(null);
  const [groupDragStartMm, setGroupDragStartMm] = useState<THREE.Vector3 | null>(null);
  const [previewDeltaMm, setPreviewDeltaMm] = useState({ x: 0, y: 0, z: 0 });
  const { camera } = useThree();
  const plan = useLoadPlanStore((state) => state.plan);
  const activeView = useLoadPlanStore((state) => state.activeView);
  const selectedItemId = useLoadPlanStore((state) => state.selectedItemId);
  const selectedItemIds = useLoadPlanStore((state) => state.selectedItemIds);
  const showLabels = useLoadPlanStore((state) => state.showLabels);
  const vehicleDisplay = useLoadPlanStore((state) => state.vehicleDisplay);
  const selectItem = useLoadPlanStore((state) => state.selectItem);
  const moveSelectedByDelta = useLoadPlanStore((state) => state.moveSelectedByDelta);
  const report = useLoadPlanStore((state) => state.report);
  const activeSelectedIds = selectedItemIds.length > 0 ? selectedItemIds : selectedItemId ? [selectedItemId] : [];
  const selectedItems = plan.items.filter((item) => activeSelectedIds.includes(item.id));
  const selectedGroupBounds = getItemsBoundingBox(selectedItems, plan.templates);
  const selectedGroupCenter = selectedGroupBounds ? {
    x: selectedGroupBounds.min.x + selectedGroupBounds.size.x / 2,
    y: selectedGroupBounds.min.y + selectedGroupBounds.size.y / 2,
    z: selectedGroupBounds.min.z + selectedGroupBounds.size.z / 2,
  } : undefined;
  const hasMovableSelection = selectedItems.some((item) => !item.locked);

  const vehicleBounds = useMemo(() => getVehicleVisualBounds(plan.vehicleWeightModel, plan.truck), [plan.truck, plan.vehicleWeightModel]);
  const viewCenter = useMemo(() => new THREE.Vector3(
    mmToMeters(vehicleBounds.centerXmm),
    mmToMeters(vehicleBounds.heightMm / 2),
    mmToMeters(plan.truck.widthMm / 2),
  ), [plan.truck.widthMm, vehicleBounds]);
  const weightAnalysis = useMemo(() => analyzeVehicleWeight(plan), [plan]);
  const groupControlKey = activeSelectedIds.join(":");
  const flowItems = useMemo(() => {
    if (!flowMode) return [];
    return (flowMode === "load" ? getLoadOrder(plan.items) : getUnloadOrder(plan.items)).filter((item) => !item.hidden);
  }, [flowMode, plan.items]);
  const flowIndexById = useMemo(() => new Map(flowItems.map((item, index) => [item.id, index])), [flowItems]);

  const captureGroupControl = useCallback((node: THREE.Group | null) => {
    groupControlRef.current = node;
    setGroupControlObject(node);
  }, []);

  useEffect(() => {
    const length = mmToMeters(vehicleBounds.lengthMm);
    const width = mmToMeters(vehicleBounds.widthMm);
    const height = mmToMeters(vehicleBounds.heightMm);
    const frontX = mmToMeters(vehicleBounds.frontXmm);
    const rearX = mmToMeters(vehicleBounds.rearXmm);
    const sideDistance = Math.max(width * 2.7, length * 0.36);
    const endDistance = Math.max(length * 0.42, 4);
    const positions: Record<typeof activeView, [number, number, number]> = {
      iso: [viewCenter.x + length * 0.58, height * 1.35, viewCenter.z + sideDistance * 0.72],
      top: [viewCenter.x, Math.max(length, width) * 1.18, viewCenter.z],
      left: [viewCenter.x, viewCenter.y, viewCenter.z - sideDistance],
      right: [viewCenter.x, viewCenter.y, viewCenter.z + sideDistance],
      front: [frontX - endDistance, viewCenter.y, viewCenter.z],
      rear: [rearX + endDistance, viewCenter.y, viewCenter.z],
    };
    camera.position.set(...positions[activeView]);
    camera.lookAt(viewCenter);
    controlsRef.current?.target.copy(viewCenter);
    controlsRef.current?.update();
  }, [activeView, camera, vehicleBounds, viewCenter]);

  function commitTransform() {
    if (!groupDragStartMm) return;
    moveSelectedByDelta(previewDeltaMm);
    setPreviewDeltaMm({ x: 0, y: 0, z: 0 });
    lastValidPreviewDeltaRef.current = { x: 0, y: 0, z: 0 };
    isTransformPointerActiveRef.current = false;
    setGroupDragStartMm(null);
  }

  function clampGroupControlPosition() {
    if (!groupControlObject || !groupDragStartMm || !selectedGroupBounds) return;
    const delta = {
      x: metersToMm(groupControlObject.position.x) - groupDragStartMm.x,
      y: metersToMm(groupControlObject.position.y) - groupDragStartMm.y,
      z: metersToMm(groupControlObject.position.z) - groupDragStartMm.z,
    };
    const safeDelta = clampDeltaInsideTruck(selectedGroupBounds, delta, plan.truck);
    const movingIds = selectedItems.filter((item) => !item.locked).map((item) => item.id);
    const collision = moveItemsWouldCollide(movingIds, plan.items, plan.templates, safeDelta);
    const displayDelta = collision ? lastValidPreviewDeltaRef.current : safeDelta;
    if (!collision) {
      lastValidPreviewDeltaRef.current = safeDelta;
    }
    setPreviewDeltaMm(displayDelta);
    groupControlObject.position.set(
      mmToMeters(groupDragStartMm.x + displayDelta.x),
      mmToMeters(groupDragStartMm.y + displayDelta.y),
      mmToMeters(groupDragStartMm.z + displayDelta.z),
    );
  }

  return (
    <>
      <PerspectiveCamera makeDefault position={[10, 6, 6]} fov={45} />
      <color attach="background" args={["#101216"]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 8, 4]} intensity={1.8} castShadow shadow-mapSize={[2048, 2048]} />
      <GridFloor truck={plan.truck} snapMm={plan.snapMm} />
      <VehicleModel truck={plan.truck} settings={vehicleDisplay} analysis={weightAnalysis} vehicleWeightModel={plan.vehicleWeightModel} />
      {plan.items.map((item) => {
        const hasCollision = report.collisions.some((collision) => collision.itemAId === item.id || collision.itemBId === item.id);
        const flowIndex = flowIndexById.get(item.id);
        const flowStatus = getFlowStatus(flowMode, flowStep, flowIndex);
        return (
          <LoadItemMesh
            key={item.id}
            item={item}
            template={plan.templates.find((template) => template.id === item.templateId)}
            selected={activeSelectedIds.includes(item.id)}
            hasCollision={hasCollision}
            previewDeltaMm={previewDeltaMm}
            selectionDisabled={isTransformPointerActiveRef.current}
            showLabel={showLabels}
            flowStatus={flowStatus}
            onSelect={(additive, point) => {
              if (isTransformPointerActiveRef.current) return;
              const clickNearGroupGizmo = selectedGroupCenter
                ? point.distanceTo(new THREE.Vector3(
                  mmToMeters(selectedGroupCenter.x),
                  mmToMeters(selectedGroupCenter.y),
                  mmToMeters(selectedGroupCenter.z),
                )) < 0.55
                : false;
              if (activeSelectedIds.length > 1 && clickNearGroupGizmo) return;
              if (activeSelectedIds.length > 1 && activeSelectedIds.includes(item.id) && !additive) return;
              selectItem(item.id, additive);
            }}
          />
        );
      })}
      {selectedGroupCenter && (
        <group
          key={groupControlKey}
          ref={captureGroupControl}
          position={[mmToMeters(selectedGroupCenter.x), mmToMeters(selectedGroupCenter.y), mmToMeters(selectedGroupCenter.z)]}
        >
          <mesh
            onPointerDown={(event) => {
              event.stopPropagation();
              isTransformPointerActiveRef.current = true;
            }}
            onPointerUp={(event) => {
              event.stopPropagation();
              isTransformPointerActiveRef.current = false;
            }}
            onPointerOut={() => {
              if (!groupDragStartMm) isTransformPointerActiveRef.current = false;
            }}
          >
            <sphereGeometry args={[0.22, 16, 12]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.03} depthWrite={false} />
          </mesh>
        </group>
      )}
      {selectedGroupCenter && groupControlObject && hasMovableSelection && (
          <TransformControls
            object={groupControlObject}
            mode="translate"
            space="world"
            size={0.75}
            showX
            showY
            showZ
            onMouseUp={() => {
              commitTransform();
              if (controlsRef.current) controlsRef.current.enabled = true;
            }}
            onMouseDown={() => {
              isTransformPointerActiveRef.current = true;
              setPreviewDeltaMm({ x: 0, y: 0, z: 0 });
              lastValidPreviewDeltaRef.current = { x: 0, y: 0, z: 0 };
              setGroupDragStartMm(new THREE.Vector3(selectedGroupCenter.x, selectedGroupCenter.y, selectedGroupCenter.z));
              if (controlsRef.current) controlsRef.current.enabled = false;
            }}
            onObjectChange={clampGroupControlPosition}
          />
      )}
      <ViewCube />
      <OrbitControls ref={controlsRef} makeDefault target={viewCenter} enableDamping dampingFactor={0.08} maxPolarAngle={Math.PI / 2.03} />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[viewCenter.x, -0.006, mmToMeters(plan.truck.widthMm / 2)]}
        receiveShadow
        onPointerDown={(event) => {
          event.stopPropagation();
          selectItem(undefined);
        }}
      >
        <planeGeometry args={[mmToMeters(vehicleBounds.lengthMm), mmToMeters(plan.truck.widthMm)]} />
        <shadowMaterial transparent opacity={0.16} />
      </mesh>
    </>
  );
}

function getFlowStatus(flowMode: LoadFlowMode | undefined, flowStep: number, flowIndex: number | undefined): "normal" | "queued" | "active" | "removed" {
  if (!flowMode || flowIndex === undefined) return "normal";
  if (flowMode === "load") {
    if (flowIndex === flowStep - 1) return "active";
    return flowIndex < flowStep ? "normal" : "queued";
  }
  if (flowIndex === flowStep) return "active";
  return flowIndex < flowStep ? "removed" : "normal";
}
