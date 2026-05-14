import { Html } from "@react-three/drei";
import type { VehicleWeightAnalysis } from "../../types/loadplan";
import { mmToMeters } from "../../utils/units";

interface Props {
  analysis: VehicleWeightAnalysis;
  showLabel: boolean;
  sketch: boolean;
}

export function CenterOfGravityMarker({ analysis, showLabel, sketch }: Props) {
  if (analysis.totalLoadKg <= 0) return null;
  const position = analysis.centerOfGravityMm;
  return (
    <group position={[mmToMeters(position.x), mmToMeters(position.y), mmToMeters(position.z)]}>
      <mesh>
        <sphereGeometry args={[0.16, 24, 16]} />
        <meshStandardMaterial color={sketch ? "#ffffff" : "#f0b75b"} emissive={sketch ? "#000000" : "#5a3200"} emissiveIntensity={sketch ? 0 : 0.35} />
      </mesh>
      {showLabel && <Html position={[0, 0.32, 0]} center className="axis-label">CG</Html>}
    </group>
  );
}
