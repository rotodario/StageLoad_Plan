import { ItemLibrary } from "../library/ItemLibrary";
import { LoadOrderPanel } from "../reports/LoadOrderPanel";

export function LeftLibraryPanel() {
  return (
    <aside className="thin-scrollbar min-h-0 overflow-y-auto border-r border-cad-border bg-cad-panel">
      <ItemLibrary />
      <LoadOrderPanel />
    </aside>
  );
}
