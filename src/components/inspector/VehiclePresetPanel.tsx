import { Gauge } from "lucide-react";
import { vehiclePresets } from "../../data/vehiclePresets";
import { useLoadPlanStore } from "../../store/useLoadPlanStore";
import { analyzeVehicleWeight } from "../../utils/weightAnalysis";

export function VehiclePresetPanel() {
  const plan = useLoadPlanStore((state) => state.plan);
  const setVehicleWeightPreset = useLoadPlanStore((state) => state.setVehicleWeightPreset);
  const analysis = analyzeVehicleWeight(plan);
  const model = plan.vehicleWeightModel;

  return (
    <section className="border-b border-cad-border p-3">
      <h2 className="panel-title mb-3"><Gauge size={15} />Vehicle Preset</h2>
      <label className="field-label">Modelo</label>
      <select className="field-input" value={model.id} onChange={(event) => setVehicleWeightPreset(event.target.value)}>
        {vehiclePresets.map((preset) => (
          <option key={preset.id} value={preset.id}>{preset.name}</option>
        ))}
      </select>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <Metric label="Kingpin" value={`${model.kingpinXmm} mm`} />
        <Metric label="Grupo ejes" value={`${model.trailerAxleGroupCenterXmm} mm`} />
        <Metric label="Tara trailer" value={`${model.trailerTareKg} kg`} />
        <Metric label="MMA" value={`${model.maxGrossWeightKg} kg`} />
        <Metric label="Carga KP" value={`${analysis.kingpinLoadKg.toFixed(0)} kg`} />
        <Metric label="Peso bruto" value={`${analysis.grossWeightKg.toFixed(0)} kg`} />
      </div>
      <div className="mt-3 space-y-1">
        {model.axles.filter((axle) => axle.enabled).map((axle) => {
          const axleLoad = analysis.axleLoads.find((entry) => entry.axleId === axle.id);
          return (
            <div key={axle.id} className="flex items-center justify-between rounded border border-cad-border bg-cad-panel2 px-2 py-1 text-xs">
              <span className="truncate">{axle.name}</span>
              <span className={(axleLoad?.usage ?? 0) > 1 ? "text-cad-danger" : "text-cad-muted"}>
                {axleLoad?.loadKg.toFixed(0) ?? 0}/{axle.maxLoadKg} kg
              </span>
            </div>
          );
        })}
      </div>
      {analysis.warnings.length > 0 && (
        <div className="mt-3 space-y-1">
          {analysis.warnings.map((warning) => (
            <div key={warning} className="warning-info">{warning}</div>
          ))}
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-cad-border bg-cad-panel2 p-2">
      <div className="text-cad-muted">{label}</div>
      <div className="mt-1 font-semibold text-cad-text">{value}</div>
    </div>
  );
}
