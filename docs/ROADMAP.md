# Roadmap

## Phase 1: Visual CAD Base

Status: implemented.

- Professional dark CAD-style layout.
- Transparent truck volume with technical grid.
- Real-dimension item meshes.
- Orbitable 3D camera and preset views.
- Left library, right inspector and bottom status bar.
- Selection, labels and basic object state.
- Modular vehicle model with cab, shell, chassis, axles, wheels and X-Ray/Hybrid display modes.
- Low-poly procedural European cab with shaped shell, integrated glazing, mirrors, grille, bumper, arches, deflector and professional wheels.
- Initial vehicle weight overlays: CG, kingpin, axle group and heatmap.
- Configurable vehicle weight model with presets, axle limits and group warnings.
- Vehicle visual geometry driven by the same preset as axle analysis.
- Axle analysis panel with per-axle usage bars and tare-aware load distribution.

## Phase 2: Manual Placement Tools

Status: partially implemented.

- Move with transform gizmo.
- Move with keyboard nudges.
- Undo/redo for plan edits.
- Free-position placement when adding or duplicating items.
- Multi-selection with group movement and truck-bound clamping.
- Live movement preview and collision-blocked placement.
- Duplicate-above shortcut with ceiling and collision checks.
- Spatial load order from Door, bottom-left to top-right, recalculated after edits.
- Load/unload flow animation in the 3D viewport.
- Snap to configurable grid.
- Snap to truck limits.
- Basic snap to nearby item faces.
- Rotate selected item in 90-degree increments.
- Duplicate, delete, lock and hide items.

Next:

- Axis and plane constraints.
- Measurement tool.
- Better selection when objects overlap.
- Undo/redo history.

## Phase 3: Validation and Load Walls

Status: partially implemented.

- Collision detection by bounding boxes.
- Outside-truck warnings.
- Floating-item warnings.
- Weight limit warning.
- Stackability and max-stack validation.
- Generated load walls from real object rows.
- Configurable row grouping tolerance for load walls.
- Load, unload, department and wall lists.
- Dedicated load walls workspace with front-view wall review.
- Manual notes per load wall.

Next:

- Better fragile validation.
- Advanced blocked-by analysis using path to door.

## Phase 4: Persistence and Export

Status: partially implemented.

- Local save in browser storage.
- Local project library in browser storage.
- JSON import/export.
- Printable HTML report for browser print/save-as-PDF workflow.
- Single wall printable report from Load Walls workspace.
- PDF payload interface prepared.

Next:

- IndexedDB project library.
- PDF export with plan summary and wall pages.
- Print stylesheet for technical reports.
- Versioned plan migrations.

## Phase 5: Production Features

Future.

- Auto-pack suggestion engine.
- Optimization by volume, weight, department and unload priority.
- Template library presets.
- Truck presets.
- Project metadata: tour, venue, date, company and crew notes.
- Shared project format.
- Optional backend sync.
