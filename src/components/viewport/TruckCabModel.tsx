import type { Truck, VehicleDisplayMode, VehicleWeightModel } from "../../types/loadplan";
import { mmToMeters } from "../../utils/units";
import { getCabBounds } from "../../utils/vehicleGeometry";
import { CabBody } from "./cab/CabBody";
import { CabFront } from "./cab/CabFront";
import { CabMirrors } from "./cab/CabMirrors";
import { CabRoofDeflector } from "./cab/CabRoofDeflector";
import { CabSideDetails } from "./cab/CabSideDetails";
import type { CabModelContext, CabRenderMode } from "./cab/CabTypes";
import { CabWheelArches } from "./cab/CabWheelArches";
import { CabWindows } from "./cab/CabWindows";

interface Props {
  truck: Truck;
  mode: VehicleDisplayMode;
  model: VehicleWeightModel;
  sketch: boolean;
  cabRenderMode?: CabRenderMode;
}

export function TruckCabModel({ truck, mode, model, sketch, cabRenderMode = "procedural" }: Props) {
  const cabBounds = getCabBounds(model, truck);
  const cabCenterXmm = cabBounds.centerXmm;
  const length = mmToMeters(cabBounds.lengthMm);
  const width = mmToMeters(cabBounds.widthMm);
  const height = mmToMeters(cabBounds.heightMm);
  const cab: CabModelContext = {
    length,
    width,
    height,
    frontX: -length / 2,
    rearX: length / 2,
    bottomY: -height / 2,
    topY: height / 2,
    halfWidth: width / 2,
    opacity: mode === "xray" ? 0.14 : mode === "hybrid" ? 0.82 : 0.96,
    mode,
    sketch,
    model,
    cabCenterXmm,
    tractorAxleXs: model.axles
      .filter((axle) => axle.enabled && axle.axleType !== "trailer")
      .map((axle) => mmToMeters(axle.xMm - cabCenterXmm)),
  };

  if (cabRenderMode === "glb") return null;

  return (
    <group position={[mmToMeters(cabCenterXmm), height / 2 - 0.05, mmToMeters(truck.widthMm / 2)]}>
      <CabBody cab={cab} />
      <CabRoofDeflector cab={cab} />
      <CabWindows cab={cab} />
      <CabFront cab={cab} />
      <CabMirrors cab={cab} />
      <CabWheelArches cab={cab} />
      <CabSideDetails cab={cab} />
    </group>
  );
}
