import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { TruckScene } from "./TruckScene";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { VehicleDisplayToolbar } from "./VehicleDisplayToolbar";

export function TruckViewport3D() {
  return (
    <section className="relative min-h-0 bg-[#101216]">
      <Canvas shadows camera={{ position: [10, 6, 6], fov: 45, near: 0.05, far: 200 }}>
        <Suspense fallback={null}>
          <TruckScene />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute left-3 top-3 rounded border border-cad-border bg-cad-panel/85 px-2 py-1 text-xs text-cad-muted">
        1 unidad Three.js = 1 metro · coordenadas internas en mm
      </div>
      <VehicleDisplayToolbar />
      <KeyboardShortcuts />
    </section>
  );
}
