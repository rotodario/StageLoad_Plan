import type { LoadPlan, LoadWall, PlannerReport } from "../types/loadplan";

export interface PdfExportPayload {
  plan: LoadPlan;
  report: PlannerReport;
  walls: LoadWall[];
  generatedAt: string;
}

export function createPdfExportPayload(plan: LoadPlan, report: PlannerReport, walls: LoadWall[]): PdfExportPayload {
  return {
    plan,
    report,
    walls,
    generatedAt: new Date().toISOString(),
  };
}
