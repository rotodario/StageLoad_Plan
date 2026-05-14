import { Copy, Eye, EyeOff, Lock, RotateCw, Trash2, Unlock } from "lucide-react";
import { useLoadPlanStore } from "../../store/useLoadPlanStore";
import type { Department, LoadItemInstance } from "../../types/loadplan";

const departments: Department[] = ["lighting", "audio", "video", "rigging", "cable", "backline", "misc"];

export function ItemPropertiesPanel() {
  const plan = useLoadPlanStore((state) => state.plan);
  const selectedItemId = useLoadPlanStore((state) => state.selectedItemId);
  const selectedItemIds = useLoadPlanStore((state) => state.selectedItemIds);
  const updateItem = useLoadPlanStore((state) => state.updateItem);
  const moveItem = useLoadPlanStore((state) => state.moveItem);
  const rotateSelected90 = useLoadPlanStore((state) => state.rotateSelected90);
  const duplicateSelected = useLoadPlanStore((state) => state.duplicateSelected);
  const deleteSelected = useLoadPlanStore((state) => state.deleteSelected);
  const item = plan.items.find((entry) => entry.id === selectedItemId);
  const template = item ? plan.templates.find((entry) => entry.id === item.templateId) : undefined;
  const isMultiSelection = selectedItemIds.length > 1;

  function setNumber(field: keyof LoadItemInstance["position"], value: string) {
    if (!item) return;
    moveItem(item.id, { ...item.position, [field]: Number(value) || 0 });
  }

  if (!item || !template) {
    return (
      <section className="border-b border-cad-border p-3">
        <h2 className="panel-title">Propiedades</h2>
        <p className="text-sm text-cad-muted">Selecciona un bulto para editar posicion, prioridad, bloqueo y visibilidad.</p>
      </section>
    );
  }

  return (
    <section className="border-b border-cad-border p-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="panel-title">{isMultiSelection ? `${selectedItemIds.length} objetos seleccionados` : "Objeto seleccionado"}</h2>
        <div className="flex gap-1">
          <button className="icon-btn" onClick={rotateSelected90} title="Rotar 90 grados"><RotateCw size={15} /></button>
          <button className="icon-btn" onClick={duplicateSelected} title="Duplicar"><Copy size={15} /></button>
          <button className="icon-btn danger" onClick={deleteSelected} title="Eliminar"><Trash2 size={15} /></button>
        </div>
      </div>
      {isMultiSelection && (
        <div className="mb-3 rounded border border-cad-border bg-cad-panel2 p-2 text-xs text-cad-muted">
          El gizmo mueve la seleccion como un grupo. El inspector muestra el ultimo bulto seleccionado.
        </div>
      )}
      <label className="field-label">Etiqueta</label>
      <input className="field-input" value={item.label} onChange={(event) => updateItem(item.id, { label: event.target.value })} />
      <div className="mt-3 grid grid-cols-3 gap-2">
        <NumberField label="X mm" value={item.position.x} onChange={(value) => setNumber("x", value)} />
        <NumberField label="Y mm" value={item.position.y} onChange={(value) => setNumber("y", value)} />
        <NumberField label="Z mm" value={item.position.z} onChange={(value) => setNumber("z", value)} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <NumberField label="Carga" value={item.loadOrder} onChange={(value) => updateItem(item.id, { loadOrder: Number(value) || 0 })} />
        <NumberField label="Descarga" value={item.unloadPriority} onChange={(value) => updateItem(item.id, { unloadPriority: Number(value) || 0 })} />
      </div>
      <label className="field-label mt-3">Departamento</label>
      <select className="field-input" value={item.department ?? template.department} onChange={(event) => updateItem(item.id, { department: event.target.value as Department })}>
        {departments.map((department) => <option key={department} value={department}>{department}</option>)}
      </select>
      <label className="field-label mt-3">Color</label>
      <input className="h-9 w-full rounded border border-cad-border bg-cad-panel2 p-1" type="color" value={item.color ?? template.color} onChange={(event) => updateItem(item.id, { color: event.target.value })} />
      <div className="mt-3 flex gap-2">
        <button className="toolbar-btn flex-1 justify-center" onClick={() => updateItem(item.id, { locked: !item.locked })}>{item.locked ? <Lock size={15} /> : <Unlock size={15} />}{item.locked ? "Bloqueado" : "Libre"}</button>
        <button className="toolbar-btn flex-1 justify-center" onClick={() => updateItem(item.id, { hidden: !item.hidden })}>{item.hidden ? <EyeOff size={15} /> : <Eye size={15} />}{item.hidden ? "Oculto" : "Visible"}</button>
      </div>
      <div className="mt-3 text-xs text-cad-muted">
        {template.lengthMm} x {template.widthMm} x {template.heightMm} mm · {template.weightKg} kg · pared {item.wallNumber ?? "-"}
      </div>
    </section>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <input className="field-input" type="number" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
