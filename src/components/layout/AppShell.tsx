import { LeftLibraryPanel } from "./LeftLibraryPanel";
import { RightPropertiesPanel } from "./RightPropertiesPanel";
import { TopBar } from "./TopBar";
import { BottomStatusBar } from "./BottomStatusBar";
import { TruckViewport3D } from "../viewport/TruckViewport3D";

export function AppShell() {
  return (
    <div className="grid h-full grid-rows-[44px_1fr_34px] bg-cad-bg text-cad-text">
      <TopBar />
      <main className="grid min-h-0 grid-cols-[300px_1fr_360px] border-y border-cad-border">
        <LeftLibraryPanel />
        <TruckViewport3D />
        <RightPropertiesPanel />
      </main>
      <BottomStatusBar />
    </div>
  );
}
