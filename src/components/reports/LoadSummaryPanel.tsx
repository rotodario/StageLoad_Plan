import { useLoadPlanStore } from "../../store/useLoadPlanStore";
import { formatVolume } from "../../utils/units";

export function LoadSummaryPanel() {
  const report = useLoadPlanStore((state) => state.report);
  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      <Metric label="Bultos" value={report.totalItems.toString()} />
      <Metric label="Peso" value={`${report.totalWeightKg.toFixed(0)} kg`} />
      <Metric label="Volumen usado" value={formatVolume(report.usedVolumeM3)} />
      <Metric label="Ocupacion" value={`${report.loadPercentage.toFixed(1)}%`} />
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
