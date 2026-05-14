import { AlertTriangle, Box, Scale, TriangleRight } from "lucide-react";
import { useLoadPlanStore } from "../../store/useLoadPlanStore";
import { formatVolume } from "../../utils/units";

export function BottomStatusBar() {
  const report = useLoadPlanStore((state) => state.report);
  const errors = report.collisions.length + report.warnings.filter((warning) => warning.severity === "error").length;
  return (
    <footer className="flex items-center gap-5 border-t border-cad-border bg-[#111317] px-3 text-xs text-cad-muted">
      <span className="flex items-center gap-1.5"><Box size={14} />Bultos: <b className="text-cad-text">{report.totalItems}</b></span>
      <span className="flex items-center gap-1.5"><Scale size={14} />Peso: <b className="text-cad-text">{report.totalWeightKg.toFixed(0)} kg</b></span>
      <span className="flex items-center gap-1.5"><TriangleRight size={14} />Volumen: <b className="text-cad-text">{formatVolume(report.usedVolumeM3)}</b></span>
      <span>Ocupacion: <b className="text-cad-text">{report.loadPercentage.toFixed(1)}%</b></span>
      <span className={errors ? "ml-auto flex items-center gap-1.5 text-cad-danger" : "ml-auto flex items-center gap-1.5 text-cad-muted"}>
        <AlertTriangle size={14} />Alertas: {errors}
      </span>
    </footer>
  );
}
