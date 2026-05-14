import { Edges } from "@react-three/drei";
import type { Truck, VehicleDisplayMode, VehicleWeightModel } from "../../types/loadplan";
import { mmToMeters } from "../../utils/units";
import { getCabBounds } from "../../utils/vehicleGeometry";

interface Props {
  truck: Truck;
  mode: VehicleDisplayMode;
  model: VehicleWeightModel;
  sketch: boolean;
}

export function TruckCabModel({ truck, mode, model, sketch }: Props) {
  const cab = getCabBounds(model, truck);
  const width = mmToMeters(cab.widthMm);
  const cabLength = mmToMeters(cab.lengthMm);
  const cabHeight = mmToMeters(cab.heightMm);
  const opacity = mode === "xray" ? 0.16 : 0.92;
  const ignoreRaycast = () => undefined;

  return (
    <group position={[mmToMeters(cab.centerXmm), cabHeight / 2 - 0.05, mmToMeters(truck.widthMm / 2)]}>
      <mesh castShadow receiveShadow raycast={ignoreRaycast}>
        <boxGeometry args={[cabLength, cabHeight, width * 0.92]} />
        <meshStandardMaterial color={sketch ? "#ededeb" : "#39424f"} roughness={0.82} metalness={sketch ? 0 : 0.08} transparent opacity={opacity} />
        <Edges color={sketch ? "#151515" : mode === "solid" ? "#161a20" : "#d6dde8"} />
      </mesh>
      <mesh position={[cabLength * 0.14, cabHeight * 0.22, 0]} raycast={ignoreRaycast}>
        <boxGeometry args={[cabLength * 0.44, cabHeight * 0.22, width * 0.94]} />
        <meshStandardMaterial color={sketch ? "#d6d6d2" : "#1f2933"} roughness={0.55} transparent opacity={mode === "xray" ? 0.24 : 0.86} />
      </mesh>
      <mesh position={[-cabLength * 0.33, -cabHeight * 0.41, 0]} raycast={ignoreRaycast}>
        <boxGeometry args={[cabLength * 0.28, 0.28, width]} />
        <meshStandardMaterial color={sketch ? "#c8c8c4" : "#20262e"} roughness={0.85} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}
