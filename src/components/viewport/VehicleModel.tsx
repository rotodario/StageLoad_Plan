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
  showLabels: boolean;
}

export function VehicleModel({ truck, settings, analysis, vehicleWeightModel, showLabels }: Props) {
  const sketch = settings.visualStyle === "sketch";
  return (
    <group>
      {settings.showCab && <TruckCabModel truck={truck} mode={settings.mode} model={vehicleWeightModel} sketch={sketch} />}
      {settings.showTrailerShell && <TrailerShellModel truck={truck} mode={settings.mode} heatmap={settings.showWeightHeatmap && !sketch} analysis={analysis} model={vehicleWeightModel} sketch={sketch} />}
      {settings.showChassis && <TrailerChassisModel truck={truck} mode={settings.mode} model={vehicleWeightModel} sketch={sketch} />}
      {settings.showAxles && <AxleAssemblyModel truck={truck} mode={settings.mode} showWheels={settings.showWheels} model={vehicleWeightModel} sketch={sketch} />}
      <KingpinMarker truck={truck} analysis={analysis} visible={settings.mode !== "solid"} model={vehicleWeightModel} showLabel={showLabels} sketch={sketch} />
      {settings.showCenterOfGravity && <CenterOfGravityMarker analysis={analysis} showLabel={showLabels} sketch={sketch} />}
      {settings.showWeightBars && <WeightBarsOverlay truck={truck} analysis={analysis} showLabels={showLabels} sketch={sketch} />}
    </group>
  );
}
