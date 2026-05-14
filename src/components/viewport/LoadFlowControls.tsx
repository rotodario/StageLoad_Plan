import { Pause, Play, RotateCcw, StepBack, StepForward, Truck } from "lucide-react";
import type { LoadFlowMode } from "../../types/loadplan";

interface Props {
  mode?: LoadFlowMode;
  step: number;
  total: number;
  playing: boolean;
  onModeChange: (mode?: LoadFlowMode) => void;
  onStepChange: (step: number) => void;
  onPlayingChange: (playing: boolean) => void;
}

export function LoadFlowControls({ mode, step, total, playing, onModeChange, onStepChange, onPlayingChange }: Props) {
  const enabled = Boolean(mode);
  const label = mode === "load" ? "Carga" : mode === "unload" ? "Descarga" : "Flujo";
  return (
    <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded border border-cad-border bg-cad-panel/95 p-1 shadow-2xl">
      <button className={mode === "load" ? "view-btn-active" : "view-btn"} onClick={() => onModeChange(mode === "load" ? undefined : "load")} title="Animar orden de carga">
        <Truck size={13} />Carga
      </button>
      <button className={mode === "unload" ? "view-btn-active" : "view-btn"} onClick={() => onModeChange(mode === "unload" ? undefined : "unload")} title="Animar orden de descarga">
        <Truck size={13} />Descarga
      </button>
      <div className="mx-1 h-5 w-px bg-cad-border" />
      <button className="icon-btn" disabled={!enabled || step <= 0} onClick={() => onStepChange(Math.max(0, step - 1))} title="Paso anterior">
        <StepBack size={14} />
      </button>
      <button className="icon-btn" disabled={!enabled || total === 0} onClick={() => onPlayingChange(!playing)} title={playing ? "Pausar" : "Reproducir"}>
        {playing ? <Pause size={14} /> : <Play size={14} />}
      </button>
      <button className="icon-btn" disabled={!enabled || step >= total} onClick={() => onStepChange(Math.min(total, step + 1))} title="Paso siguiente">
        <StepForward size={14} />
      </button>
      <button className="icon-btn" disabled={!enabled} onClick={() => onStepChange(0)} title="Reiniciar animacion">
        <RotateCcw size={14} />
      </button>
      <div className="min-w-[96px] px-2 text-xs text-cad-muted">
        <span className="text-cad-text">{label}</span> {step}/{total}
      </div>
    </div>
  );
}
