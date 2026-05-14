import { Edges } from "@react-three/drei";
import type { CabModelContext } from "./CabTypes";
import { cabPalette, ignoreCabRaycast } from "./CabTypes";

interface Props {
  cab: CabModelContext;
}

export function CabWheelArches({ cab }: Props) {
  const colors = cabPalette(cab.sketch);
  const archOpacity = cab.mode === "xray" ? 0.28 : 0.92;
  const axleXs = cab.tractorAxleXs.length > 0
    ? cab.tractorAxleXs
    : [cab.frontX + cab.length * 0.34, cab.rearX - cab.length * 0.18];
  return (
    <group>
      {axleXs.map((x, index) => (
        <group key={`${x}-${index}`}>
          {[-1, 1].map((side) => (
            <group key={side} position={[x, cab.bottomY + cab.height * 0.12, side * (cab.halfWidth + 0.018)]}>
              <mesh raycast={ignoreCabRaycast}>
                <torusGeometry args={[cab.height * 0.12, 0.024, 8, 28, Math.PI]} />
                <meshStandardMaterial color={colors.lower} roughness={0.9} transparent opacity={archOpacity} />
                <Edges color={colors.edge} />
              </mesh>
              <mesh position={[0, -cab.height * 0.03, -side * 0.02]} raycast={ignoreCabRaycast}>
                <boxGeometry args={[cab.height * 0.27, cab.height * 0.06, 0.05]} />
                <meshStandardMaterial color={colors.lower} roughness={0.9} transparent opacity={archOpacity} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}
