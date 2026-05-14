import type { LoadPlan } from "../types/loadplan";

export function exportPlanJson(plan: LoadPlan): string {
  return JSON.stringify({ ...plan, updatedAt: new Date().toISOString() }, null, 2);
}

export function parsePlanJson(source: string): LoadPlan {
  const parsed = JSON.parse(source) as LoadPlan;
  if (!parsed.id || !parsed.truck || !Array.isArray(parsed.templates) || !Array.isArray(parsed.items)) {
    throw new Error("El archivo no contiene un LoadPlan valido.");
  }
  return parsed;
}
