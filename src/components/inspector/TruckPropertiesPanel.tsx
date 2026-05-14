import { Truck } from "lucide-react";
import { useLoadPlanStore } from "../../store/useLoadPlanStore";

export function TruckPropertiesPanel() {
  const plan = useLoadPlanStore((state) => state.plan);
  const setTruck = useLoadPlanStore((state) => state.setTruck);
  const setSnap = useLoadPlanStore((state) => state.setSnap);
  const setWallDepth = useLoadPlanStore((state) => state.setWallDepth);
  return (
    <section className="border-b border-cad-border p-3">
      <h2 className="panel-title mb-3"><Truck size={15} />Camion</h2>
      <label className="field-label">Nombre</label>
      <input className="field-input" value={plan.truck.name} onChange={(event) => setTruck({ name: event.target.value })} />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <NumberField label="Largo mm" value={plan.truck.lengthMm} onChange={(lengthMm) => setTruck({ lengthMm })} />
        <NumberField label="Ancho mm" value={plan.truck.widthMm} onChange={(widthMm) => setTruck({ widthMm })} />
        <NumberField label="Alto mm" value={plan.truck.heightMm} onChange={(heightMm) => setTruck({ heightMm })} />
        <NumberField label="Max kg" value={plan.truck.maxWeightKg} onChange={(maxWeightKg) => setTruck({ maxWeightKg })} />
      </div>
      <label className="field-label mt-3">Snap</label>
      <select className="field-input" value={plan.snapMm} onChange={(event) => setSnap(Number(event.target.value))}>
        <option value={50}>50 mm</option>
        <option value={100}>100 mm</option>
        <option value={250}>250 mm</option>
      </select>
      <label className="field-label mt-3">Profundidad pared</label>
      <select className="field-input" value={plan.wallDepthMm} onChange={(event) => setWallDepth(Number(event.target.value))}>
        <option value={1000}>1.00 m</option>
        <option value={1200}>1.20 m</option>
        <option value={1500}>1.50 m</option>
        <option value={2000}>2.00 m</option>
        <option value={2400}>2.40 m</option>
      </select>
    </section>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <input className="field-input" type="number" value={value} onChange={(event) => onChange(Number(event.target.value) || 0)} />
    </label>
  );
}
