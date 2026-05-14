import { Plus } from "lucide-react";
import type { LoadItemTemplate } from "../../types/loadplan";
import { useLoadPlanStore } from "../../store/useLoadPlanStore";
import { formatMeters } from "../../utils/units";

interface Props {
  template: LoadItemTemplate;
}

export function ItemTemplateCard({ template }: Props) {
  const addItemFromTemplate = useLoadPlanStore((state) => state.addItemFromTemplate);
  return (
    <article className="rounded border border-cad-border bg-cad-panel2 p-2">
      <div className="flex items-start gap-2">
        <span className="mt-1 h-3 w-3 shrink-0 rounded-sm border border-white/20" style={{ background: template.color }} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-cad-text">{template.name}</div>
          <div className="mt-1 text-[11px] uppercase tracking-wide text-cad-muted">{template.category} · {template.department}</div>
          <div className="mt-1 text-xs text-cad-muted">
            {formatMeters(template.lengthMm)} x {formatMeters(template.widthMm)} x {formatMeters(template.heightMm)} · {template.weightKg} kg
          </div>
        </div>
        <button className="icon-btn" onClick={() => addItemFromTemplate(template.id)} title="Añadir al camión">
          <Plus size={16} />
        </button>
      </div>
    </article>
  );
}
