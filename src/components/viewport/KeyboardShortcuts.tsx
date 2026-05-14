import { useEffect } from "react";
import { useLoadPlanStore } from "../../store/useLoadPlanStore";

export function KeyboardShortcuts() {
  const nudgeSelected = useLoadPlanStore((state) => state.nudgeSelected);
  const rotateSelected90 = useLoadPlanStore((state) => state.rotateSelected90);
  const duplicateSelected = useLoadPlanStore((state) => state.duplicateSelected);
  const deleteSelected = useLoadPlanStore((state) => state.deleteSelected);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select")) return;
      if (event.key === "ArrowUp") {
        event.preventDefault();
        nudgeSelected("x", 1);
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        nudgeSelected("x", -1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        nudgeSelected("z", -1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        nudgeSelected("z", 1);
      }
      if (event.key.toLowerCase() === "u") {
        event.preventDefault();
        nudgeSelected("y", 1);
      }
      if (event.key.toLowerCase() === "j") {
        event.preventDefault();
        nudgeSelected("y", -1);
      }
      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        rotateSelected90();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateSelected();
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelected();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteSelected, duplicateSelected, nudgeSelected, rotateSelected90]);

  return (
    <div className="pointer-events-none absolute bottom-3 left-3 rounded border border-cad-border bg-cad-panel/85 px-2 py-1 text-[11px] text-cad-muted">
      Flechas: mover · U/J: subir/bajar · R: rotar · Ctrl+D: duplicar · Del: borrar
    </div>
  );
}
