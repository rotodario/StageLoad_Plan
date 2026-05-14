# Roadmap

## Phase 1: Visual CAD Base

Status: implemented.

- Professional dark CAD-style layout.
- Transparent truck volume with technical grid.
- Real-dimension item meshes.
- Orbitable 3D camera and preset views.
- Left library, right inspector and bottom status bar.
- Selection, labels and basic object state.

## Phase 2: Manual Placement Tools

Status: partially implemented.

- Move with transform gizmo.
- Move with keyboard nudges.
- Undo/redo for plan edits.
- Free-position placement when adding or duplicating items.
- Multi-selection with group movement and truck-bound clamping.
- Live movement preview and collision-blocked placement.
- Duplicate-above shortcut with ceiling and collision checks.
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
- Basic unload-blocking warning.
- Stackability and max-stack validation.
- Generated load walls by 1200 mm slices.
- Configurable load wall depth.
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
