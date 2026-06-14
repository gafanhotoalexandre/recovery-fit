# RecoveryFit

RecoveryFit is a mobile-first local training diary for conservative strength progression around shoulder and hallux sensitivity. It helps record sets, pain, recovery signals, and a Markdown report without a backend.

Current version: `v0.3.2` documentation, security, and release readiness polish.

Interface language: Portuguese (Brazil). README written in English for portfolio visibility.

## What It Does

- Local flow: `Hoje → Treino → Recuperação`.
- Weekly local schedule with `Upper A`, `Lower A`, `Upper B`, and `Lower B`.
- Per-set logging with load, reps or seconds, RIR, pain, and pain region.
- Warmup checklist for shoulders, scapulae, and hallux.
- Daily check-in and post-workout recovery notes.
- Markdown export from the current local session.
- Clear empty/export states when no workout session exists.

## Screenshots

No screenshots are committed yet. Recommended captures for portfolio use:

- Mobile `360px`: Today screen with weekly selector.
- Mobile `360px`: active workout with per-set mini-cards.
- Mobile `450px`: recovery screen.
- Desktop or tablet: centered app shell.

Use screenshots only after visually reviewing them. Avoid committing quick temporary captures.

## Privacy

RecoveryFit v0.3.2 is local-only:

- Session, check-in, and recovery data stay in browser `localStorage`.
- There is no backend, Auth, Supabase, sync, analytics, or external submission.
- Markdown export is generated in the browser from current local state.
- No `.env` values are required for this version.

## Stack

- React 19
- Vite 8
- TypeScript strict
- Tailwind CSS 4
- shadcn/ui
- Zustand
- Zod
- lucide-react
- sonner
- vaul

## Scripts

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
npm run preview
```

Required checks before release:

```bash
npm run typecheck
npm run lint
npm run build
```

## Deploy

Simple Vercel deploy settings:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: none for v0.3.2

Vercel's Vite documentation confirms that Vite builds optimized static assets for production and can be deployed from a Vite project root. Environment variables are optional; Vercel system variables are available automatically, and Vite-exposed variables use the `VITE_` prefix.

## Dependency Notes

Directly used by the app:

- `react`, `react-dom`
- `@vitejs/plugin-react`, `vite`, `typescript`
- `tailwindcss`, `@tailwindcss/vite`, `tw-animate-css`
- `@fontsource-variable/inter`
- `lucide-react`
- `sonner`
- `zustand`
- `zod`
- `clsx`, `tailwind-merge`
- `radix-ui`, `class-variance-authority`, `vaul`

Kept because versioned shadcn/ui components import them:

- `recharts` via `src/components/ui/chart.tsx`
- `react-day-picker` via `src/components/ui/calendar.tsx`
- `input-otp` via `src/components/ui/input-otp.tsx`

Do not remove dependencies aggressively in v0.3.2. If cleanup is needed later, remove unused shadcn components and dependencies together, then run all required checks.

## Bundle Note

The production build currently emits Vite's chunk warning for a JavaScript asset above 500 kB minified. This is accepted for the current portfolio/local-first phase because the gzipped bundle is much smaller and the app has no route boundaries yet.

Revisit bundle reduction when the project adds real routing, removes unused shadcn components, or needs stricter performance budgets.

## Architecture

The app shell in `src/App.tsx` delegates the RecoveryFit experience to `src/features/recovery-fit`.

Key areas:

- `store.ts`: local session state with Zustand `persist`.
- `schemas.ts`: Zod validation for drafts and normalized data.
- `mock-data.ts`: local schedule, workouts, warmup, labels, and help content.
- `lib/recovery-rules.ts`: pure pain/recovery recommendation rules.
- `lib/export-report.ts`: Markdown export from current local state.
- `components/`: feature views, drawers, cards, and focused UI pieces.

## Limits

RecoveryFit is not medical advice and does not replace professional evaluation.

Not included in this phase:

- Supabase, Auth, RLS, migrations, or `.env`.
- React Router.
- Local session history.
- Charts.
- PWA/service worker.
- Backend sync.

## Roadmap

- v0.3: multiple local Upper/Lower workouts in the weekly schedule.
- v0.3.1: mobile session UX, clearer session states, export clarity, light componentization.
- v0.3.2: documentation, privacy, security, release checklist, and deploy readiness.
- v0.4: local session history and, if justified, React Router in Data Mode.
- v0.5+: Supabase/Auth/RLS only after the local model is mature.
- MVP 1.0: reliable authenticated app with persisted sessions, recovery signals, conservative recommendations, and export workflows.
