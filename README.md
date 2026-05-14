# StageLoad Planner 3D

Aplicacion web local para planificar carga de camiones de espectaculos en directo con precision dimensional en milimetros y visualizacion 3D.

## Stack

- React
- TypeScript
- Vite
- Three.js
- React Three Fiber
- Drei
- Zustand
- Tailwind CSS

## Ejecutar

```bash
npm.cmd install
npm.cmd run dev
```

La app queda disponible normalmente en:

```text
http://127.0.0.1:5173
```

## Build

```bash
npm.cmd run build
```

## Modelo dimensional

La aplicacion trabaja internamente en milimetros. En la escena 3D:

```text
1000 mm = 1 unidad Three.js = 1 metro
```

Las conversiones estan centralizadas en `src/utils/units.ts`.

## Estado del MVP

- Layout profesional oscuro tipo CAD.
- Camion 3D transparente con dimensiones reales.
- Grid tecnico y camara orbitable.
- Biblioteca de elementos y creacion de plantillas.
- Colocacion manual de bultos con busqueda de hueco libre al añadir o duplicar.
- Snap a grid, paredes y caras cercanas de otros bultos.
- Seleccion, movimiento, rotacion 90 grados, duplicado, borrado, bloqueo y ocultacion.
- Undo/redo para cambios de plan, con botones y atajos `Ctrl+Z` / `Ctrl+Y`.
- Colisiones por bounding boxes.
- Validaciones de volumen, peso, fuera de camion, flotacion y bloqueo basico de descarga.
- Paredes de carga generadas por tramos de 1.20 m.
- Workspace dedicado para revisar paredes de carga en vista frontal.
- Reportes por carga, descarga, departamento y pared.
- Guardado local, carga JSON y exportacion JSON.
- Preparacion de payload para futura exportacion PDF.

## Siguientes pasos tecnicos

1. Mejorar gizmos CAD: constraints por eje, plano activo, multi-seleccion y mediciones.
2. Persistir biblioteca de plantillas independiente del plan.
3. Anadir una pantalla completa de Load Walls con impresion.
4. Implementar exportacion PDF real desde `PdfExportPayload`.
5. Incorporar pruebas unitarias para geometria, colisiones y validacion.

## Documentacion

- `docs/ARCHITECTURE.md`: arquitectura, capas y decisiones tecnicas.
- `docs/ROADMAP.md`: fases de producto y proximos hitos.
- `docs/DEVELOPMENT.md`: instalacion, ejecucion, build y workflow Git.
