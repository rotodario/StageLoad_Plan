import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useState } from "react";
import { TruckScene } from "./TruckScene";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { VehicleDisplayToolbar } from "./VehicleDisplayToolbar";
import { LoadFlowControls } from "./LoadFlowControls";
import { useLoadPlanStore } from "../../store/useLoadPlanStore";
import type { LoadFlowMode } from "../../types/loadplan";
import { getLoadOrder, getUnloadOrder } from "../../utils/loadWalls";

export function TruckViewport3D() {
  const plan = useLoadPlanStore((state) => state.plan);
  const [flowMode, setFlowMode] = useState<LoadFlowMode | undefined>();
  const [flowStep, setFlowStep] = useState(0);
  const [flowPlaying, setFlowPlaying] = useState(false);
  const flowTotal = useMemo(() => {
    if (!flowMode) return 0;
    return (flowMode === "load" ? getLoadOrder(plan.items) : getUnloadOrder(plan.items)).filter((item) => !item.hidden).length;
  }, [flowMode, plan.items]);

  useEffect(() => {
    setFlowStep((step) => Math.min(step, flowTotal));
  }, [flowTotal]);

  useEffect(() => {
    if (!flowPlaying || !flowMode || flowTotal === 0) return undefined;
    const timer = window.setInterval(() => {
      setFlowStep((step) => {
        if (step >= flowTotal) {
          setFlowPlaying(false);
          return step;
        }
        return step + 1;
      });
    }, 850);
    return () => window.clearInterval(timer);
  }, [flowMode, flowPlaying, flowTotal]);

  function setMode(mode?: LoadFlowMode) {
    setFlowMode(mode);
    setFlowStep(0);
    setFlowPlaying(false);
  }

  return (
    <section className="relative min-h-0 bg-[#101216]">
      <Canvas shadows camera={{ position: [10, 6, 6], fov: 45, near: 0.05, far: 200 }}>
        <Suspense fallback={null}>
          <TruckScene flowMode={flowMode} flowStep={flowStep} />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute left-3 top-3 rounded border border-cad-border bg-cad-panel/85 px-2 py-1 text-xs text-cad-muted">
        1 unidad Three.js = 1 metro · coordenadas internas en mm
      </div>
      <VehicleDisplayToolbar />
      <LoadFlowControls
        mode={flowMode}
        step={flowStep}
        total={flowTotal}
        playing={flowPlaying}
        onModeChange={setMode}
        onStepChange={(step) => {
          setFlowStep(step);
          setFlowPlaying(false);
        }}
        onPlayingChange={setFlowPlaying}
      />
      <KeyboardShortcuts />
    </section>
  );
}
