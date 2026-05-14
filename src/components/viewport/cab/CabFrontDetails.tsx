import { Edges } from "@react-three/drei";
import type { CabDimensions } from "./CabTypes";
import { cabColors, ignoreCabRaycast } from "./CabTypes";

interface Props {
  cab: CabDimensions;
}

export function CabFrontDetails({ cab }: Props) {
  const colors = cabColors(cab.sketch);
  const frontX = -cab.length * 0.405;
  return (
    <group>
      <mesh position={[frontX - 0.018, -cab.height * 0.13, 0]} rotation={[0, 0, -0.04]} raycast={ignoreCabRaycast}>
        <boxGeometry args={[0.04, cab.height * 0.24, cab.width * 0.58]} />
        <meshStandardMaterial color={colors.trim} roughness={0.82} transparent opacity={cab.mode === "xray" ? 0.28 : 0.9} />
        <Edges color={colors.edge} />
      </mesh>
      {[0.45, 0.34, 0.23].map((y, index) => (
        <mesh key={index} position={[frontX - 0.043, -cab.height * y, 0]} raycast={ignoreCabRaycast}>
          <boxGeometry args={[0.024, 0.025, cab.width * 0.52]} />
          <meshStandardMaterial color={colors.detail} roughness={0.75} transparent opacity={cab.mode === "xray" ? 0.24 : 0.86} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[frontX - 0.05, -cab.height * 0.35, side * cab.width * 0.28]} raycast={ignoreCabRaycast}>
          <boxGeometry args={[0.035, cab.height * 0.07, cab.width * 0.16]} />
          <meshStandardMaterial color={colors.light} roughness={0.45} transparent opacity={cab.mode === "xray" ? 0.3 : 0.92} />
          <Edges color={colors.edge} />
        </mesh>
      ))}
      <mesh position={[frontX - 0.055, -cab.height * 0.48, 0]} raycast={ignoreCabRaycast}>
        <boxGeometry args={[0.09, cab.height * 0.09, cab.width * 0.9]} />
        <meshStandardMaterial color={colors.bodyDark} roughness={0.88} transparent opacity={cab.opacity} />
        <Edges color={colors.edge} />
      </mesh>
    </group>
  );
}
