import { Columns3 } from "lucide-react";
import { useLoadPlanStore } from "../../store/useLoadPlanStore";
import { generateLoadWalls } from "../../utils/loadWalls";
import { LoadWallMiniature } from "./LoadWallMiniature";

export function LoadWallsPanel() {
  const plan = useLoadPlanStore((state) => state.plan);
  const walls = generateLoadWalls(plan.items, plan.templates, plan.truck.lengthMm, plan.wallDepthMm);
  return (
    <section className="border-b border-cad-border p-3">
      <h2 className="panel-title mb-3"><Columns3 size={15} />Paredes de carga</h2>
      <div className="space-y-2">
        {walls.length === 0 && <p className="text-sm text-cad-muted">Las paredes se generaran al colocar bultos.</p>}
        {walls.map((wall) => <LoadWallMiniature key={wall.wallNumber} wall={wall} truckWidthMm={plan.truck.widthMm} truckHeightMm={plan.truck.heightMm} />)}
      </div>
    </section>
  );
}
