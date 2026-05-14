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
  onSelect: (additive: boolean) => void;
}

export const LoadItemMesh = forwardRef<THREE.Group, Props>(function LoadItemMesh({ item, template, selected, hasCollision, onSelect }, ref) {
  if (!template || item.hidden) return null;
  const box = getItemBoundingBox(item, template);
  const size = [mmToMeters(box.size.x), mmToMeters(box.size.y), mmToMeters(box.size.z)] as const;
  const center = [
    mmToMeters(box.min.x + box.size.x / 2),
    mmToMeters(box.min.y + box.size.y / 2),
    mmToMeters(box.min.z + box.size.z / 2),
  ] as const;
  const color = hasCollision ? "#e14d4d" : item.color ?? template.color;
  return (
    <group
      ref={ref}
      position={center}
      onPointerDown={(event) => {
        event.stopPropagation();
        onSelect(event.shiftKey);
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
        <meshStandardMaterial color={color} roughness={0.78} metalness={0.04} opacity={item.locked ? 0.55 : 0.92} transparent />
        <Edges color={selected ? "#ffffff" : hasCollision ? "#ffdddd" : "#1b1f26"} />
      </mesh>
      <Html position={[0, size[1] / 2 + 0.04, 0]} center className={selected ? "item-label selected" : "item-label"}>
        {item.label}
      </Html>
    </group>
  );
});
