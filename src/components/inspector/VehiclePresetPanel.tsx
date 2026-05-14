import { Gauge } from "lucide-react";
import { vehiclePresets } from "../../data/vehiclePresets";
import { useLoadPlanStore } from "../../store/useLoadPlanStore";
import type { VehicleWeightAnalysis } from "../../types/loadplan";
import { getCabBounds, getChassisBounds, getTrailerBounds, shouldShowKingpin } from "../../utils/vehicleGeometry";
import { analyzeVehicleWeight } from "../../utils/weightAnalysis";

export function VehiclePresetPanel() {
  const plan = useLoadPlanStore((state) => state.plan);
  const setVehicleWeightPreset = useLoadPlanStore((state) => state.setVehicleWeightPreset);
  const analysis = analyzeVehicleWeight(plan);
  const model = plan.vehicleWeightModel;
  const cab = getCabBounds(model, plan.truck);
  const trailer = getTrailerBounds(model, plan.truck);
  const chassis = getChassisBounds(model, plan.truck);

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
        <Metric label="Tipo" value={model.vehicleType === "semi_trailer" ? "Semi" : model.vehicleType === "rigid" ? "Rigido" : "Road train"} />
        <Metric label="Kingpin" value={shouldShowKingpin(model) ? `${model.kingpinXmm} mm` : "N/A"} />
        <Metric label="Tara trailer" value={`${model.trailerTareKg} kg`} />
        <Metric label="MMA" value={`${model.maxGrossWeightKg} kg`} />
        <Metric label="Carga KP" value={`${analysis.kingpinLoadKg.toFixed(0)} kg`} />
        <Metric label="Peso bruto" value={`${analysis.grossWeightKg.toFixed(0)} kg`} />
      </div>
      <div className="mt-3 rounded border border-cad-border bg-cad-panel2 p-2 text-xs">
        <div className="mb-2 text-[11px] uppercase tracking-wide text-cad-muted">Geometria visual</div>
        <GeometryRow label="Cabina" value={`${cab.frontXmm} -> ${cab.rearXmm} mm`} />
        <GeometryRow label="Caja util" value={`${trailer.frontXmm} -> ${trailer.rearXmm} mm`} />
        <GeometryRow label="Chasis" value={`${chassis.frontXmm} -> ${chassis.rearXmm} mm`} />
      </div>
      <div className="mt-3 space-y-1">
        <div className="text-[11px] uppercase tracking-wide text-cad-muted">Carga por eje</div>
        {analysis.axleLoads.map((axleLoad) => <LoadUsageRow key={axleLoad.axleId} load={axleLoad} />)}
      </div>
      <div className="mt-3 space-y-1">
        <div className="text-[11px] uppercase tracking-wide text-cad-muted">Grupos</div>
        {analysis.axleGroupLoads.map((group) => (
          <div key={group.groupId} className="flex items-center justify-between rounded border border-cad-border bg-cad-panel2 px-2 py-1 text-xs">
            <span className="truncate">{group.name}</span>
            <span className={group.usage > 1 ? "text-cad-danger" : "text-cad-muted"}>
              {group.loadKg.toFixed(0)}/{group.maxLoadKg} kg
            </span>
          </div>
        ))}
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

function GeometryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span className="text-cad-muted">{label}</span>
      <span className="font-mono text-[11px] text-cad-text">{value}</span>
    </div>
  );
}

function LoadUsageRow({ load }: { load: VehicleWeightAnalysis["axleLoads"][number] }) {
  const usagePercent = Math.round(load.usage * 100);
  const barColor = load.usage > 1 ? "#ff5f57" : load.usage > 0.85 ? "#f0b75b" : "#3a9b68";
  return (
    <div className="rounded border border-cad-border bg-cad-panel2 px-2 py-1.5 text-xs">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="truncate">{load.name}</span>
        <span className={load.usage > 1 ? "text-cad-danger" : "text-cad-muted"}>
          {load.loadKg.toFixed(0)}/{load.maxLoadKg} kg
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded bg-[#111419]">
        <div className="h-full" style={{ width: `${Math.min(usagePercent, 130)}%`, backgroundColor: barColor }} />
      </div>
    </div>
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
