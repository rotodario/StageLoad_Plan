import { Html } from "@react-three/drei";
import { useLoadPlanStore } from "../../store/useLoadPlanStore";

export function ViewCube() {
  const setView = useLoadPlanStore((state) => state.setView);
  return (
    <Html fullscreen className="pointer-events-none">
      <div className="pointer-events-auto absolute right-3 top-3 grid grid-cols-2 gap-1 rounded border border-cad-border bg-cad-panel/90 p-1 text-[11px]">
        <button className="view-btn" onClick={() => setView("iso")}>Iso</button>
        <button className="view-btn" onClick={() => setView("top")}>Top</button>
        <button className="view-btn" onClick={() => setView("front")}>Door</button>
        <button className="view-btn" onClick={() => setView("rear")}>Rear</button>
      </div>
    </Html>
  );
}
