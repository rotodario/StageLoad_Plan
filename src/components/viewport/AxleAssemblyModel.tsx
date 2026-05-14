import type { Truck, VehicleDisplayMode, VehicleWeightModel } from "../../types/loadplan";
import { mmToMeters } from "../../utils/units";
import { ProfessionalWheelModel } from "./ProfessionalWheelModel";

interface Props {
  truck: Truck;
  mode: VehicleDisplayMode;
  showWheels: boolean;
  model: VehicleWeightModel;
  sketch: boolean;
}

export function AxleAssemblyModel({ truck, mode, showWheels, model, sketch }: Props) {
  const width = mmToMeters(truck.widthMm);
  const color = sketch ? "#1c1c1c" : mode === "solid" ? "#20262e" : "#9ebcff";
  const ignoreRaycast = () => undefined;
  const enabledAxles = model.axles.filter((axle) => axle.enabled);

  return (
    <group>
      {enabledAxles.map((axle) => (
        <group key={axle.id} position={[mmToMeters(axle.xMm), -0.42, mmToMeters(axle.zMm ?? truck.widthMm / 2)]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} raycast={ignoreRaycast}>
            <cylinderGeometry args={[0.06, 0.06, width * 1.08, 16]} />
            <meshStandardMaterial color={color} roughness={0.72} metalness={0.12} />
          </mesh>
          {showWheels && <ProfessionalWheelModel width={width} mode={mode} wheelCount={axle.wheelCount} sketch={sketch} />}
        </group>
      ))}
    </group>
  );
}
