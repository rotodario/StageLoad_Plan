import type { Truck, VehicleDisplayMode, VehicleWeightModel } from "../../types/loadplan";
import { mmToMeters } from "../../utils/units";
import { getCabBounds } from "../../utils/vehicleGeometry";
import { CabBody } from "./cab/CabBody";
import { CabFrontDetails } from "./cab/CabFrontDetails";
import { CabMirrors } from "./cab/CabMirrors";
import type { CabDimensions, CabRenderMode } from "./cab/CabTypes";
import { CabSideDetails } from "./cab/CabSideDetails";
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
  const cab: CabDimensions = {
    length: mmToMeters(cabBounds.lengthMm),
    width: mmToMeters(cabBounds.widthMm),
    height: mmToMeters(cabBounds.heightMm),
    opacity: mode === "xray" ? 0.16 : mode === "hybrid" ? 0.84 : 0.94,
    mode,
    sketch,
    model,
    cabCenterXmm: cabBounds.centerXmm,
  };

  if (cabRenderMode === "glb") {
    return null;
  }

  return (
    <group position={[mmToMeters(cabBounds.centerXmm), cab.height / 2 - 0.05, mmToMeters(truck.widthMm / 2)]}>
      <CabBody cab={cab} />
      <CabWindows cab={cab} />
      <CabFrontDetails cab={cab} />
      <CabMirrors cab={cab} />
      <CabWheelArches cab={cab} />
      <CabSideDetails cab={cab} />
    </group>
  );
}
