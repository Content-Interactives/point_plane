# Point on a Plane

React activity for **first-quadrant** coordinate plotting: a fixed grid (default 1–5 on both axes) shows unit intersections; learners click the lattice point that matches the displayed ordered pair. Success triggers `canvas-confetti` and a short mascot translation animation before the next random target.

**Production:** [https://content-interactives.github.io/point_plane/](https://content-interactives.github.io/point_plane/)

---

## Stack

| Layer | Packages / tooling |
|--------|---------------------|
| UI | React 19 (`react`, `react-dom`) |
| Build | Vite 7, `@vitejs/plugin-react` |
| Styling | Tailwind CSS 3, PostCSS, Autoprefixer |
| Feedback | `canvas-confetti` |
| Lint | ESLint 9 (flat config), React Hooks / Refresh plugins |
| Deploy | `gh-pages` → `dist` |

The codebase is **JavaScript** (`.jsx`), not TypeScript. `package.json` sets `"type": "module"`.

---

## Build and base path

`vite.config.js` sets `base: '/point_plane/'` for GitHub Pages.

| Script | Command |
|--------|---------|
| Development | `npm run dev` |
| Production bundle | `npm run build` → `dist/` |
| Preview `dist` | `npm run preview` |
| Deploy | `npm run deploy` (`predeploy` → `vite build`, then `gh-pages -d dist`) |

---

## Repository layout

| Path | Role |
|------|------|
| `index.html` | Shell; `#root` |
| `src/main.jsx` | `createRoot`, `StrictMode`, `index.css` |
| `src/App.jsx` | Renders `PointPlane` |
| `src/components/PointPlane.jsx` | Mascot overlay, answer display, click outcome, timeouts, `xToSvg` / `yToSvg` aligned with plane (must match `CoordinatePlane` defaults) |
| `src/components/CoordinatePlane.jsx` | SVG grid, axes, hit targets, hover arrow, `forwardRef` + `useImperativeHandle` for answer lifecycle |
| `src/components/ui/reused-ui/Container.jsx` | Chrome (`PointPlane` sets `showSoundButton` without `onSound`; wire `onSound` if you add audio) |

---

## Application logic (summary)

- **Grid model:** `CoordinatePlane` uses `size`, `margin`, and `max` (default 260 px, 32 px, 5). Inner drawable span is `size - 2 * margin`; `step = innerSize / max`. SVG origin-style math: x increases right (`originX + x * step`), y increases up (`originY - y * step`) for integer coordinates `x, y ∈ {1, …, max}`.
- **Target:** `makeRandomPoint()` picks independent uniform integers in `[1, max]` for each axis. `answer` is pushed to parent via `onAnswerChange`; `useImperativeHandle` exposes `{ answer, randomizeAnswer }` for external control.
- **Interaction:** Invisible circles (`r={8}`) on each lattice point handle hover (red arrow preview) and click → `onPointClick({ x, y })`. `disabled` clears hover and sets `pointer-events: none`.
- **Parent flow:** `PointPlane` compares clicked pair to `answer`. Correct: multi-burst confetti, mascot image swap, `startFlyAnimationTo` uses the same mapping as the plane plus small offsets (`vx + 1.5`, `vy + 0.3` in grid units before `xToSvg`/`yToSvg`). After 3 s, transform resets without transition, `planeRef.current.randomizeAnswer()` loads the next point. Wrong: confused mascot ~2 s, pulse on the coordinate readout ~0.5 s.
- **Responsive:** `window.innerWidth < 407` adjusts mascot `bottom` percentage.

Duplicate geometry constants in `PointPlane.jsx` are annotated to stay in sync with `CoordinatePlane` props defaults.

---

## Product integration

- **CK-12 Intent Response** — production / master: pending  
- **CK-12 Flexbooks** — book/lesson link: pending  

Upstream: [github.com/Content-Interactives/point_plane](https://github.com/Content-Interactives/point_plane).

---

## Educational alignment

Subject, topic, and Common Core (5.G.A.1, 5.G.A.2) are summarized in [`Standards.md`](Standards.md).
