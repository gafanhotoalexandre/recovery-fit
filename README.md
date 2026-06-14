# RecoveryFit

POC mobile-first para registrar treino, dor e recuperação com progressão conservadora. A v0.3.1 mantém o app local e mock-backed, com polimento de uso real no celular.

## Estado Atual — v0.3.1

Inclui:

- Fluxo local `Hoje -> Treino -> Recuperação`.
- UX mobile refinada para registro de séries durante o treino, com mini-cards tocáveis por série.
- Clareza melhor quando existe sessão ativa ou concluída de outro treino.
- Exportação Markdown explícita quando ainda não há treino registrado.
- Identidade visual moderada baseada no `public/recoveryfit.svg`.
- Componentização leve das telas de Hoje, Treino, Recuperação, agenda e cards de sessão.
- Store Zustand com persistência seletiva em `localStorage`.
- Validação com Zod para drafts e dados normalizados.
- Agenda semanal local tipada, com destaque do dia atual e seleção manual de dia.
- Treinos `Upper A`, `Lower A`, `Upper B` e `Lower B` completos no fluxo local.
- Natação nas terças/quintas e descanso no domingo.
- Checklist real de aquecimento para ombros, escápulas e hálux.
- Registro de séries por exercício com carga, reps ou segundos, RIR, dor e região opcional.
- Check-in simples do dia.
- Recuperação pós-treino por ombro/hálux.
- Exportação Markdown com dados reais da sessão, mesmo incompleta.
- Documentação base para agentes e contexto de domínio.
- Favicon simples do projeto.

Privacidade local:

- Dados de sessão, check-in e recuperação ficam no `localStorage` do navegador.
- Não há backend, Auth, Supabase, sincronização remota ou `.env` nesta versão.
- O relatório Markdown é gerado no cliente a partir do estado local atual.

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
- `mock-data.ts`: agenda semanal, coleção local de treinos, aquecimento, labels e ajuda contextual.
- `lib/recovery-rules.ts`: regras puras de dor/recomendação.
- `lib/export-report.ts`: relatório Markdown baseado no estado local atual.
- `components/`: drawers extraídos da feature quando isso melhora leitura sem criar arquitetura excessiva.
- `AGENTS.md`: guia operacional para agentes.
- `docs/RECOVERYFIT_CONTEXT.md`: contexto estável de domínio.

A store persiste somente dados de sessão, check-in e recuperação. Drawers, toasts, avisos transitórios e estado visual ficam fora do storage.

## Supabase Depois

Supabase fica para fase futura. Quando a fase de backend começar, usar:

```bash
npm install @supabase/supabase-js
```

E, se o CLI for necessário sem instalação global:

```bash
npx supabase ...
```

Variáveis previstas:

```env
VITE_SUPABASE_URL=<SUPABASE_PROJECT_URL>
VITE_SUPABASE_PUBLISHABLE_KEY=<SUPABASE_PUBLISHABLE_KEY>
SUPABASE_PROJECT_REF=<SUPABASE_PROJECT_REF>
```

Não registre valores reais no README, docs, código ou histórico novo.

## Limite Clínico

As regras da POC servem como apoio ao registro e à organização da progressão. Elas não substituem avaliação profissional, diagnóstico ou orientação médica.

## Roadmap

- v0.3: múltiplos treinos locais Upper/Lower completos na agenda semanal.
- v0.3.1: polimento mobile, clareza de sessão, exportação sem sessão explícita e componentização leve.
- v0.4: React Router em Data Mode, rotas reais e layouts.
- v0.5: Supabase Auth, schema, RLS, profiles e persistência real.
- v0.6: convites, sincronização de sessões e histórico semanal.
- v0.7: regras de progressão mais completas, observação por exercício e alertas de dor 24h.
- v0.8+: MealGuard leve, dashboard semanal, PWA completo, templates editáveis e exportação CSV.
- MVP 1.0: app autenticado, treino real persistido, dor/check-ins, recomendações conservadoras, exportação Markdown/CSV e fluxo mobile confiável.
