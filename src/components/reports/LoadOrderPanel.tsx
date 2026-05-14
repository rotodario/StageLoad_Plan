import { ListOrdered } from "lucide-react";
import { useState } from "react";
import { useLoadPlanStore } from "../../store/useLoadPlanStore";
import { getLoadOrder, getUnloadOrder } from "../../utils/loadWalls";
import type { LoadItemInstance } from "../../types/loadplan";

type ReportMode = "load" | "unload" | "department" | "wall";

const modes: { id: ReportMode; label: string }[] = [
  { id: "load", label: "Carga" },
  { id: "unload", label: "Descarga" },
  { id: "department", label: "Depto" },
  { id: "wall", label: "Pared" },
];

export function LoadOrderPanel() {
  const [mode, setMode] = useState<ReportMode>("unload");
  const plan = useLoadPlanStore((state) => state.plan);
  const selectItem = useLoadPlanStore((state) => state.selectItem);
  const selectedItemId = useLoadPlanStore((state) => state.selectedItemId);
  const ordered = getReportItems(mode, plan.items);
  return (
    <section className="p-3">
      <h2 className="panel-title mb-3"><ListOrdered size={15} />Listados</h2>
      <div className="mb-3 grid grid-cols-4 gap-1">
        {modes.map((entry) => (
          <button key={entry.id} className={mode === entry.id ? "view-btn-active" : "view-btn"} onClick={() => setMode(entry.id)}>
            {entry.label}
          </button>
        ))}
      </div>
      {ordered.length === 0 ? (
        <p className="text-sm text-cad-muted">Aun no hay bultos colocados.</p>
      ) : (
        <div className="space-y-1">
          {ordered.slice(0, 18).map((item) => (
            <button key={item.id} className={selectedItemId === item.id ? "list-row-active" : "list-row"} onClick={() => selectItem(item.id)}>
              <span className="truncate">{item.label}</span>
              <span>{suffixFor(mode, item)}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function getReportItems(mode: ReportMode, items: LoadItemInstance[]): LoadItemInstance[] {
  if (mode === "load") return getLoadOrder(items);
  if (mode === "unload") return getUnloadOrder(items);
  if (mode === "department") return [...items].sort((a, b) => (a.department ?? "").localeCompare(b.department ?? "") || a.loadOrder - b.loadOrder);
  return [...items].sort((a, b) => (a.wallNumber ?? 0) - (b.wallNumber ?? 0) || a.position.z - b.position.z);
}

function suffixFor(mode: ReportMode, item: LoadItemInstance): string | number {
  if (mode === "load") return item.loadOrder;
  if (mode === "unload") return item.unloadPriority;
  if (mode === "department") return item.department ?? "-";
  return item.wallNumber ?? "-";
}
