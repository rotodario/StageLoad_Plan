import { ItemPropertiesPanel } from "../inspector/ItemPropertiesPanel";
import { TruckPropertiesPanel } from "../inspector/TruckPropertiesPanel";
import { VehiclePresetPanel } from "../inspector/VehiclePresetPanel";
import { LoadWallsPanel } from "../loadwalls/LoadWallsPanel";
import { ValidationPanel } from "../reports/ValidationPanel";

export function RightPropertiesPanel() {
  return (
    <aside className="thin-scrollbar min-h-0 overflow-y-auto border-l border-cad-border bg-cad-panel">
      <ItemPropertiesPanel />
      <TruckPropertiesPanel />
      <VehiclePresetPanel />
      <LoadWallsPanel />
      <ValidationPanel />
    </aside>
  );
}
