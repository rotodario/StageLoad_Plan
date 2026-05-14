import { Edges } from "@react-three/drei";
import type { CabModelContext } from "./CabTypes";
import { cabPalette, ignoreCabRaycast } from "./CabTypes";

interface Props {
  cab: CabModelContext;
}

export function CabWindows({ cab }: Props) {
  const colors = cabPalette(cab.sketch);
  const opacity = cab.mode === "xray" ? 0.16 : cab.sketch ? 0.48 : 0.68;
  const frontX = cab.frontX + cab.length * 0.175;
  const windshieldY = cab.bottomY + cab.height * 0.66;
  return (
    <group>
      <mesh position={[frontX, windshieldY, 0]} rotation={[0, 0, -0.18]} raycast={ignoreCabRaycast}>
        <boxGeometry args={[0.055, cab.height * 0.34, cab.width * 0.66]} />
        <meshStandardMaterial color={colors.glass} roughness={0.34} metalness={0.02} transparent opacity={opacity} />
        <Edges color={colors.edge} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[cab.frontX + cab.length * 0.35, cab.bottomY + cab.height * 0.66, side * (cab.halfWidth + 0.012)]} raycast={ignoreCabRaycast}>
            <boxGeometry args={[cab.length * 0.26, cab.height * 0.24, 0.035]} />
            <meshStandardMaterial color={colors.glass} roughness={0.4} metalness={0.02} transparent opacity={opacity} />
            <Edges color={colors.edge} />
          </mesh>
          <mesh position={[cab.frontX + cab.length * 0.62, cab.bottomY + cab.height * 0.62, side * (cab.halfWidth + 0.012)]} raycast={ignoreCabRaycast}>
            <boxGeometry args={[cab.length * 0.16, cab.height * 0.2, 0.032]} />
            <meshStandardMaterial color={colors.glass} roughness={0.4} transparent opacity={opacity * 0.82} />
            <Edges color={colors.edge} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
