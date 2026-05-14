import { Edges } from "@react-three/drei";
import type { Truck, VehicleDisplayMode } from "../../types/loadplan";
import { mmToMeters } from "../../utils/units";

interface Props {
  truck: Truck;
  mode: VehicleDisplayMode;
}

export function TrailerChassisModel({ truck, mode }: Props) {
  const length = mmToMeters(truck.lengthMm);
  const width = mmToMeters(truck.widthMm);
  const y = -0.22;
  const opacity = mode === "xray" ? 0.75 : 0.95;
  const railColor = mode === "solid" ? "#252b33" : "#8fb5ff";
  const ignoreRaycast = () => undefined;

  return (
    <group>
      {[-width * 0.32, width * 0.32].map((offset) => (
        <mesh key={offset} position={[length / 2, y, width / 2 + offset]} castShadow raycast={ignoreRaycast}>
          <boxGeometry args={[length, 0.12, 0.12]} />
          <meshStandardMaterial color={railColor} roughness={0.8} transparent opacity={opacity} />
          <Edges color="#c7d2e3" />
        </mesh>
      ))}
      {Array.from({ length: 8 }, (_, index) => (
        <mesh key={index} position={[0.8 + index * (length - 1.6) / 7, y, width / 2]} raycast={ignoreRaycast}>
          <boxGeometry args={[0.1, 0.1, width * 0.72]} />
          <meshStandardMaterial color={railColor} roughness={0.8} transparent opacity={opacity} />
        </mesh>
      ))}
    </group>
  );
}
