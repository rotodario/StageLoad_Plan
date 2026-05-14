import type { LoadWall } from "../../types/loadplan";
import { useLoadPlanStore } from "../../store/useLoadPlanStore";
import { getItemBoundingBox } from "../../utils/geometry";

interface Props {
  wall: LoadWall;
  truckWidthMm: number;
  truckHeightMm: number;
}

export function LoadWallView({ wall, truckWidthMm, truckHeightMm }: Props) {
  const templates = useLoadPlanStore((state) => state.plan.templates);
  const selectItem = useLoadPlanStore((state) => state.selectItem);
  return (
    <div className="relative h-28 overflow-hidden rounded-sm border border-cad-border bg-[#15181d]">
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
            className="absolute overflow-hidden border border-white/50 px-1 text-[9px] leading-tight text-white"
            style={{ left: `${left}%`, width: `${width}%`, height: `${height}%`, bottom: `${bottom}%`, background: item.color ?? template.color }}
            onClick={() => selectItem(item.id)}
            title={`${item.label} · carga ${item.loadOrder} · descarga ${item.unloadPriority}`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
