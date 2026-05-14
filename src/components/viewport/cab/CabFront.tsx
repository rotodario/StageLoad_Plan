import { Edges } from "@react-three/drei";
import type { CabModelContext } from "./CabTypes";
import { cabPalette, ignoreCabRaycast } from "./CabTypes";

interface Props {
  cab: CabModelContext;
}

export function CabFront({ cab }: Props) {
  const colors = cabPalette(cab.sketch);
  const frontFaceX = cab.frontX + cab.length * 0.045;
  const detailOpacity = cab.mode === "xray" ? 0.24 : 0.9;
  return (
    <group>
      <mesh position={[frontFaceX - 0.02, cab.bottomY + cab.height * 0.33, 0]} rotation={[0, 0, -0.04]} raycast={ignoreCabRaycast}>
        <boxGeometry args={[0.045, cab.height * 0.28, cab.width * 0.56]} />
        <meshStandardMaterial color={colors.grille} roughness={0.86} transparent opacity={detailOpacity} />
        <Edges color={colors.edge} />
      </mesh>
      {[0.26, 0.33, 0.4].map((ratio) => (
        <mesh key={ratio} position={[frontFaceX - 0.047, cab.bottomY + cab.height * ratio, 0]} raycast={ignoreCabRaycast}>
          <boxGeometry args={[0.022, 0.022, cab.width * 0.5]} />
          <meshStandardMaterial color={colors.trim} roughness={0.72} transparent opacity={detailOpacity} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[frontFaceX - 0.055, cab.bottomY + cab.height * 0.2, side * cab.width * 0.3]} raycast={ignoreCabRaycast}>
          <boxGeometry args={[0.04, cab.height * 0.065, cab.width * 0.14]} />
          <meshStandardMaterial color={colors.light} roughness={0.45} transparent opacity={cab.mode === "xray" ? 0.28 : 0.94} />
          <Edges color={colors.edge} />
        </mesh>
      ))}
      <mesh position={[frontFaceX - 0.07, cab.bottomY + cab.height * 0.08, 0]} raycast={ignoreCabRaycast}>
        <boxGeometry args={[0.1, cab.height * 0.1, cab.width * 0.9]} />
        <meshStandardMaterial color={colors.lower} roughness={0.9} transparent opacity={cab.opacity} />
        <Edges color={colors.edge} />
      </mesh>
    </group>
  );
}
