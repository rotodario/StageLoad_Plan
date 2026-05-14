import { Edges } from "@react-three/drei";
import type { Truck, VehicleDisplayMode, VehicleWeightAnalysis } from "../../types/loadplan";
import { mmToMeters } from "../../utils/units";

interface Props {
  truck: Truck;
  mode: VehicleDisplayMode;
  heatmap: boolean;
  analysis: VehicleWeightAnalysis;
}

export function TrailerShellModel({ truck, mode, heatmap, analysis }: Props) {
  const length = mmToMeters(truck.lengthMm);
  const width = mmToMeters(truck.widthMm);
  const height = mmToMeters(truck.heightMm);
  const opacity = mode === "solid" ? 0.28 : mode === "hybrid" ? 0.13 : 0.06;
  const color = heatmap ? heatColor(analysis.balanceRatio) : "#aeb7c5";
  const ignoreRaycast = () => undefined;

  return (
    <group position={[length / 2, height / 2, width / 2]}>
      <mesh raycast={ignoreRaycast}>
        <boxGeometry args={[length, height, width]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.76} metalness={0.04} depthWrite={false} />
        <Edges color={mode === "solid" ? "#f0f3f7" : "#d6dde8"} />
      </mesh>
      <mesh position={[-length / 2 - 0.015, 0, 0]} raycast={ignoreRaycast}>
        <boxGeometry args={[0.03, height, width]} />
        <meshStandardMaterial color="#7aa2f7" transparent opacity={0.18} roughness={0.8} />
      </mesh>
    </group>
  );
}

function heatColor(ratio: number): string {
  if (ratio < 0.45) return "#d9912b";
  if (ratio > 0.78) return "#c94f4f";
  return "#3a9b68";
}
