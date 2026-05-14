import { OrbitControls, PerspectiveCamera, TransformControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useLoadPlanStore } from "../../store/useLoadPlanStore";
import { mmToMeters } from "../../utils/units";
import { GridFloor } from "./GridFloor";
import { LoadItemMesh } from "./LoadItemMesh";
import { VehicleModel } from "./VehicleModel";
import { ViewCube } from "./ViewCube";
import { clampDeltaInsideTruck, getItemsBoundingBox, moveItemsWouldCollide } from "../../utils/geometry";
import { metersToMm } from "../../utils/units";
import { analyzeVehicleWeight } from "../../utils/weightAnalysis";

export function TruckScene() {
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

  const truckCenter = useMemo(() => new THREE.Vector3(mmToMeters(plan.truck.lengthMm / 2), mmToMeters(plan.truck.heightMm / 2), mmToMeters(plan.truck.widthMm / 2)), [plan.truck]);
  const weightAnalysis = useMemo(() => analyzeVehicleWeight(plan), [plan]);
  const groupControlKey = activeSelectedIds.join(":");

  const captureGroupControl = useCallback((node: THREE.Group | null) => {
    groupControlRef.current = node;
    setGroupControlObject(node);
  }, []);

  useEffect(() => {
    const length = mmToMeters(plan.truck.lengthMm);
    const width = mmToMeters(plan.truck.widthMm);
    const height = mmToMeters(plan.truck.heightMm);
    const positions: Record<typeof activeView, [number, number, number]> = {
      iso: [length * 0.95, height * 1.25, width * 2.4],
      top: [length / 2, Math.max(length, width) * 1.2, width / 2],
      left: [length / 2, height / 2, -width * 2.4],
      right: [length / 2, height / 2, width * 3.4],
      front: [-length * 0.8, height / 2, width / 2],
      rear: [length * 1.8, height / 2, width / 2],
    };
    camera.position.set(...positions[activeView]);
    camera.lookAt(truckCenter);
    controlsRef.current?.target.copy(truckCenter);
    controlsRef.current?.update();
  }, [activeView, camera, plan.truck, truckCenter]);

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
      <OrbitControls ref={controlsRef} makeDefault target={truckCenter} enableDamping dampingFactor={0.08} maxPolarAngle={Math.PI / 2.03} />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[truckCenter.x, -0.006, truckCenter.z]}
        receiveShadow
        onPointerDown={(event) => {
          event.stopPropagation();
          selectItem(undefined);
        }}
      >
        <planeGeometry args={[mmToMeters(plan.truck.lengthMm), mmToMeters(plan.truck.widthMm)]} />
        <shadowMaterial transparent opacity={0.16} />
      </mesh>
    </>
  );
}
