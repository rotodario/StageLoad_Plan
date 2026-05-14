import { Edges } from "@react-three/drei";
import type { CabModelContext } from "./CabTypes";
import { cabPalette, ignoreCabRaycast } from "./CabTypes";

interface Props {
  cab: CabModelContext;
}

export function CabRoofDeflector({ cab }: Props) {
  const colors = cabPalette(cab.sketch);
  return (
    <group>
      <mesh position={[cab.frontX + cab.length * 0.48, cab.topY + cab.height * 0.045, 0]} rotation={[0, 0, -0.06]} raycast={ignoreCabRaycast}>
        <boxGeometry args={[cab.length * 0.42, cab.height * 0.08, cab.width * 0.74]} />
        <meshStandardMaterial color={colors.bodySide} roughness={0.84} transparent opacity={cab.mode === "xray" ? 0.14 : cab.opacity} />
        <Edges color={colors.edge} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[cab.frontX + cab.length * 0.52, cab.topY + cab.height * 0.015, side * cab.width * 0.39]} raycast={ignoreCabRaycast}>
          <boxGeometry args={[cab.length * 0.34, cab.height * 0.05, 0.035]} />
          <meshStandardMaterial color={colors.bodySide} roughness={0.84} transparent opacity={cab.mode === "xray" ? 0.14 : cab.opacity} />
        </mesh>
      ))}
    </group>
  );
}
