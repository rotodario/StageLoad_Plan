import { Edges } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import type { CabModelContext } from "./CabTypes";
import { cabPalette, ignoreCabRaycast } from "./CabTypes";

interface Props {
  cab: CabModelContext;
}

export function CabBody({ cab }: Props) {
  const colors = cabPalette(cab.sketch);
  const shellGeometry = useMemo(() => createCabShellGeometry(cab.length, cab.width, cab.height), [cab.length, cab.width, cab.height]);
  return (
    <group>
      <mesh geometry={shellGeometry} castShadow receiveShadow raycast={ignoreCabRaycast}>
        <meshStandardMaterial color={colors.body} roughness={0.86} metalness={cab.sketch ? 0 : 0.04} transparent opacity={cab.opacity} />
        <Edges color={cab.sketch ? colors.edge : cab.mode === "solid" ? "#151a20" : "#d6dde8"} />
      </mesh>
      <mesh position={[cab.length * 0.09, cab.bottomY + cab.height * 0.14, 0]} raycast={ignoreCabRaycast}>
        <boxGeometry args={[cab.length * 0.72, cab.height * 0.16, cab.width * 0.94]} />
        <meshStandardMaterial color={colors.lower} roughness={0.9} transparent opacity={cab.opacity} />
        <Edges color={colors.edge} />
      </mesh>
      <mesh position={[cab.length * 0.12, cab.bottomY + cab.height * 0.04, 0]} raycast={ignoreCabRaycast}>
        <boxGeometry args={[cab.length * 0.98, cab.height * 0.08, cab.width * 0.72]} />
        <meshStandardMaterial color={colors.chassis} roughness={0.9} transparent opacity={cab.mode === "xray" ? 0.5 : 0.96} />
      </mesh>
    </group>
  );
}

function createCabShellGeometry(length: number, width: number, height: number): THREE.BufferGeometry {
  const front = -length / 2;
  const rear = length / 2;
  const bottom = -height / 2;
  const z = width * 0.46;
  const sideInsetTop = width * 0.035;
  const profile = [
    [front + length * 0.035, bottom],
    [rear - length * 0.06, bottom],
    [rear - length * 0.015, bottom + height * 0.34],
    [rear - length * 0.13, bottom + height * 0.9],
    [front + length * 0.28, bottom + height * 0.94],
    [front + length * 0.08, bottom + height * 0.42],
  ];
  const vertices: number[] = [];
  profile.forEach(([x, y]) => vertices.push(x, y, -z + (y > bottom + height * 0.75 ? sideInsetTop : 0)));
  profile.forEach(([x, y]) => vertices.push(x, y, z - (y > bottom + height * 0.75 ? sideInsetTop : 0)));

  const indices: number[] = [];
  const last = profile.length - 1;
  for (let i = 1; i < last; i += 1) indices.push(0, i, i + 1);
  for (let i = 1; i < last; i += 1) indices.push(profile.length, profile.length + i + 1, profile.length + i);
  for (let i = 0; i < profile.length; i += 1) {
    const next = (i + 1) % profile.length;
    indices.push(i, next, profile.length + next, i, profile.length + next, profile.length + i);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
