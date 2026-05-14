import { OrbitControls, PerspectiveCamera, TransformControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useLoadPlanStore } from "../../store/useLoadPlanStore";
import { mmToMeters } from "../../utils/units";
import { GridFloor } from "./GridFloor";
import { LoadItemMesh } from "./LoadItemMesh";
import { TruckModel } from "./TruckModel";
import { ViewCube } from "./ViewCube";
import { getItemBoundingBox } from "../../utils/geometry";
import { metersToMm } from "../../utils/units";

export function TruckScene() {
  const controlsRef = useRef<any>(null);
  const transformRef = useRef<any>(null);
  const selectedObject = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const plan = useLoadPlanStore((state) => state.plan);
  const activeView = useLoadPlanStore((state) => state.activeView);
  const selectedItemId = useLoadPlanStore((state) => state.selectedItemId);
  const selectItem = useLoadPlanStore((state) => state.selectItem);
  const moveItem = useLoadPlanStore((state) => state.moveItem);
  const report = useLoadPlanStore((state) => state.report);
  const selectedItem = plan.items.find((item) => item.id === selectedItemId);
  const selectedTemplate = selectedItem ? plan.templates.find((template) => template.id === selectedItem.templateId) : undefined;

  const truckCenter = useMemo(() => new THREE.Vector3(mmToMeters(plan.truck.lengthMm / 2), mmToMeters(plan.truck.heightMm / 2), mmToMeters(plan.truck.widthMm / 2)), [plan.truck]);

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

  useEffect(() => {
    if (!transformRef.current || !selectedObject.current) return;
    transformRef.current.attach(selectedObject.current);
  }, [selectedItemId]);

  function commitTransform() {
    if (!selectedItem || !selectedTemplate || !selectedObject.current) return;
    const box = getItemBoundingBox(selectedItem, selectedTemplate);
    moveItem(selectedItem.id, {
      x: metersToMm(selectedObject.current.position.x) - box.size.x / 2,
      y: metersToMm(selectedObject.current.position.y) - box.size.y / 2,
      z: metersToMm(selectedObject.current.position.z) - box.size.z / 2,
    });
  }

  return (
    <>
      <PerspectiveCamera makeDefault position={[10, 6, 6]} fov={45} />
      <color attach="background" args={["#101216"]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 8, 4]} intensity={1.8} castShadow shadow-mapSize={[2048, 2048]} />
      <GridFloor truck={plan.truck} snapMm={plan.snapMm} />
      <TruckModel truck={plan.truck} />
      {plan.items.map((item) => {
        const hasCollision = report.collisions.some((collision) => collision.itemAId === item.id || collision.itemBId === item.id);
        return (
          <LoadItemMesh
            key={item.id}
            ref={item.id === selectedItemId ? selectedObject : undefined}
            item={item}
            template={plan.templates.find((template) => template.id === item.templateId)}
            selected={item.id === selectedItemId}
            hasCollision={hasCollision}
            onSelect={() => selectItem(item.id)}
          />
        );
      })}
      {selectedItem && selectedTemplate && !selectedItem.locked && (
      <TransformControls
          ref={transformRef}
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
          onObjectChange={() => (controlsRef.current.enabled = false)}
          onMouseDown={() => (controlsRef.current.enabled = false)}
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
