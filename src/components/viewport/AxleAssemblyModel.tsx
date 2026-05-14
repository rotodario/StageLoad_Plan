import type { Truck, VehicleDisplayMode } from "../../types/loadplan";
import { mmToMeters } from "../../utils/units";
import { WheelSetModel } from "./WheelSetModel";

interface Props {
  truck: Truck;
  mode: VehicleDisplayMode;
  showWheels: boolean;
}

export function AxleAssemblyModel({ truck, mode, showWheels }: Props) {
  const length = mmToMeters(truck.lengthMm);
  const width = mmToMeters(truck.widthMm);
  const axleXs = [length - 2.8, length - 2.05, length - 1.3];
  const color = mode === "solid" ? "#20262e" : "#9ebcff";
  const ignoreRaycast = () => undefined;

  return (
    <group>
      {axleXs.map((x, index) => (
        <group key={index} position={[x, -0.42, width / 2]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} raycast={ignoreRaycast}>
            <cylinderGeometry args={[0.06, 0.06, width * 1.08, 16]} />
            <meshStandardMaterial color={color} roughness={0.72} metalness={0.12} />
          </mesh>
          {showWheels && <WheelSetModel width={width} mode={mode} />}
        </group>
      ))}
    </group>
  );
}
