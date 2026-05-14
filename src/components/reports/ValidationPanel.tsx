import { AlertTriangle } from "lucide-react";
import { useLoadPlanStore } from "../../store/useLoadPlanStore";

export function ValidationPanel() {
  const report = useLoadPlanStore((state) => state.report);
  const warnings = [...report.collisions, ...report.warnings];
  return (
    <section className="border-b border-cad-border p-3">
      <h2 className="panel-title mb-3"><AlertTriangle size={15} />Validacion</h2>
      {warnings.length === 0 ? (
        <p className="text-sm text-cad-muted">Sin colisiones ni errores de volumen/peso.</p>
      ) : (
        <div className="space-y-2">
          {warnings.map((warning) => (
            <div key={warning.id} className={warning.severity === "error" ? "warning-error" : "warning-info"}>
              {warning.message}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
