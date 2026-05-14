# Development

## Requirements

- Node.js 22 or compatible current LTS.
- npm.

On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm`.

## Install

```bash
npm.cmd install
```

## Run

```bash
npm.cmd run dev
```

Default local URL:

```text
http://127.0.0.1:5173
```

## Build

```bash
npm.cmd run build
```

The build may warn that the bundle is larger than 500 kB because Three.js and Drei are included. This is acceptable for the current MVP. Later, split the viewport into a lazy-loaded chunk.

## Coding Guidelines

- Keep domain logic in `src/utils` when it can be pure.
- Keep UI state and persistence in `src/store/useLoadPlanStore.ts`.
- Do not place geometry rules directly inside React components unless they are purely visual.
- All dimensions in models and utilities are millimeters.
- Convert to meters only at the 3D rendering boundary.
- Prefer small focused components over large mixed panels.

## Useful Files

- `src/types/loadplan.ts`: core domain model.
- `src/store/useLoadPlanStore.ts`: plan state and mutations.
- `src/utils/geometry.ts`: bounding boxes, snap and volume calculations.
- `src/utils/collisions.ts`: collision and validation checks.
- `src/utils/loadWalls.ts`: wall generation and ordering helpers.
- `src/components/viewport/TruckScene.tsx`: main 3D scene composition.

## Git Workflow

Suggested initial setup:

```bash
git init
git add .
git commit -m "Initial StageLoad Planner 3D MVP"
```

After creating a remote repository:

```bash
git remote add origin <repo-url>
git branch -m main
git push -u origin main
```
