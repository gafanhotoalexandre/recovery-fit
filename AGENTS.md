# RecoveryFit Agent Guide

## Required Checks

Run these before reporting an implementation as complete:

```bash
npm run typecheck
npm run lint
npm run build
```

If browser validation is relevant, use Playwright only when it is already available in the environment. Do not install it for this project without explicit approval. If Playwright is unavailable, use the best available substitute: local build, Edge/Chrome headless, CDP, screenshots, DOM inspection, and a clear note about the limitation.

## Security Limits

- Do not commit real Supabase URLs, project refs, publishable keys, service role keys, JWT secrets, passwords, tokens, or `.env` values.
- README and docs must use placeholders such as `<SUPABASE_PROJECT_URL>`, `<SUPABASE_PUBLISHABLE_KEY>`, and `<SUPABASE_PROJECT_REF>`.
- Do not rewrite Git history unless the user explicitly asks for that task and approves the destructive operation.
- Report security findings by severity and say whether current files or only historical commits are affected.

## Stack Boundaries

Do not add these without explicit approval:

- Supabase
- Auth
- React Router
- TanStack Query
- Motion/Framer Motion
- PWA/service worker tooling
- Charts/dashboard features
- New dependencies

For v0.2.x, keep the app local and mock-backed. Lower A, Upper B, and Lower B remain planned unless a later task explicitly implements them.

## Engineering Rules

- Keep `src/App.tsx` thin.
- Keep RecoveryFit work inside `src/features/recovery-fit/` unless touching shared shadcn/ui components or app shell is necessary.
- Store state belongs in Zustand only when it is real app/session state. Drawers, toasts, selected transient UI, and warnings should stay in UI state.
- Helpers in `lib/recovery-rules.ts` and `lib/export-report.ts` should remain pure.
- Use strict TypeScript and avoid `any`.
- Prefer small, targeted edits over broad refactors.

## Manual Test Notes

After feature changes, report what the user should manually test, the expected result, and suspicious behavior to watch for. For this app, mobile widths `360px` and `450px` matter.
