import { Edges } from "@react-three/drei";
import type { CabDimensions } from "./CabTypes";
import { cabColors, ignoreCabRaycast } from "./CabTypes";
import { mmToMeters } from "../../../utils/units";

interface Props {
  cab: CabDimensions;
}

export function CabSideDetails({ cab }: Props) {
  const colors = cabColors(cab.sketch);
  const isSemi = cab.model.vehicleType === "semi_trailer";
  const fifthWheelX = mmToMeters((cab.model.visualGeometry.fifthWheelXmm ?? cab.model.kingpinXmm) - cab.cabCenterXmm);
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[-cab.length * 0.08, -cab.height * 0.36, side * cab.width * 0.5]} raycast={ignoreCabRaycast}>
            <boxGeometry args={[cab.length * 0.18, cab.height * 0.035, cab.width * 0.08]} />
            <meshStandardMaterial color={colors.detail} roughness={0.8} transparent opacity={cab.mode === "xray" ? 0.28 : 0.85} />
          </mesh>
          <mesh position={[cab.length * 0.18, -cab.height * 0.43, side * cab.width * 0.39]} raycast={ignoreCabRaycast}>
            <boxGeometry args={[cab.length * 0.24, cab.height * 0.1, cab.width * 0.15]} />
            <meshStandardMaterial color={colors.bodyDark} roughness={0.82} transparent opacity={cab.opacity} />
            <Edges color={colors.edge} />
          </mesh>
        </group>
      ))}
      {isSemi && (
        <mesh position={[fifthWheelX, -cab.height * 0.48, 0]} rotation={[0, 0, Math.PI / 2]} raycast={ignoreCabRaycast}>
          <cylinderGeometry args={[cab.width * 0.16, cab.width * 0.16, 0.055, 32]} />
          <meshStandardMaterial color={colors.trim} roughness={0.76} transparent opacity={cab.mode === "xray" ? 0.45 : 0.9} />
          <Edges color={colors.edge} />
        </mesh>
      )}
    </group>
  );
}
