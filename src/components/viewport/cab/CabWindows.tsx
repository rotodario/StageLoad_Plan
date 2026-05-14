import { Edges } from "@react-three/drei";
import type { CabDimensions } from "./CabTypes";
import { cabColors, ignoreCabRaycast } from "./CabTypes";

interface Props {
  cab: CabDimensions;
}

export function CabWindows({ cab }: Props) {
  const colors = cabColors(cab.sketch);
  const glassOpacity = cab.mode === "xray" ? 0.18 : cab.sketch ? 0.5 : 0.72;
  return (
    <group>
      <mesh position={[-cab.length * 0.38, cab.height * 0.18, 0]} rotation={[0, 0, -0.08]} raycast={ignoreCabRaycast}>
        <boxGeometry args={[0.055, cab.height * 0.28, cab.width * 0.72]} />
        <meshStandardMaterial color={colors.glass} roughness={0.35} transparent opacity={glassOpacity} />
        <Edges color={colors.edge} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[-cab.length * 0.16, cab.height * 0.19, side * cab.width * 0.466]} raycast={ignoreCabRaycast}>
          <boxGeometry args={[cab.length * 0.28, cab.height * 0.22, 0.035]} />
          <meshStandardMaterial color={colors.glass} roughness={0.4} transparent opacity={glassOpacity} />
          <Edges color={colors.edge} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={`rear-${side}`} position={[cab.length * 0.22, cab.height * 0.16, side * cab.width * 0.466]} raycast={ignoreCabRaycast}>
          <boxGeometry args={[cab.length * 0.16, cab.height * 0.18, 0.035]} />
          <meshStandardMaterial color={colors.glass} roughness={0.4} transparent opacity={glassOpacity * 0.85} />
        </mesh>
      ))}
    </group>
  );
}
