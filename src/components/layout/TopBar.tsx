import { Boxes, Columns3, Download, FileJson, FolderOpen, Library, Printer, Redo2, RotateCcw, Save, Tags, Trash2, Undo2, View } from "lucide-react";
import { useRef, useState } from "react";
import { useLoadPlanStore } from "../../store/useLoadPlanStore";
import { exportPlanJson, parsePlanJson } from "../../utils/exportJson";
import type { ViewPreset } from "../../types/loadplan";
import { generateLoadWalls } from "../../utils/loadWalls";
import { createPrintableHtml } from "../../utils/exportHtml";

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
  const [projectsOpen, setProjectsOpen] = useState(false);
  const plan = useLoadPlanStore((state) => state.plan);
  const projectLibrary = useLoadPlanStore((state) => state.projectLibrary);
  const report = useLoadPlanStore((state) => state.report);
  const activeView = useLoadPlanStore((state) => state.activeView);
  const workspaceMode = useLoadPlanStore((state) => state.workspaceMode);
  const showLabels = useLoadPlanStore((state) => state.showLabels);
  const setView = useLoadPlanStore((state) => state.setView);
  const setWorkspaceMode = useLoadPlanStore((state) => state.setWorkspaceMode);
  const toggleLabels = useLoadPlanStore((state) => state.toggleLabels);
  const saveLocal = useLoadPlanStore((state) => state.saveLocal);
  const loadPlan = useLoadPlanStore((state) => state.loadPlan);
  const resetPlan = useLoadPlanStore((state) => state.resetPlan);
  const saveProjectSnapshot = useLoadPlanStore((state) => state.saveProjectSnapshot);
  const loadProjectSnapshot = useLoadPlanStore((state) => state.loadProjectSnapshot);
  const deleteProjectSnapshot = useLoadPlanStore((state) => state.deleteProjectSnapshot);
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

  function exportPrintableHtml() {
    const walls = generateLoadWalls(plan.items, plan.templates, plan.truck.lengthMm, plan.wallDepthMm);
    const html = createPrintableHtml(plan, report, walls);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
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
      <button className="toolbar-btn" onClick={() => setProjectsOpen((open) => !open)} title="Biblioteca local de proyectos"><Library size={16} />Proyectos</button>
      <button className="toolbar-btn" onClick={() => inputRef.current?.click()} title="Cargar JSON"><FolderOpen size={16} />Cargar</button>
      <button className="toolbar-btn" onClick={exportJson} title="Exportar JSON"><Download size={16} />Exportar</button>
      <button className="toolbar-btn" onClick={exportPrintableHtml} title="Informe imprimible"><Printer size={16} />Imprimir</button>
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
        <button className={showLabels ? "view-btn-active" : "view-btn"} onClick={toggleLabels} title="Mostrar u ocultar etiquetas">
          <Tags size={14} />Etiquetas
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
      {projectsOpen && (
        <div className="absolute left-28 top-11 z-50 w-[360px] rounded border border-cad-border bg-cad-panel p-3 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="panel-title"><Library size={15} />Proyectos locales</h2>
            <button className="toolbar-btn" onClick={saveProjectSnapshot}><Save size={14} />Guardar snapshot</button>
          </div>
          {projectLibrary.length === 0 ? (
            <p className="text-sm text-cad-muted">No hay proyectos guardados en esta instalacion local.</p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto thin-scrollbar">
              {projectLibrary.map((project) => (
                <div key={project.id} className="rounded border border-cad-border bg-cad-panel2 p-2">
                  <div className="flex items-start gap-2">
                    <button
                      className="min-w-0 flex-1 text-left"
                      onClick={() => {
                        loadProjectSnapshot(project.id);
                        setProjectsOpen(false);
                      }}
                    >
                      <div className="truncate text-sm font-medium text-cad-text">{project.name}</div>
                      <div className="mt-1 text-xs text-cad-muted">{project.truckName} · {project.itemCount} bultos</div>
                      <div className="mt-1 text-[11px] text-cad-muted">{new Date(project.updatedAt).toLocaleString()}</div>
                    </button>
                    <button className="icon-btn danger" title="Borrar snapshot" onClick={() => deleteProjectSnapshot(project.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
