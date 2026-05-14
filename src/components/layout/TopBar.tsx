import { Boxes, Columns3, Download, FileJson, FolderOpen, Redo2, RotateCcw, Save, Undo2, View } from "lucide-react";
import { useRef } from "react";
import { useLoadPlanStore } from "../../store/useLoadPlanStore";
import { exportPlanJson, parsePlanJson } from "../../utils/exportJson";
import type { ViewPreset } from "../../types/loadplan";

const views: { id: ViewPreset; label: string }[] = [
  { id: "iso", label: "Iso" },
  { id: "top", label: "Top" },
  { id: "front", label: "Door" },
  { id: "rear", label: "Rear" },
  { id: "left", label: "Left" },
  { id: "right", label: "Right" },
];

export function TopBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const plan = useLoadPlanStore((state) => state.plan);
  const activeView = useLoadPlanStore((state) => state.activeView);
  const workspaceMode = useLoadPlanStore((state) => state.workspaceMode);
  const setView = useLoadPlanStore((state) => state.setView);
  const setWorkspaceMode = useLoadPlanStore((state) => state.setWorkspaceMode);
  const saveLocal = useLoadPlanStore((state) => state.saveLocal);
  const loadPlan = useLoadPlanStore((state) => state.loadPlan);
  const resetPlan = useLoadPlanStore((state) => state.resetPlan);
  const undo = useLoadPlanStore((state) => state.undo);
  const redo = useLoadPlanStore((state) => state.redo);
  const canUndo = useLoadPlanStore((state) => state.canUndo);
  const canRedo = useLoadPlanStore((state) => state.canRedo);

  function exportJson() {
    const blob = new Blob([exportPlanJson(plan)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${plan.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importJson(file?: File) {
    if (!file) return;
    loadPlan(parsePlanJson(await file.text()));
  }

  return (
    <header className="flex items-center gap-2 border-b border-cad-border bg-cad-panel px-3 text-sm">
      <div className="mr-3 flex min-w-0 items-center gap-2 font-semibold tracking-wide">
        <FileJson size={17} className="text-cad-accent" />
        <span className="truncate">{plan.name}</span>
      </div>
      <button className="toolbar-btn" onClick={saveLocal} title="Guardar local"><Save size={16} />Guardar</button>
      <button className="toolbar-btn" onClick={() => inputRef.current?.click()} title="Cargar JSON"><FolderOpen size={16} />Cargar</button>
      <button className="toolbar-btn" onClick={exportJson} title="Exportar JSON"><Download size={16} />Exportar</button>
      <button className="toolbar-btn" onClick={resetPlan} title="Nuevo plan"><RotateCcw size={16} />Reset</button>
      <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={(event) => importJson(event.target.files?.[0])} />
      <div className="ml-2 flex items-center gap-1 border-l border-cad-border pl-2">
        <button className="icon-btn" onClick={undo} disabled={!canUndo} title="Deshacer"><Undo2 size={15} /></button>
        <button className="icon-btn" onClick={redo} disabled={!canRedo} title="Rehacer"><Redo2 size={15} /></button>
      </div>
      <div className="ml-2 flex items-center gap-1 border-l border-cad-border pl-2">
        <button className={workspaceMode === "viewport" ? "view-btn-active" : "view-btn"} onClick={() => setWorkspaceMode("viewport")}>
          <Boxes size={14} />3D
        </button>
        <button className={workspaceMode === "loadwalls" ? "view-btn-active" : "view-btn"} onClick={() => setWorkspaceMode("loadwalls")}>
          <Columns3 size={14} />Paredes
        </button>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <View size={15} className="text-cad-muted" />
        {views.map((view) => (
          <button key={view.id} className={activeView === view.id ? "view-btn-active" : "view-btn"} onClick={() => setView(view.id)}>
            {view.label}
          </button>
        ))}
      </div>
    </header>
  );
}
