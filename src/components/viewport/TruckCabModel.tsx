import { Edges } from "@react-three/drei";
import type { Truck, VehicleDisplayMode } from "../../types/loadplan";
import { mmToMeters } from "../../utils/units";

interface Props {
  truck: Truck;
  mode: VehicleDisplayMode;
}

export function TruckCabModel({ truck, mode }: Props) {
  const width = mmToMeters(truck.widthMm);
  const cabLength = 2.45;
  const cabHeight = 2.55;
  const opacity = mode === "xray" ? 0.16 : 0.92;
  const ignoreRaycast = () => undefined;

  return (
    <group position={[-cabLength / 2 - 0.28, cabHeight / 2 - 0.05, width / 2]}>
      <mesh castShadow receiveShadow raycast={ignoreRaycast}>
        <boxGeometry args={[cabLength, cabHeight, width * 0.92]} />
        <meshStandardMaterial color="#39424f" roughness={0.82} metalness={0.08} transparent opacity={opacity} />
        <Edges color={mode === "solid" ? "#161a20" : "#d6dde8"} />
      </mesh>
      <mesh position={[0.28, 0.55, 0]} raycast={ignoreRaycast}>
        <boxGeometry args={[1.25, 0.72, width * 0.94]} />
        <meshStandardMaterial color="#1f2933" roughness={0.55} transparent opacity={mode === "xray" ? 0.24 : 0.86} />
      </mesh>
      <mesh position={[-0.95, -1.05, 0]} raycast={ignoreRaycast}>
        <boxGeometry args={[0.9, 0.28, width]} />
        <meshStandardMaterial color="#20262e" roughness={0.85} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}
