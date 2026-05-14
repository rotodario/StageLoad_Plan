import { Html } from "@react-three/drei";
import type { Truck, VehicleWeightAnalysis } from "../../types/loadplan";
import { mmToMeters } from "../../utils/units";

interface Props {
  truck: Truck;
  analysis: VehicleWeightAnalysis;
  visible: boolean;
}

export function KingpinMarker({ truck, analysis, visible }: Props) {
  if (!visible) return null;
  return (
    <group position={[mmToMeters(analysis.kingpinXmm), -0.02, mmToMeters(truck.widthMm / 2)]}>
      <mesh>
        <cylinderGeometry args={[0.12, 0.12, 0.04, 24]} />
        <meshStandardMaterial color="#7aa2f7" emissive="#1d3d70" emissiveIntensity={0.35} />
      </mesh>
      <Html position={[0, 0.35, 0]} center className="axis-label">Kingpin {analysis.kingpinLoadKg.toFixed(0)} kg</Html>
    </group>
  );
}
