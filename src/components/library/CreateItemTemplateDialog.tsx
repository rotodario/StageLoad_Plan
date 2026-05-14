import { Plus, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { departmentColors } from "../../data/defaultTemplates";
import { useLoadPlanStore } from "../../store/useLoadPlanStore";
import type { Department } from "../../types/loadplan";

export function CreateItemTemplateDialog() {
  const [open, setOpen] = useState(false);
  const addTemplate = useLoadPlanStore((state) => state.addTemplate);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const department = data.get("department") as Department;
    addTemplate({
      name: String(data.get("name") || "Nuevo bulto"),
      category: String(data.get("category") || "Flightcase"),
      department,
      lengthMm: Number(data.get("lengthMm")) || 1000,
      widthMm: Number(data.get("widthMm")) || 800,
      heightMm: Number(data.get("heightMm")) || 800,
      weightKg: Number(data.get("weightKg")) || 0,
      quantity: Number(data.get("quantity")) || 1,
      color: String(data.get("color") || departmentColors[department]),
      stackable: data.get("stackable") === "on",
      maxStack: Number(data.get("maxStack")) || 1,
      canRotate: data.get("canRotate") === "on",
      canLayFlat: data.get("canLayFlat") === "on",
      notes: String(data.get("notes") || ""),
    });
    setOpen(false);
    event.currentTarget.reset();
  }

  return (
    <>
      <button className="icon-btn" title="Crear plantilla" onClick={() => setOpen(true)}>
        <Plus size={15} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55">
          <form className="w-[520px] rounded border border-cad-border bg-cad-panel p-4 shadow-2xl" onSubmit={submit}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="panel-title">Nueva plantilla</h2>
              <button type="button" className="icon-btn" onClick={() => setOpen(false)}><X size={15} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label><span className="field-label">Nombre</span><input name="name" className="field-input" required /></label>
              <label><span className="field-label">Categoria</span><input name="category" className="field-input" defaultValue="Flightcase" /></label>
              <label><span className="field-label">Departamento</span><select name="department" className="field-input" defaultValue="lighting">{Object.keys(departmentColors).map((department) => <option key={department} value={department}>{department}</option>)}</select></label>
              <label><span className="field-label">Color</span><input name="color" className="h-8 w-full rounded border border-cad-border bg-cad-panel2 p-1" type="color" defaultValue={departmentColors.lighting} /></label>
              <NumberField name="lengthMm" label="Largo mm" value={1200} />
              <NumberField name="widthMm" label="Ancho mm" value={800} />
              <NumberField name="heightMm" label="Alto mm" value={900} />
              <NumberField name="weightKg" label="Peso kg" value={100} />
              <NumberField name="quantity" label="Cantidad" value={1} />
              <NumberField name="maxStack" label="Max stack" value={1} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-cad-muted">
              <label className="flex items-center gap-2"><input name="stackable" type="checkbox" />Apilable</label>
              <label className="flex items-center gap-2"><input name="canRotate" type="checkbox" defaultChecked />Rota</label>
              <label className="flex items-center gap-2"><input name="canLayFlat" type="checkbox" />Tumbar</label>
            </div>
            <label className="field-label mt-3">Notas</label>
            <textarea name="notes" className="min-h-16 w-full rounded border border-cad-border bg-[#15181d] p-2 text-sm outline-none focus:border-cad-accent" />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="toolbar-btn" onClick={() => setOpen(false)}>Cancelar</button>
              <button type="submit" className="toolbar-btn">Crear plantilla</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function NumberField({ name, label, value }: { name: string; label: string; value: number }) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <input name={name} className="field-input" type="number" defaultValue={value} />
    </label>
  );
}
