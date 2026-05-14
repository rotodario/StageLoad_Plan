import { Grid, Html } from "@react-three/drei";
import type { Truck } from "../../types/loadplan";
import { mmToMeters } from "../../utils/units";

interface Props {
  truck: Truck;
  snapMm: number;
}

export function GridFloor({ truck, snapMm }: Props) {
  const length = mmToMeters(truck.lengthMm);
  const width = mmToMeters(truck.widthMm);
  return (
    <group>
      <Grid
        position={[length / 2, 0, width / 2]}
        args={[length, width]}
        cellSize={mmToMeters(snapMm)}
        cellThickness={0.45}
        cellColor="#3d4654"
        sectionSize={1}
        sectionThickness={0.85}
        sectionColor="#657080"
        fadeDistance={40}
        infiniteGrid={false}
      />
      <Html position={[0, 0.04, 0]} className="axis-label">Door / X0</Html>
      <Html position={[length, 0.04, width]} className="axis-label">Rear</Html>
    </group>
  );
}
