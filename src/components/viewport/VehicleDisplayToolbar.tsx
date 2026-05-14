import { Activity, Boxes, CircleDot, Eye, Flame, Gauge, ScanLine, Truck } from "lucide-react";
import { useLoadPlanStore } from "../../store/useLoadPlanStore";
import type { VehicleDisplayMode, VehicleDisplaySettings } from "../../types/loadplan";

const modes: VehicleDisplayMode[] = ["solid", "xray", "hybrid"];

const layers: Array<{ key: keyof Omit<VehicleDisplaySettings, "mode">; label: string; icon: typeof Eye }> = [
  { key: "showCab", label: "Cab", icon: Truck },
  { key: "showTrailerShell", label: "Shell", icon: Boxes },
  { key: "showChassis", label: "Chassis", icon: ScanLine },
  { key: "showAxles", label: "Axles", icon: Gauge },
  { key: "showWheels", label: "Wheels", icon: CircleDot },
  { key: "showCenterOfGravity", label: "CG", icon: Activity },
  { key: "showWeightBars", label: "Weight", icon: Gauge },
  { key: "showWeightHeatmap", label: "Heat", icon: Flame },
];

export function VehicleDisplayToolbar() {
  const settings = useLoadPlanStore((state) => state.vehicleDisplay);
  const setVehicleDisplayMode = useLoadPlanStore((state) => state.setVehicleDisplayMode);
  const toggleVehicleLayer = useLoadPlanStore((state) => state.toggleVehicleLayer);

  return (
    <div className="pointer-events-auto absolute left-3 top-12 max-w-[720px] rounded border border-cad-border bg-cad-panel/90 p-1 shadow-xl">
      <div className="flex flex-wrap items-center gap-1">
        {modes.map((mode) => (
          <button key={mode} className={settings.mode === mode ? "view-btn-active" : "view-btn"} onClick={() => setVehicleDisplayMode(mode)}>
            {mode}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-cad-border" />
        {layers.map((layer) => {
          const Icon = layer.icon;
          return (
            <button key={layer.key} className={settings[layer.key] ? "view-btn-active" : "view-btn"} onClick={() => toggleVehicleLayer(layer.key)} title={layer.label}>
              <Icon size={13} />{layer.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
