import type { Truck, VehicleDisplaySettings, VehicleWeightAnalysis, VehicleWeightModel } from "../../types/loadplan";
import { AxleAssemblyModel } from "./AxleAssemblyModel";
import { CenterOfGravityMarker } from "./CenterOfGravityMarker";
import { KingpinMarker } from "./KingpinMarker";
import { TrailerChassisModel } from "./TrailerChassisModel";
import { TrailerShellModel } from "./TrailerShellModel";
import { TruckCabModel } from "./TruckCabModel";
import { WeightBarsOverlay } from "./WeightBarsOverlay";

interface Props {
  truck: Truck;
  settings: VehicleDisplaySettings;
  analysis: VehicleWeightAnalysis;
  vehicleWeightModel: VehicleWeightModel;
}

export function VehicleModel({ truck, settings, analysis, vehicleWeightModel }: Props) {
  return (
    <group>
      {settings.showCab && <TruckCabModel truck={truck} mode={settings.mode} />}
      {settings.showTrailerShell && <TrailerShellModel truck={truck} mode={settings.mode} heatmap={settings.showWeightHeatmap} analysis={analysis} />}
      {settings.showChassis && <TrailerChassisModel truck={truck} mode={settings.mode} />}
      {settings.showAxles && <AxleAssemblyModel truck={truck} mode={settings.mode} showWheels={settings.showWheels} model={vehicleWeightModel} />}
      <KingpinMarker truck={truck} analysis={analysis} visible={settings.mode !== "solid"} />
      {settings.showCenterOfGravity && <CenterOfGravityMarker analysis={analysis} />}
      {settings.showWeightBars && <WeightBarsOverlay truck={truck} analysis={analysis} />}
    </group>
  );
}
