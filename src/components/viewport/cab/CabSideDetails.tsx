import { Edges } from "@react-three/drei";
import type { CabModelContext } from "./CabTypes";
import { cabPalette, ignoreCabRaycast } from "./CabTypes";
import { mmToMeters } from "../../../utils/units";

interface Props {
  cab: CabModelContext;
}

export function CabSideDetails({ cab }: Props) {
  const colors = cabPalette(cab.sketch);
  const isSemi = cab.model.vehicleType === "semi_trailer";
  const fifthWheelX = mmToMeters((cab.model.visualGeometry.fifthWheelXmm ?? cab.model.kingpinXmm) - cab.cabCenterXmm);
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[cab.frontX + cab.length * 0.42, cab.bottomY + cab.height * 0.17, side * (cab.halfWidth + 0.04)]} raycast={ignoreCabRaycast}>
            <boxGeometry args={[cab.length * 0.2, cab.height * 0.045, 0.12]} />
            <meshStandardMaterial color={colors.trim} roughness={0.84} transparent opacity={cab.mode === "xray" ? 0.3 : 0.9} />
          </mesh>
          <mesh position={[cab.frontX + cab.length * 0.64, cab.bottomY + cab.height * 0.11, side * cab.width * 0.35]} raycast={ignoreCabRaycast}>
            <boxGeometry args={[cab.length * 0.25, cab.height * 0.12, cab.width * 0.14]} />
            <meshStandardMaterial color={colors.lower} roughness={0.88} transparent opacity={cab.opacity} />
            <Edges color={colors.edge} />
          </mesh>
        </group>
      ))}
      {isSemi && (
        <mesh position={[fifthWheelX, cab.bottomY + cab.height * 0.05, 0]} rotation={[0, 0, Math.PI / 2]} raycast={ignoreCabRaycast}>
          <cylinderGeometry args={[cab.width * 0.16, cab.width * 0.16, 0.06, 32]} />
          <meshStandardMaterial color={colors.chassis} roughness={0.78} transparent opacity={cab.mode === "xray" ? 0.52 : 0.92} />
          <Edges color={colors.edge} />
        </mesh>
      )}
    </group>
  );
}
