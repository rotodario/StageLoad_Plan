import { Edges } from "@react-three/drei";
import type { Truck, VehicleDisplayMode, VehicleWeightModel } from "../../types/loadplan";
import { mmToMeters } from "../../utils/units";
import { getChassisBounds } from "../../utils/vehicleGeometry";

interface Props {
  truck: Truck;
  mode: VehicleDisplayMode;
  model: VehicleWeightModel;
  sketch: boolean;
}

export function TrailerChassisModel({ truck, mode, model, sketch }: Props) {
  const chassis = getChassisBounds(model, truck);
  const length = mmToMeters(chassis.lengthMm);
  const width = mmToMeters(truck.widthMm);
  const y = -0.22;
  const opacity = mode === "xray" ? 0.75 : 0.95;
  const railColor = sketch ? "#2b2b2b" : mode === "solid" ? "#252b33" : "#8fb5ff";
  const ignoreRaycast = () => undefined;

  return (
    <group>
      {[-width * 0.32, width * 0.32].map((offset) => (
        <mesh key={offset} position={[mmToMeters(chassis.centerXmm), y, width / 2 + offset]} castShadow raycast={ignoreRaycast}>
          <boxGeometry args={[length, 0.12, 0.12]} />
          <meshStandardMaterial color={railColor} roughness={0.8} transparent opacity={opacity} />
          <Edges color={sketch ? "#111111" : "#c7d2e3"} />
        </mesh>
      ))}
      {Array.from({ length: 8 }, (_, index) => (
        <mesh key={index} position={[mmToMeters(chassis.frontXmm) + 0.8 + index * Math.max(0.1, length - 1.6) / 7, y, width / 2]} raycast={ignoreRaycast}>
          <boxGeometry args={[0.1, 0.1, width * 0.72]} />
          <meshStandardMaterial color={railColor} roughness={0.8} transparent opacity={opacity} />
        </mesh>
      ))}
    </group>
  );
}
