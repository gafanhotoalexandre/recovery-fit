# RecoveryFit Release Checklist

Use this checklist before tagging or deploying a RecoveryFit release.

## Required Checks

```bash
npm run typecheck
npm run lint
npm run build
```

Expected v0.3.2 result:

- TypeScript passes.
- ESLint passes.
- Vite build passes.
- Vite may warn about a chunk above 500 kB minified; this warning is accepted for v0.3.2.

## Security And Privacy

- Confirm `git status --short` has no unexpected files.
- Confirm no `.env`, `.env.*`, `.pem`, `.key`, token, password, or secret files are tracked.
- Search tracked docs/code for real secrets or backend identifiers.
- Confirm Supabase values, if mentioned in docs, use placeholders only:
  - `<SUPABASE_PROJECT_URL>`
  - `<SUPABASE_PUBLISHABLE_KEY>`
  - `<SUPABASE_PROJECT_REF>`
- Confirm `.tmp`, `dist`, `.vite`, logs, `node_modules`, and local env files are ignored.
- Confirm the README states that v0.3.2 stores data in browser `localStorage` only.

Suggested local scan:

```bash
git ls-files | rg "(^|/)\\.env|\\.env\\.|\\.pem$|\\.key$|secret|token"
rg -n --hidden --glob '!node_modules/**' --glob '!dist/**' --glob '!package-lock.json' "(SUPABASE|supabase\\.co|VITE_SUPABASE|service_role|anon[_-]?key|publishable|sk-[A-Za-z0-9]|ghp_|github_pat_|password|secret|token|api[_-]?key)" .
```

## Manual QA

- Mobile `360px`: Today screen has no horizontal scroll.
- Mobile `360px`: active workout mini-cards are usable.
- Mobile `450px`: recovery screen is comfortable.
- Tablet/desktop: app remains centered and presentable.
- Export with a workout session includes the registered workout.
- Export without a workout session clearly says no workout was registered.
- Saving recovery without an active session does not complete a workout.
- Swimming/rest days do not start a technical workout session.

## Screenshots

Do not commit quick temporary screenshots. Recommended portfolio captures:

- `360px` Today screen.
- `360px` active workout with set mini-cards.
- `450px` recovery screen.
- Tablet or desktop app shell.

Commit screenshots only after visual review.

## Vercel Deploy

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: none for v0.3.2

## Dependency Review

- Do not remove dependencies during v0.3.2 release unless there is clear evidence they are unused and all required checks pass.
- `recharts`, `react-day-picker`, and `input-otp` are retained because versioned shadcn/ui components import them.
- Future cleanup should remove unused shadcn components and matching dependencies together.
