import { Edges, Html } from "@react-three/drei";
import { forwardRef } from "react";
import * as THREE from "three";
import type { LoadItemInstance, LoadItemTemplate } from "../../types/loadplan";
import { getItemBoundingBox } from "../../utils/geometry";
import { mmToMeters } from "../../utils/units";

interface Props {
  item: LoadItemInstance;
  template?: LoadItemTemplate;
  selected: boolean;
  hasCollision: boolean;
  previewDeltaMm?: { x: number; y: number; z: number };
  selectionDisabled?: boolean;
  showLabel: boolean;
  flowStatus?: "normal" | "queued" | "active" | "removed";
  onSelect: (additive: boolean, point: THREE.Vector3) => void;
}

export const LoadItemMesh = forwardRef<THREE.Group, Props>(function LoadItemMesh({ item, template, selected, hasCollision, previewDeltaMm, selectionDisabled, showLabel, flowStatus = "normal", onSelect }, ref) {
  if (!template || item.hidden) return null;
  if (flowStatus === "queued" || flowStatus === "removed") return null;
  const box = getItemBoundingBox(item, template);
  const size = [mmToMeters(box.size.x), mmToMeters(box.size.y), mmToMeters(box.size.z)] as const;
  const center = [
    mmToMeters(box.min.x + box.size.x / 2 + (selected ? previewDeltaMm?.x ?? 0 : 0)),
    mmToMeters(box.min.y + box.size.y / 2 + (selected ? previewDeltaMm?.y ?? 0 : 0)),
    mmToMeters(box.min.z + box.size.z / 2 + (selected ? previewDeltaMm?.z ?? 0 : 0)),
  ] as const;
  const color = hasCollision ? "#e14d4d" : item.color ?? template.color;
  const opacity = item.locked ? 0.55 : 0.92;
  const edgeColor = flowStatus === "active" ? "#f0b75b" : selected ? "#ffffff" : hasCollision ? "#ffdddd" : "#1b1f26";
  const emissive = flowStatus === "active" ? "#4a3210" : "#000000";
  return (
    <group
      ref={ref}
      position={center}
      onPointerDown={(event) => {
        event.stopPropagation();
        if (selectionDisabled) return;
        onSelect(event.shiftKey, event.point);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.78} metalness={0.04} opacity={opacity} transparent emissive={emissive} emissiveIntensity={flowStatus === "active" ? 0.45 : 0} />
        <Edges color={edgeColor} />
      </mesh>
      {showLabel && (
        <Html position={[0, size[1] / 2 + 0.04, 0]} center className={selected || flowStatus === "active" ? "item-label selected" : "item-label"}>
          {flowStatus === "active" ? `${item.loadOrder}. ${item.label}` : item.label}
        </Html>
      )}
    </group>
  );
});
