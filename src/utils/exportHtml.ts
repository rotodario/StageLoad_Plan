import type { LoadItemInstance, LoadItemTemplate, LoadPlan, LoadWall, PlannerReport } from "../types/loadplan";
import { getLoadOrder, getUnloadOrder } from "./loadWalls";
import { formatMeters } from "./units";

export function createPrintableHtml(plan: LoadPlan, report: PlannerReport, walls: LoadWall[]): string {
  const generatedAt = new Date().toLocaleString();
  const templateById = new Map(plan.templates.map((template) => [template.id, template]));
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(plan.name)} - Load Report</title>
  <style>
    body { font-family: Arial, sans-serif; color: #17202a; margin: 24px; }
    h1, h2, h3 { margin: 0 0 8px; }
    h1 { font-size: 24px; }
    h2 { font-size: 18px; margin-top: 28px; border-bottom: 1px solid #ccd3dc; padding-bottom: 6px; }
    h3 { font-size: 14px; margin-top: 16px; }
    .meta, .muted { color: #5f6b7a; font-size: 12px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 16px 0; }
    .metric { border: 1px solid #ccd3dc; padding: 10px; }
    .metric strong { display: block; font-size: 16px; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
    th, td { border: 1px solid #ccd3dc; padding: 6px; text-align: left; vertical-align: top; }
    th { background: #eef2f6; }
    .wall { page-break-inside: avoid; margin-top: 18px; border: 1px solid #ccd3dc; padding: 10px; }
    .wall-view { position: relative; width: 100%; max-width: 520px; aspect-ratio: 2.45 / 2.7; border: 1px solid #7d8794; background: repeating-linear-gradient(0deg, #fff, #fff 19px, #edf1f5 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #edf1f5 20px); }
    .wall-item { position: absolute; border: 1px solid #17202a; color: #fff; overflow: hidden; font-size: 9px; line-height: 1.1; padding: 2px; text-align: center; box-sizing: border-box; }
    .warning { color: #9a3412; }
    @media print { body { margin: 12mm; } button { display: none; } }
  </style>
</head>
<body>
  <button onclick="window.print()">Print / Save PDF</button>
  <h1>${escapeHtml(plan.name)}</h1>
  <div class="meta">Generated ${escapeHtml(generatedAt)} · ${escapeHtml(plan.truck.name)}</div>
  <div class="grid">
    <div class="metric">Bultos<strong>${report.totalItems}</strong></div>
    <div class="metric">Peso total<strong>${report.totalWeightKg.toFixed(0)} kg</strong></div>
    <div class="metric">Volumen usado<strong>${report.usedVolumeM3.toFixed(2)} m3</strong></div>
    <div class="metric">Ocupacion<strong>${report.loadPercentage.toFixed(1)}%</strong></div>
  </div>
  <h2>Validaciones</h2>
  ${renderWarnings(report)}
  <h2>Orden de carga</h2>
  ${renderItemsTable(getLoadOrder(plan.items), templateById)}
  <h2>Orden de descarga</h2>
  ${renderItemsTable(getUnloadOrder(plan.items), templateById)}
  <h2>Paredes de carga</h2>
  ${walls.map((wall) => renderWall(plan, wall, templateById)).join("")}
</body>
</html>`;
}

export function createPrintableWallHtml(plan: LoadPlan, wall: LoadWall): string {
  const generatedAt = new Date().toLocaleString();
  const templateById = new Map(plan.templates.map((template) => [template.id, template]));
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(plan.name)} - Wall ${wall.wallNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #17202a; margin: 24px; }
    h1, h2, h3 { margin: 0 0 8px; }
    h1 { font-size: 24px; }
    h2 { font-size: 18px; margin-top: 20px; border-bottom: 1px solid #ccd3dc; padding-bottom: 6px; }
    .meta, .muted { color: #5f6b7a; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
    th, td { border: 1px solid #ccd3dc; padding: 6px; text-align: left; vertical-align: top; }
    th { background: #eef2f6; }
    .wall-view { position: relative; width: 100%; max-width: 720px; aspect-ratio: 2.45 / 2.7; border: 1px solid #7d8794; background: repeating-linear-gradient(0deg, #fff, #fff 19px, #edf1f5 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #edf1f5 20px); }
    .wall-item { position: absolute; border: 1px solid #17202a; color: #fff; overflow: hidden; font-size: 10px; line-height: 1.1; padding: 2px; text-align: center; box-sizing: border-box; }
    @media print { body { margin: 12mm; } button { display: none; } }
  </style>
</head>
<body>
  <button onclick="window.print()">Print / Save PDF</button>
  <h1>${escapeHtml(plan.name)} - Pared ${String(wall.wallNumber).padStart(2, "0")}</h1>
  <div class="meta">Generated ${escapeHtml(generatedAt)} · ${escapeHtml(plan.truck.name)}</div>
  <h2>${escapeHtml(formatMeters(wall.startMm))} a ${escapeHtml(formatMeters(wall.endMm))} desde puerta</h2>
  <div class="meta">${wall.items.length} bultos · ${wall.totalWeightKg.toFixed(0)} kg</div>
  ${plan.wallNotes[wall.wallNumber] ? `<p><strong>Notas:</strong> ${escapeHtml(plan.wallNotes[wall.wallNumber])}</p>` : ""}
  <div class="wall-view">
    ${renderWallItems(plan, wall, templateById)}
  </div>
  <h2>Bultos de la pared</h2>
  ${renderItemsTable(wall.items, templateById)}
</body>
</html>`;
}

function renderWarnings(report: PlannerReport): string {
  const warnings = [...report.collisions, ...report.warnings];
  if (warnings.length === 0) return `<p class="muted">Sin alertas.</p>`;
  return `<ul>${warnings.map((warning) => `<li class="warning">${escapeHtml(warning.message)}</li>`).join("")}</ul>`;
}

function renderItemsTable(items: LoadItemInstance[], templateById: Map<string, LoadItemTemplate>): string {
  if (items.length === 0) return `<p class="muted">Sin bultos.</p>`;
  return `<table>
    <thead><tr><th>Bulto</th><th>Departamento</th><th>Dimensiones</th><th>Peso</th><th>Carga</th><th>Descarga</th><th>Pared</th></tr></thead>
    <tbody>
      ${items.map((item) => {
        const template = templateById.get(item.templateId);
        return `<tr>
          <td>${escapeHtml(item.label)}</td>
          <td>${escapeHtml(item.department ?? template?.department ?? "")}</td>
          <td>${template ? `${template.lengthMm} x ${template.widthMm} x ${template.heightMm} mm` : ""}</td>
          <td>${template?.weightKg ?? 0} kg</td>
          <td>${item.loadOrder}</td>
          <td>${item.unloadPriority}</td>
          <td>${item.wallNumber ?? ""}</td>
        </tr>`;
      }).join("")}
    </tbody>
  </table>`;
}

function renderWall(plan: LoadPlan, wall: LoadWall, templateById: Map<string, LoadItemTemplate>): string {
  const note = plan.wallNotes[wall.wallNumber];
  return `<section class="wall">
    <h3>Pared ${String(wall.wallNumber).padStart(2, "0")} · ${escapeHtml(formatMeters(wall.startMm))} a ${escapeHtml(formatMeters(wall.endMm))}</h3>
    <div class="meta">${wall.items.length} bultos · ${wall.totalWeightKg.toFixed(0)} kg</div>
    ${note ? `<p><strong>Notas:</strong> ${escapeHtml(note)}</p>` : ""}
    <div class="wall-view">
      ${renderWallItems(plan, wall, templateById)}
    </div>
    ${renderItemsTable(wall.items, templateById)}
  </section>`;
}

function renderWallItems(plan: LoadPlan, wall: LoadWall, templateById: Map<string, LoadItemTemplate>): string {
  return wall.items.map((item) => {
    const template = templateById.get(item.templateId);
    if (!template) return "";
    const width = (template.widthMm / plan.truck.widthMm) * 100;
    const height = (template.heightMm / plan.truck.heightMm) * 100;
    const left = (item.position.z / plan.truck.widthMm) * 100;
    const bottom = (item.position.y / plan.truck.heightMm) * 100;
    return `<div class="wall-item" style="left:${left}%;bottom:${bottom}%;width:${width}%;height:${height}%;background:${escapeHtml(item.color ?? template.color)}">${escapeHtml(item.label)}</div>`;
  }).join("");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
