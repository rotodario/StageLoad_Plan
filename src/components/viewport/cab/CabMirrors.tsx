import { Edges } from "@react-three/drei";
import type { CabModelContext } from "./CabTypes";
import { cabPalette, ignoreCabRaycast } from "./CabTypes";

interface Props {
  cab: CabModelContext;
}

export function CabMirrors({ cab }: Props) {
  const colors = cabPalette(cab.sketch);
  const opacity = cab.mode === "xray" ? 0.34 : 0.9;
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side} position={[cab.frontX + cab.length * 0.24, cab.bottomY + cab.height * 0.62, side * (cab.halfWidth + 0.11)]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} raycast={ignoreCabRaycast}>
            <cylinderGeometry args={[0.016, 0.016, 0.22, 8]} />
            <meshStandardMaterial color={colors.grille} roughness={0.75} transparent opacity={opacity} />
          </mesh>
          <mesh position={[0.02, -cab.height * 0.04, side * 0.08]} raycast={ignoreCabRaycast}>
            <boxGeometry args={[cab.length * 0.055, cab.height * 0.13, 0.04]} />
            <meshStandardMaterial color={colors.glass} roughness={0.42} transparent opacity={opacity} />
            <Edges color={colors.edge} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
