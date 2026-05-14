import { LeftLibraryPanel } from "./LeftLibraryPanel";
import { RightPropertiesPanel } from "./RightPropertiesPanel";
import { TopBar } from "./TopBar";
import { BottomStatusBar } from "./BottomStatusBar";
import { TruckViewport3D } from "../viewport/TruckViewport3D";
import { LoadWallsWorkspace } from "../loadwalls/LoadWallsWorkspace";
import { useLoadPlanStore } from "../../store/useLoadPlanStore";

export function AppShell() {
  const workspaceMode = useLoadPlanStore((state) => state.workspaceMode);
  return (
    <div className="grid h-full grid-rows-[44px_1fr_34px] bg-cad-bg text-cad-text">
      <TopBar />
      <main className="grid min-h-0 grid-cols-[300px_1fr_360px] border-y border-cad-border">
        <LeftLibraryPanel />
        {workspaceMode === "viewport" ? <TruckViewport3D /> : <LoadWallsWorkspace />}
        <RightPropertiesPanel />
      </main>
      <BottomStatusBar />
    </div>
  );
}
