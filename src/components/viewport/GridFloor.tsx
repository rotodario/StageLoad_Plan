import { Grid, Html } from "@react-three/drei";
import type { Truck } from "../../types/loadplan";
import { mmToMeters } from "../../utils/units";

interface Props {
  truck: Truck;
  snapMm: number;
  showLabels: boolean;
  sketch: boolean;
}

export function GridFloor({ truck, snapMm, showLabels, sketch }: Props) {
  const length = mmToMeters(truck.lengthMm);
  const width = mmToMeters(truck.widthMm);
  return (
    <group>
      <Grid
        position={[length / 2, 0, width / 2]}
        args={[length, width]}
        cellSize={mmToMeters(snapMm)}
        cellThickness={0.45}
        cellColor={sketch ? "#b7b7b7" : "#3d4654"}
        sectionSize={1}
        sectionThickness={0.85}
        sectionColor={sketch ? "#777777" : "#657080"}
        fadeDistance={40}
        infiniteGrid={false}
      />
      {showLabels && <Html position={[0, 0.04, 0]} className="axis-label">Door / X0</Html>}
      {showLabels && <Html position={[length, 0.04, width]} className="axis-label">Rear</Html>}
    </group>
  );
}
