import { Edges } from "@react-three/drei";
import type { CabDimensions } from "./CabTypes";
import { cabColors, ignoreCabRaycast } from "./CabTypes";

interface Props {
  cab: CabDimensions;
}

export function CabWheelArches({ cab }: Props) {
  const colors = cabColors(cab.sketch);
  const frontWheelX = -cab.length * 0.22;
  const rearFenderX = cab.length * 0.32;
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[frontWheelX, -cab.height * 0.43, side * cab.width * 0.47]} rotation={[0, 0, 0]} raycast={ignoreCabRaycast}>
            <torusGeometry args={[cab.height * 0.12, 0.022, 8, 24, Math.PI]} />
            <meshStandardMaterial color={colors.trim} roughness={0.86} transparent opacity={cab.mode === "xray" ? 0.3 : 0.94} />
            <Edges color={colors.edge} />
          </mesh>
          <mesh position={[rearFenderX, -cab.height * 0.44, side * cab.width * 0.32]} raycast={ignoreCabRaycast}>
            <boxGeometry args={[cab.length * 0.2, cab.height * 0.06, cab.width * 0.18]} />
            <meshStandardMaterial color={colors.bodyDark} roughness={0.86} transparent opacity={cab.opacity} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
