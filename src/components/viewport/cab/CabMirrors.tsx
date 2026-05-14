import { Edges } from "@react-three/drei";
import type { CabDimensions } from "./CabTypes";
import { cabColors, ignoreCabRaycast } from "./CabTypes";

interface Props {
  cab: CabDimensions;
}

export function CabMirrors({ cab }: Props) {
  const colors = cabColors(cab.sketch);
  const opacity = cab.mode === "xray" ? 0.35 : 0.9;
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side} position={[-cab.length * 0.26, cab.height * 0.16, side * cab.width * 0.56]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} raycast={ignoreCabRaycast}>
            <cylinderGeometry args={[0.018, 0.018, cab.width * 0.08, 8]} />
            <meshStandardMaterial color={colors.trim} roughness={0.75} transparent opacity={opacity} />
          </mesh>
          <mesh position={[0, -cab.height * 0.02, side * cab.width * 0.035]} raycast={ignoreCabRaycast}>
            <boxGeometry args={[cab.length * 0.055, cab.height * 0.12, 0.035]} />
            <meshStandardMaterial color={colors.detail} roughness={0.42} transparent opacity={opacity} />
            <Edges color={colors.edge} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
