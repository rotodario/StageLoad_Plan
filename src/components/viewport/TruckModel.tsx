import { Edges } from "@react-three/drei";
import type { Truck } from "../../types/loadplan";
import { mmToMeters } from "../../utils/units";

interface Props {
  truck: Truck;
}

export function TruckModel({ truck }: Props) {
  const length = mmToMeters(truck.lengthMm);
  const width = mmToMeters(truck.widthMm);
  const height = mmToMeters(truck.heightMm);
  const ignoreRaycast = () => undefined;

  return (
    <group position={[length / 2, height / 2, width / 2]}>
      <mesh raycast={ignoreRaycast}>
        <boxGeometry args={[length, height, width]} />
        <meshStandardMaterial color="#aeb7c5" transparent opacity={0.08} roughness={0.72} metalness={0.05} depthWrite={false} />
        <Edges color="#d6dde8" />
      </mesh>
      <mesh position={[-length / 2 - 0.015, 0, 0]} raycast={ignoreRaycast}>
        <boxGeometry args={[0.03, height, width]} />
        <meshStandardMaterial color="#7aa2f7" transparent opacity={0.12} roughness={0.8} />
      </mesh>
    </group>
  );
}
