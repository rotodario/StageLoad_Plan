import { Edges } from "@react-three/drei";
import type { VehicleDisplayMode } from "../../types/loadplan";

interface Props {
  width: number;
  mode: VehicleDisplayMode;
  wheelCount: number;
  sketch: boolean;
}

export function ProfessionalWheelModel({ width, mode, wheelCount, sketch }: Props) {
  const opacity = mode === "xray" ? 0.42 : 1;
  const ignoreRaycast = () => undefined;
  const dual = wheelCount >= 4;
  const positions = dual
    ? [-width * 0.59, -width * 0.49, width * 0.49, width * 0.59]
    : [-width * 0.55, width * 0.55];
  const tireColor = sketch ? "#f4f4f0" : "#101317";
  const rimColor = sketch ? "#d2d2cc" : "#8f98a3";
  const edgeColor = sketch ? "#111111" : "#3c4652";
  return (
    <group>
      {positions.map((z) => (
        <group key={z} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh castShadow receiveShadow raycast={ignoreRaycast}>
            <cylinderGeometry args={[0.42, 0.42, dual ? 0.18 : 0.28, 40]} />
            <meshStandardMaterial color={tireColor} roughness={0.92} transparent opacity={opacity} />
            <Edges color={edgeColor} />
          </mesh>
          <mesh position={[0, 0, dual ? 0.092 : 0.142]} raycast={ignoreRaycast}>
            <cylinderGeometry args={[0.24, 0.24, 0.018, 32]} />
            <meshStandardMaterial color={rimColor} roughness={0.72} metalness={sketch ? 0 : 0.18} transparent opacity={opacity} />
            <Edges color={edgeColor} />
          </mesh>
          <mesh position={[0, 0, -(dual ? 0.092 : 0.142)]} raycast={ignoreRaycast}>
            <cylinderGeometry args={[0.24, 0.24, 0.018, 32]} />
            <meshStandardMaterial color={rimColor} roughness={0.72} metalness={sketch ? 0 : 0.18} transparent opacity={opacity} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
