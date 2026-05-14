import { Html } from "@react-three/drei";
import type { Truck, VehicleWeightAnalysis } from "../../types/loadplan";
import { mmToMeters } from "../../utils/units";

interface Props {
  truck: Truck;
  analysis: VehicleWeightAnalysis;
}

export function WeightBarsOverlay({ truck, analysis }: Props) {
  if (analysis.totalLoadKg <= 0) return null;
  const width = mmToMeters(truck.widthMm);
  const kingpinHeight = Math.max(0.12, (analysis.kingpinLoadKg / Math.max(analysis.totalLoadKg, 1)) * 1.6);
  const axleHeight = Math.max(0.12, (analysis.axleGroupLoadKg / Math.max(analysis.totalLoadKg, 1)) * 1.6);
  return (
    <group>
      <Bar x={mmToMeters(analysis.kingpinXmm)} z={width + 0.42} height={kingpinHeight} color="#7aa2f7" label={`KP ${analysis.kingpinLoadKg.toFixed(0)} kg`} />
      <Bar x={mmToMeters(analysis.axleGroupCenterXmm)} z={width + 0.42} height={axleHeight} color="#f0b75b" label={`Axles ${analysis.axleGroupLoadKg.toFixed(0)} kg`} />
    </group>
  );
}

function Bar({ x, z, height, color, label }: { x: number; z: number; height: number; color: string; label: string }) {
  return (
    <group position={[x, height / 2, z]}>
      <mesh>
        <boxGeometry args={[0.18, height, 0.18]} />
        <meshStandardMaterial color={color} transparent opacity={0.85} />
      </mesh>
      <Html position={[0, height / 2 + 0.18, 0]} center className="axis-label">{label}</Html>
    </group>
  );
}
