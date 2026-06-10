# RecoveryFit

POC mobile-first para registrar treino, dor e recuperação com progressão conservadora. Esta etapa é uma conversão da POC HTML para React, ainda com dados mockados e locais.

## Estado atual

Inclui:

- Fluxo `Hoje -> Treino -> Recuperação`.
- Treino mockado `Upper A`, com exercício ativo seguro: `Remada Baixa Triângulo`.
- Check-in diário leve.
- Registro de séries com carga, reps, RIR e dor durante o exercício.
- Registro de dor por ombro/hálux e piora em relação ao dia anterior.
- Ajuda contextual em drawer, sem `innerHTML`.
- Exportação Markdown gerada por função pura e cópia real via Clipboard API, com fallback manual selecionável.
- Providers mínimos: Tooltip e Sonner.

Não inclui nesta fase:

- Supabase, Auth, RLS, migrations ou `.env`.
- React Router, TanStack Query, Zustand, React Hook Form ou Zod.
- Persistência local entre reloads.
- Dark mode.
- IA integrada.

## Stack

- React 19
- Vite 8
- TypeScript strict
- Tailwind CSS 4
- shadcn/ui
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

- `mock-data.ts`: dados estáticos da POC.
- `types.ts`: contratos tipados da feature.
- `lib/recovery-rules.ts`: regras puras de dor/recomendação.
- `lib/export-report.ts`: geração pura do relatório Markdown.
- `index.tsx`: UI da POC e estado local do fluxo.

A estrutura evita instalar bibliotecas futuras antes da necessidade, mas deixa limites claros para evoluir depois para React Router, TanStack Query e Zustand.

## Supabase depois

O projeto Supabase planejado é `sys_recoveryfit` (`rlqnloolkxsnqpggvvfn`). Quando a próxima fase começar, usar:

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

## Próximos passos sugeridos

1. Validar a UX mobile do fluxo estático.
2. Definir schema Supabase e políticas RLS.
3. Adicionar autenticação e perfis.
4. Persistir sessões, séries, check-ins e logs de dor.
5. Evoluir relatório Markdown para dados reais e adicionar CSV depois.
