import { Edges } from "@react-three/drei";
import type { VehicleDisplayMode } from "../../types/loadplan";

interface Props {
  width: number;
  mode: VehicleDisplayMode;
}

export function WheelSetModel({ width, mode }: Props) {
  const opacity = mode === "xray" ? 0.45 : 1;
  const ignoreRaycast = () => undefined;
  return (
    <group>
      {[-width * 0.55, width * 0.55].map((z) => (
        <mesh key={z} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow raycast={ignoreRaycast}>
          <cylinderGeometry args={[0.38, 0.38, 0.28, 32]} />
          <meshStandardMaterial color="#111418" roughness={0.9} transparent opacity={opacity} />
          <Edges color="#3c4652" />
        </mesh>
      ))}
    </group>
  );
}
