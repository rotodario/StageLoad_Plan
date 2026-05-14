import type { LoadWall } from "../../types/loadplan";
import { formatMeters } from "../../utils/units";
import { LoadWallView } from "./LoadWallView";

interface Props {
  wall: LoadWall;
  truckWidthMm: number;
  truckHeightMm: number;
}

export function LoadWallMiniature({ wall, truckWidthMm, truckHeightMm }: Props) {
  return (
    <article className="rounded border border-cad-border bg-cad-panel2 p-2">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-cad-text">Pared {wall.wallNumber.toString().padStart(2, "0")}</span>
        <span className="text-cad-muted">{formatMeters(wall.startMm)} - {formatMeters(wall.endMm)}</span>
      </div>
      <LoadWallView wall={wall} truckWidthMm={truckWidthMm} truckHeightMm={truckHeightMm} />
      <div className="mt-2 flex justify-between text-[11px] text-cad-muted">
        <span>{wall.items.length} bultos</span>
        <span>{wall.totalWeightKg.toFixed(0)} kg</span>
      </div>
    </article>
  );
}
