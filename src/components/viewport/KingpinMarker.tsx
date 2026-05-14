import { Html } from "@react-three/drei";
import type { Truck, VehicleWeightAnalysis, VehicleWeightModel } from "../../types/loadplan";
import { mmToMeters } from "../../utils/units";
import { shouldShowKingpin } from "../../utils/vehicleGeometry";

interface Props {
  truck: Truck;
  analysis: VehicleWeightAnalysis;
  visible: boolean;
  model: VehicleWeightModel;
  showLabel: boolean;
  sketch: boolean;
}

export function KingpinMarker({ truck, analysis, visible, model, showLabel, sketch }: Props) {
  if (!visible || !shouldShowKingpin(model)) return null;
  const xMm = model.visualGeometry.fifthWheelXmm ?? model.kingpinXmm;
  return (
    <group position={[mmToMeters(xMm), -0.02, mmToMeters(truck.widthMm / 2)]}>
      <mesh>
        <cylinderGeometry args={[0.12, 0.12, 0.04, 24]} />
        <meshStandardMaterial color={sketch ? "#f4f4f1" : "#7aa2f7"} emissive={sketch ? "#000000" : "#1d3d70"} emissiveIntensity={sketch ? 0 : 0.35} />
      </mesh>
      {showLabel && <Html position={[0, 0.35, 0]} center className="axis-label">Kingpin {analysis.kingpinLoadKg.toFixed(0)} kg</Html>}
    </group>
  );
}
