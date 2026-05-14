import { Edges } from "@react-three/drei";
import type { VehicleDisplayMode } from "../../types/loadplan";

interface Props {
  width: number;
  mode: VehicleDisplayMode;
  wheelCount: number;
  sketch: boolean;
}

export function WheelSetModel({ width, mode, wheelCount, sketch }: Props) {
  const opacity = mode === "xray" ? 0.45 : 1;
  const ignoreRaycast = () => undefined;
  const dual = wheelCount >= 4;
  const positions = dual
    ? [-width * 0.59, -width * 0.49, width * 0.49, width * 0.59]
    : [-width * 0.55, width * 0.55];
  return (
    <group>
      {positions.map((z) => (
        <mesh key={z} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow raycast={ignoreRaycast}>
          <cylinderGeometry args={[0.38, 0.38, dual ? 0.18 : 0.28, 32]} />
          <meshStandardMaterial color={sketch ? "#f1f1ed" : "#111418"} roughness={0.9} transparent opacity={opacity} />
          <Edges color={sketch ? "#111111" : "#3c4652"} />
        </mesh>
      ))}
    </group>
  );
}
