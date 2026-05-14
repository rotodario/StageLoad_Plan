import { Columns3, Printer, Ruler, Weight } from "lucide-react";
import { useMemo, useState } from "react";
import { useLoadPlanStore } from "../../store/useLoadPlanStore";
import type { LoadWall } from "../../types/loadplan";
import { getItemBoundingBox } from "../../utils/geometry";
import { generateLoadWalls } from "../../utils/loadWalls";
import { formatMeters } from "../../utils/units";
import { createPrintableWallHtml } from "../../utils/exportHtml";

export function LoadWallsWorkspace() {
  const plan = useLoadPlanStore((state) => state.plan);
  const selectedItemId = useLoadPlanStore((state) => state.selectedItemId);
  const selectItem = useLoadPlanStore((state) => state.selectItem);
  const setWallNote = useLoadPlanStore((state) => state.setWallNote);
  const walls = useMemo(() => generateLoadWalls(plan.items, plan.templates, plan.truck.lengthMm, plan.wallDepthMm), [plan]);
  const [activeWallNumber, setActiveWallNumber] = useState(1);
  const activeWall = walls.find((wall) => wall.wallNumber === activeWallNumber) ?? walls[0];

  function printActiveWall() {
    if (!activeWall) return;
    const html = createPrintableWallHtml(plan, activeWall);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }

  return (
    <section className="grid min-h-0 grid-rows-[42px_1fr] bg-[#101216]">
      <header className="flex items-center gap-3 border-b border-cad-border bg-cad-panel px-3">
        <h1 className="flex items-center gap-2 text-sm font-semibold text-cad-text">
          <Columns3 size={16} className="text-cad-accent" />
          Paredes de carga
        </h1>
        <div className="text-xs text-cad-muted">
          Filas reales detectadas desde puerta hacia fondo
        </div>
        <button className="toolbar-btn ml-auto" title="Imprimir pared activa" onClick={printActiveWall}>
          <Printer size={15} />PDF
        </button>
      </header>
      <div className="grid min-h-0 grid-cols-[220px_1fr]">
        <nav className="thin-scrollbar min-h-0 overflow-y-auto border-r border-cad-border bg-cad-panel p-2">
          {walls.length === 0 && <p className="p-2 text-sm text-cad-muted">No hay paredes generadas.</p>}
          {walls.map((wall) => (
            <button
              key={wall.wallNumber}
              className={wall.wallNumber === activeWall.wallNumber ? "wall-nav-active" : "wall-nav"}
              onClick={() => setActiveWallNumber(wall.wallNumber)}
            >
              <span>Pared {wall.wallNumber.toString().padStart(2, "0")}</span>
              <span className="text-cad-muted">{wall.items.length} bultos</span>
            </button>
          ))}
        </nav>
        <main className="thin-scrollbar min-h-0 overflow-y-auto p-4">
          {activeWall ? (
            <LoadWallDetail
              wall={activeWall}
              truckWidthMm={plan.truck.widthMm}
              truckHeightMm={plan.truck.heightMm}
              selectedItemId={selectedItemId}
              onSelectItem={selectItem}
              note={plan.wallNotes[activeWall.wallNumber] ?? ""}
              onNoteChange={(note) => setWallNote(activeWall.wallNumber, note)}
            />
          ) : (
            <div className="rounded border border-cad-border bg-cad-panel p-4 text-sm text-cad-muted">Coloca bultos en el camion para generar paredes por filas.</div>
          )}
          {activeWall && (
            <div className="mt-4 rounded border border-cad-border bg-cad-panel">
              <div className="grid grid-cols-[48px_1fr_90px_90px_90px_90px] border-b border-cad-border px-3 py-2 text-[11px] uppercase tracking-wide text-cad-muted">
                <span>#</span>
                <span>Bulto</span>
                <span>Depto</span>
                <span>Peso</span>
                <span>Carga</span>
                <span>Descarga</span>
              </div>
              {activeWall.items.length === 0 ? (
                <div className="px-3 py-4 text-sm text-cad-muted">No hay bultos en esta pared.</div>
              ) : (
                activeWall.items
                  .slice()
                  .sort((a, b) => a.position.z - b.position.z || a.position.y - b.position.y)
                  .map((item, index) => {
                    const template = plan.templates.find((entry) => entry.id === item.templateId);
                    return (
                      <button
                        key={item.id}
                        className={selectedItemId === item.id ? "wall-table-row-active" : "wall-table-row"}
                        onClick={() => selectItem(item.id)}
                      >
                        <span>{index + 1}</span>
                        <span className="truncate">{item.label}</span>
                        <span>{item.department ?? template?.department}</span>
                        <span>{template?.weightKg ?? 0} kg</span>
                        <span>{item.loadOrder}</span>
                        <span>{item.unloadPriority}</span>
                      </button>
                    );
                  })
              )}
            </div>
          )}
        </main>
      </div>
    </section>
  );
}

interface DetailProps {
  wall: LoadWall;
  truckWidthMm: number;
  truckHeightMm: number;
  selectedItemId?: string;
  onSelectItem: (itemId?: string) => void;
  note: string;
  onNoteChange: (note: string) => void;
}

function LoadWallDetail({ wall, truckWidthMm, truckHeightMm, selectedItemId, onSelectItem, note, onNoteChange }: DetailProps) {
  const templates = useLoadPlanStore((state) => state.plan.templates);
  return (
    <article className="rounded border border-cad-border bg-cad-panel p-3">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-cad-text">Pared {wall.wallNumber.toString().padStart(2, "0")}</h2>
          <p className="mt-1 text-xs text-cad-muted">{formatMeters(wall.startMm)} a {formatMeters(wall.endMm)} desde puerta</p>
        </div>
        <div className="flex gap-2 text-xs text-cad-muted">
          <span className="metric-pill"><Ruler size={13} />{wall.items.length} bultos</span>
          <span className="metric-pill"><Weight size={13} />{wall.totalWeightKg.toFixed(0)} kg</span>
        </div>
      </div>
      <div className="relative aspect-[2.45/2.7] max-h-[58vh] min-h-[420px] overflow-hidden rounded border border-cad-border bg-[#15181d]">
        <div className="absolute inset-0 wall-grid" />
        {wall.items.map((item) => {
          const template = templates.find((entry) => entry.id === item.templateId);
          if (!template) return null;
          const box = getItemBoundingBox(item, template);
          const left = (box.min.z / truckWidthMm) * 100;
          const width = (box.size.z / truckWidthMm) * 100;
          const height = (box.size.y / truckHeightMm) * 100;
          const bottom = (box.min.y / truckHeightMm) * 100;
          return (
            <button
              key={item.id}
              className={selectedItemId === item.id ? "wall-object selected" : "wall-object"}
              style={{ left: `${left}%`, width: `${width}%`, height: `${height}%`, bottom: `${bottom}%`, background: item.color ?? template.color }}
              onClick={() => onSelectItem(item.id)}
              title={`${item.label} · ${template.lengthMm} x ${template.widthMm} x ${template.heightMm} mm`}
            >
              <span className="truncate">{item.label}</span>
              <small>{template.weightKg} kg · D{item.unloadPriority}</small>
            </button>
          );
        })}
      </div>
      <label className="field-label mt-3">Notas de pared</label>
      <textarea
        className="min-h-20 w-full rounded border border-cad-border bg-[#15181d] p-2 text-sm text-cad-text outline-none focus:border-cad-accent"
        value={note}
        onChange={(event) => onNoteChange(event.target.value)}
        placeholder="Notas de carga, protecciones, orden, material delicado..."
      />
    </article>
  );
}
