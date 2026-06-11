# RecoveryFit

POC mobile-first para registrar treino, dor e recuperação com progressão conservadora. A v0.2 deixa de ser apenas vitrine e vira uma ferramenta local de sessão de treino, ainda sem backend.

## Estado atual — v0.2

Inclui:

- Fluxo local `Hoje -> Treino -> Recuperação`.
- Store Zustand com persistência seletiva em `localStorage`.
- Validação com Zod para drafts e dados normalizados.
- Treino `Upper A` completo.
- Checklist real de aquecimento para ombros, escápulas e hálux.
- Registro de séries por exercício com carga, reps, RIR, dor e região opcional.
- Navegação entre exercícios, com salvar/avançar/voltar.
- Check-in simples do dia.
- Recuperação pós-treino por ombro/hálux.
- Estado concluído na tela Hoje, com exportação e reset confirmado.
- Exportação Markdown com dados reais da sessão, mesmo incompleta.
- Transições discretas por CSS/Tailwind, respeitando `prefers-reduced-motion`.
- Preparação mobile básica: `theme-color`, safe-area e layout sem scroll horizontal.

Não inclui nesta fase:

- Supabase, Auth, RLS, migrations ou `.env`.
- React Router.
- TanStack Query.
- React Hook Form.
- IA integrada.
- Gráficos.
- Service worker ou PWA completo.

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

## Arquitetura

A aplicação fica fina em `src/App.tsx` e delega a experiência para `src/features/recovery-fit`.

Pontos principais:

- `store.ts`: estado local da sessão com Zustand `persist`, `version`, `migrate` e `partialize`.
- `schemas.ts`: validação Zod para drafts e dados normalizados.
- `mock-data.ts`: treino Upper A, aquecimento, labels e ajuda contextual.
- `lib/recovery-rules.ts`: regras puras de dor/recomendação.
- `lib/export-report.ts`: relatório Markdown baseado no estado local atual.
- `index.tsx`: UI da feature, drawers e fluxo de interação.

A store persiste somente dados de sessão, check-in e recuperação. Drawers, toasts, avisos transitórios e estado visual ficam fora do storage.

## Supabase depois

O projeto Supabase planejado é `sys_recoveryfit` (`rlqnloolkxsnqpggvvfn`). Quando a fase de backend começar, usar:

```bash
npm install @supabase/supabase-js
```

E, se o CLI for necessário sem instalação global:

```bash
npx supabase ...
```

Variáveis previstas:

```env
VITE_SUPABASE_URL=https://rlqnloolkxsnqpggvvfn.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_NTftbX1UCFsQK5d8lVk8Vg_jtMca2bN
```

## Limite clínico

As regras da POC servem como apoio ao registro e à organização da progressão. Elas não substituem avaliação profissional, diagnóstico ou orientação médica.

## Roadmap

- v0.3: histórico local, múltiplos treinos Upper/Lower, edição simples de templates e exportação CSV inicial.
- v0.4: React Router em Data Mode, rotas reais e layouts.
- v0.5: Supabase Auth, schema, RLS, profiles e persistência real.
- v0.6: convites, sincronização de sessões e histórico semanal.
- v0.7: regras de progressão mais completas, observação por exercício e alertas de dor 24h.
- v0.8+: MealGuard leve, dashboard semanal e PWA completo.
- MVP 1.0: app autenticado, treino real persistido, dor/check-ins, recomendações conservadoras, exportação Markdown/CSV e fluxo mobile confiável.
