import { Edges } from "@react-three/drei";
import type { Truck, VehicleDisplayMode, VehicleWeightAnalysis, VehicleWeightModel } from "../../types/loadplan";
import { mmToMeters } from "../../utils/units";
import { getTrailerBounds } from "../../utils/vehicleGeometry";

interface Props {
  truck: Truck;
  mode: VehicleDisplayMode;
  heatmap: boolean;
  analysis: VehicleWeightAnalysis;
  model: VehicleWeightModel;
  sketch: boolean;
}

export function TrailerShellModel({ truck, mode, heatmap, analysis, model, sketch }: Props) {
  const trailer = getTrailerBounds(model, truck);
  const length = mmToMeters(trailer.lengthMm);
  const width = mmToMeters(trailer.widthMm);
  const height = mmToMeters(truck.heightMm);
  const opacity = mode === "solid" ? 0.28 : mode === "hybrid" ? 0.13 : 0.06;
  const color = sketch ? "#f7f7f3" : heatmap ? heatColor(analysis.balanceRatio) : "#aeb7c5";
  const ignoreRaycast = () => undefined;

  return (
    <group position={[mmToMeters(trailer.centerXmm), height / 2, width / 2]}>
      <mesh raycast={ignoreRaycast}>
        <boxGeometry args={[length, height, width]} />
        <meshStandardMaterial color={color} transparent opacity={sketch ? 0.18 : opacity} roughness={0.76} metalness={sketch ? 0 : 0.04} depthWrite={false} />
        <Edges color={sketch ? "#141414" : mode === "solid" ? "#f0f3f7" : "#d6dde8"} />
      </mesh>
      <mesh position={[-length / 2 - 0.015, 0, 0]} raycast={ignoreRaycast}>
        <boxGeometry args={[0.03, height, width]} />
        <meshStandardMaterial color={sketch ? "#111111" : "#7aa2f7"} transparent opacity={sketch ? 0.32 : 0.18} roughness={0.8} />
      </mesh>
    </group>
  );
}

function heatColor(ratio: number): string {
  if (ratio < 0.45) return "#d9912b";
  if (ratio > 0.78) return "#c94f4f";
  return "#3a9b68";
}
