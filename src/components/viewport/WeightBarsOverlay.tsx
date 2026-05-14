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
  return (
    <group>
      <Bar x={mmToMeters(analysis.kingpinXmm)} z={width + 0.42} height={kingpinHeight} color="#7aa2f7" label={`KP ${analysis.kingpinLoadKg.toFixed(0)} kg`} />
      {analysis.axleLoads.map((axle) => (
        <Bar
          key={axle.axleId}
          x={mmToMeters(axle.xMm)}
          z={width + 0.42}
          height={Math.max(0.12, axle.usage * 1.6)}
          color={axle.usage > 1 ? "#c94f4f" : axle.usage > 0.85 ? "#f0b75b" : "#3a9b68"}
          label={`${axle.name} ${axle.loadKg.toFixed(0)} kg`}
        />
      ))}
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
