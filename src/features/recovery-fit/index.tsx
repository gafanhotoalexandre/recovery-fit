import {
  ActivityIcon,
  AlertCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BrainCircuitIcon,
  CheckCircle2Icon,
  CheckIcon,
  ClipboardIcon,
  DumbbellIcon,
  FileTextIcon,
  HelpCircleIcon,
  HomeIcon,
  PlayCircleIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import {
  helpTopics,
  painRegionLabels,
  recoveryRegionLabels,
  upperAWorkout,
} from "./mock-data"
import {
  generateMarkdownReport,
  getReportRecommendation,
} from "./lib/export-report"
import { getPainSeverity } from "./lib/recovery-rules"
import { parseNumericDraft } from "./schemas"
import { useRecoveryFitStore } from "./store"
import type {
  AppView,
  HelpTopic,
  HelpTopicId,
  MarkdownReportInput,
  RecoveryRegionId,
  Tone,
  WorkoutExercise,
  WorkoutExerciseLog,
  WorkoutSetDraft,
} from "./types"

type CopyState = "idle" | "copied" | "manual"

const tabConfig: Array<{
  id: AppView
  label: string
  title: string
  icon: typeof HomeIcon
}> = [
  { id: "today", label: "Hoje", title: "Diário de Treino", icon: HomeIcon },
  { id: "session", label: "Treino", title: "Sessão Ativa", icon: PlayCircleIcon },
  { id: "recovery", label: "Recuperação", title: "Recuperação", icon: ActivityIcon },
]

const toneClasses: Record<
  Tone,
  {
    badge: string
    border: string
    icon: string
    surface: string
    text: string
  }
> = {
  danger: {
    badge: "bg-rose-100 text-rose-800",
    border: "border-rose-200",
    icon: "text-rose-600",
    surface: "bg-rose-50",
    text: "text-rose-950",
  },
  info: {
    badge: "bg-indigo-100 text-indigo-800",
    border: "border-indigo-100",
    icon: "text-indigo-600",
    surface: "bg-indigo-50",
    text: "text-indigo-950",
  },
  neutral: {
    badge: "bg-muted text-muted-foreground",
    border: "border-border",
    icon: "text-muted-foreground",
    surface: "bg-muted",
    text: "text-foreground",
  },
  success: {
    badge: "bg-emerald-100 text-emerald-800",
    border: "border-emerald-100",
    icon: "text-emerald-600",
    surface: "bg-emerald-50",
    text: "text-emerald-950",
  },
  warning: {
    badge: "bg-amber-100 text-amber-800",
    border: "border-amber-200",
    icon: "text-amber-600",
    surface: "bg-amber-50",
    text: "text-amber-950",
  },
}

function copyWithExecCommand(text: string) {
  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.setAttribute("readonly", "")
  textarea.style.left = "-9999px"
  textarea.style.position = "fixed"
  textarea.style.top = "0"
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()

  try {
    return document.execCommand("copy")
  } finally {
    document.body.removeChild(textarea)
  }
}

async function copyReportToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return true
  }

  return copyWithExecCommand(text)
}

function isExerciseIncomplete(log: WorkoutExerciseLog | undefined) {
  if (!log) {
    return true
  }

  return log.sets.some(
    (set) => set.loadKg === "" || set.reps === "" || set.rir === ""
  )
}

function formatCompletionCount(completed: number, total: number) {
  return `${completed}/${total}`
}

export function RecoveryFitApp() {
  const store = useRecoveryFitStore()
  const [helpTopicId, setHelpTopicId] = useState<HelpTopicId | null>(null)
  const [reportOpen, setReportOpen] = useState(false)

  const activeTitle =
    tabConfig.find((tab) => tab.id === store.activeView)?.title ?? "RecoveryFit"
  const activeExercise = upperAWorkout.exercises[store.activeExerciseIndex]
  const activeLog = activeExercise
    ? store.exerciseLogs[activeExercise.id]
    : undefined
  const reportInput = useMemo<MarkdownReportInput>(
    () => ({
      generatedAt: new Date(),
      session: {
        activeExerciseIndex: store.activeExerciseIndex,
        activeView: store.activeView,
        completedExerciseIds: store.completedExerciseIds,
        dailyCheckin: store.dailyCheckin,
        exerciseLogs: store.exerciseLogs,
        recovery: store.recovery,
        sessionStatus: store.sessionStatus,
        warmupChecklist: store.warmupChecklist,
        workoutId: store.workoutId,
      },
      workout: upperAWorkout,
    }),
    [
      store.activeExerciseIndex,
      store.activeView,
      store.completedExerciseIds,
      store.dailyCheckin,
      store.exerciseLogs,
      store.recovery,
      store.sessionStatus,
      store.warmupChecklist,
      store.workoutId,
    ]
  )
  const recommendation = getReportRecommendation(reportInput)
  const helpTopic = helpTopicId ? helpTopics[helpTopicId] : null

  function handleStartSession() {
    store.startSession()
    toast.success("Treino iniciado.")
  }

  function handleSaveExercise(exerciseId: string) {
    store.saveExercise(exerciseId)
    toast.success("Exercício salvo no diário local.")
  }

  function handleNextExercise() {
    if (isExerciseIncomplete(activeLog)) {
      toast.warning("Você pode avançar, mas este exercício ainda está incompleto.")
    }

    store.nextExercise()
  }

  function handlePreviousExercise() {
    store.previousExercise()
  }

  function handleFinishDiary() {
    store.finishDiary()
    toast.success("Diário salvo. Relatório disponível na tela Hoje.")
  }

  return (
    <div className="min-h-svh overflow-x-clip bg-stone-100 text-foreground">
      <div className="mx-auto flex min-h-svh w-[min(100vw,28rem)] min-w-0 max-w-md flex-col overflow-hidden bg-stone-50 shadow-2xl ring-1 ring-border">
        <AppHeader
          title={activeTitle}
          onOpenExport={() => setReportOpen(true)}
        />
        <main className="min-w-0 flex-1 overflow-y-auto px-5 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-5">
          <ViewTransition view={store.activeView}>
            {store.activeView === "today" ? (
              <TodayView
                completionCount={formatCompletionCount(
                  store.completedExerciseIds.length,
                  upperAWorkout.exercises.length
                )}
                dailyCheckin={store.dailyCheckin}
                recommendation={recommendation}
                sessionStatus={store.sessionStatus}
                onChangeCheckin={store.updateDailyCheckin}
                onOpenExport={() => setReportOpen(true)}
                onOpenHelp={setHelpTopicId}
                onResetSession={store.resetSession}
                onStartSession={handleStartSession}
              />
            ) : null}
            {store.activeView === "session" && activeExercise ? (
              <SessionView
                activeExercise={activeExercise}
                activeExerciseIndex={store.activeExerciseIndex}
                completedExerciseIds={store.completedExerciseIds}
                exerciseLog={activeLog}
                warmupChecklist={store.warmupChecklist}
                onChangeSet={store.updateSet}
                onNextExercise={handleNextExercise}
                onOpenHelp={setHelpTopicId}
                onPreviousExercise={handlePreviousExercise}
                onSaveExercise={handleSaveExercise}
                onToggleWarmupItem={store.toggleWarmupItem}
                onUpdateNote={store.updateExerciseNote}
              />
            ) : null}
            {store.activeView === "recovery" ? (
              <RecoveryView
                recovery={store.recovery}
                recommendation={recommendation}
                onChangeRecovery={store.updateRecovery}
                onFinishDiary={handleFinishDiary}
                onOpenHelp={setHelpTopicId}
              />
            ) : null}
          </ViewTransition>
        </main>
        <BottomNav activeView={store.activeView} onChangeView={store.setActiveView} />
      </div>

      <HelpDrawer
        topic={helpTopic}
        open={helpTopic !== null}
        onOpenChange={(open) => {
          if (!open) {
            setHelpTopicId(null)
          }
        }}
      />
      <ReportDrawer
        input={reportInput}
        open={reportOpen}
        onOpenChange={setReportOpen}
      />
    </div>
  )
}

function ViewTransition({
  children,
  view,
}: {
  children: ReactNode
  view: AppView
}) {
  return (
    <div
      key={view}
      className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-150 motion-reduce:transform-none motion-reduce:animate-none"
    >
      {children}
    </div>
  )
}

function AppHeader({
  title,
  onOpenExport,
}: {
  title: string
  onOpenExport: () => void
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-card px-5 pb-4 pt-[calc(2.5rem+env(safe-area-inset-top))]">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm font-medium text-muted-foreground">
          Progressão segura
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Exportar relatório"
              size="icon"
              variant="outline"
              onClick={onOpenExport}
            >
              <FileTextIcon data-icon="inline-start" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Exportar relatório</TooltipContent>
        </Tooltip>
        <div className="grid size-10 place-items-center rounded-full bg-muted text-sm font-semibold">
          AM
        </div>
      </div>
    </header>
  )
}

function TodayView({
  completionCount,
  dailyCheckin,
  recommendation,
  sessionStatus,
  onChangeCheckin,
  onOpenExport,
  onOpenHelp,
  onResetSession,
  onStartSession,
}: {
  completionCount: string
  dailyCheckin: ReturnType<typeof useRecoveryFitStore.getState>["dailyCheckin"]
  recommendation: ReturnType<typeof getReportRecommendation>
  sessionStatus: ReturnType<typeof useRecoveryFitStore.getState>["sessionStatus"]
  onChangeCheckin: ReturnType<typeof useRecoveryFitStore.getState>["updateDailyCheckin"]
  onOpenExport: () => void
  onOpenHelp: (topic: HelpTopicId) => void
  onResetSession: () => void
  onStartSession: () => void
}) {
  const tone = toneClasses[recommendation.tone]
  const completed = sessionStatus === "completed"

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        className={cn(
          "flex w-full items-start gap-3 rounded-xl border p-4 text-left",
          tone.surface,
          tone.border
        )}
        onClick={() => onOpenHelp("activeRule")}
      >
        <BrainCircuitIcon className={cn("mt-0.5 size-5 shrink-0", tone.icon)} />
        <span className="min-w-0 wrap-break-word">
          <span className={cn("block text-sm font-semibold", tone.text)}>
            Dose de hoje: {recommendation.title}
          </span>
          <span className={cn("mt-1 block text-xs leading-relaxed", tone.text)}>
            {recommendation.message}
          </span>
        </span>
      </button>

      {completed ? (
        <CompletedDayCard
          completionCount={completionCount}
          onOpenExport={onOpenExport}
          onResetSession={onResetSession}
        />
      ) : (
        <WorkoutTodayCard
          completionCount={completionCount}
          sessionStatus={sessionStatus}
          onStartSession={onStartSession}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="size-4 text-muted-foreground" />
            Check-in do dia
          </CardTitle>
          <CardDescription>
            Pequenos sinais de alimentação e recuperação de hoje.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <CheckinToggle
              checked={dailyCheckin.snack17hDone}
              label="Lanche 17h feito"
              tone="success"
              onChange={(checked) =>
                onChangeCheckin({ snack17hDone: checked })
              }
            />
            <CheckinToggle
              checked={dailyCheckin.hadTea}
              label="Tomou chá"
              tone="neutral"
              onChange={(checked) => onChangeCheckin({ hadTea: checked })}
            />
            <CheckinToggle
              checked={dailyCheckin.ateUltraprocessed}
              label="Ultraprocessados"
              tone="danger"
              onChange={(checked) =>
                onChangeCheckin({ ateUltraprocessed: checked })
              }
            />
            <CheckinToggle
              checked={dailyCheckin.gastricSymptoms}
              label="Sintoma gástrico"
              tone="warning"
              onChange={(checked) =>
                onChangeCheckin({ gastricSymptoms: checked })
              }
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium" htmlFor="hunger-before-dinner">
                Fome antes do jantar
              </label>
              <Badge variant="outline">{dailyCheckin.hungerBeforeDinner}/10</Badge>
            </div>
            <Slider
              id="hunger-before-dinner"
              max={10}
              min={0}
              step={1}
              value={[dailyCheckin.hungerBeforeDinner]}
              onValueChange={([value]) =>
                onChangeCheckin({ hungerBeforeDinner: value ?? 0 })
              }
            />
            <div className="flex justify-between text-[10px] font-semibold uppercase text-muted-foreground">
              <span>Nenhuma</span>
              <span>Muita</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function WorkoutTodayCard({
  completionCount,
  sessionStatus,
  onStartSession,
}: {
  completionCount: string
  sessionStatus: ReturnType<typeof useRecoveryFitStore.getState>["sessionStatus"]
  onStartSession: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <Badge variant="secondary" className="mb-2 uppercase">
            {sessionStatus === "active" ? "Em andamento" : "Aguardando"}
          </Badge>
          <CardTitle className="text-lg">{upperAWorkout.name}</CardTitle>
          <CardDescription>
            {upperAWorkout.focus} — {upperAWorkout.exercises.length} exercícios
          </CardDescription>
        </div>
        <CardAction>
          <DumbbellIcon className="size-6 text-muted-foreground/60" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="rounded-lg bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground wrap-break-word">
          Progresso local: {completionCount} exercícios concluídos. Comece com
          aquecimento para ombros, escápulas e hálux.
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onStartSession}>
          <PlayCircleIcon data-icon="inline-start" />
          {sessionStatus === "active" ? "Continuar treino" : "Iniciar treino"}
        </Button>
      </CardFooter>
    </Card>
  )
}

function CompletedDayCard({
  completionCount,
  onOpenExport,
  onResetSession,
}: {
  completionCount: string
  onOpenExport: () => void
  onResetSession: () => void
}) {
  return (
    <Card className="ring-emerald-200">
      <CardHeader>
        <div>
          <Badge className="mb-2 bg-emerald-100 text-emerald-800">
            Diário concluído
          </Badge>
          <CardTitle className="text-lg">Treino salvo localmente</CardTitle>
          <CardDescription>
            {completionCount} exercícios concluídos. O relatório pode ser
            exportado mesmo com campos incompletos.
          </CardDescription>
        </div>
        <CardAction>
          <CheckCircle2Icon className="size-6 text-emerald-600" />
        </CardAction>
      </CardHeader>
      <CardFooter className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button onClick={onOpenExport}>
          <FileTextIcon data-icon="inline-start" />
          Exportar relatório
        </Button>
        <ResetSessionDialog onResetSession={onResetSession} />
      </CardFooter>
    </Card>
  )
}

function ResetSessionDialog({
  onResetSession,
}: {
  onResetSession: () => void
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <RotateCcwIcon data-icon="inline-start" />
          Novo diário
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Iniciar um novo diário?</AlertDialogTitle>
          <AlertDialogDescription>
            Isso limpa a sessão local atual, incluindo séries, aquecimento,
            check-in e recuperação. Exporte o relatório antes se quiser guardar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onResetSession}>
            Iniciar novo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function CheckinToggle({
  checked,
  label,
  tone,
  onChange,
}: {
  checked: boolean
  label: string
  tone: Tone
  onChange: (checked: boolean) => void
}) {
  const toneClass = toneClasses[tone]

  return (
    <label
      className={cn(
        "flex min-h-16 cursor-pointer items-start gap-3 rounded-xl border bg-card p-3 text-xs font-medium leading-tight transition-colors",
        checked ? [toneClass.surface, toneClass.border, toneClass.text] : null
      )}
    >
      <Checkbox
        checked={checked}
        className="mt-0.5"
        onCheckedChange={(value) => onChange(value === true)}
      />
      <span>{label}</span>
    </label>
  )
}

function SessionView({
  activeExercise,
  activeExerciseIndex,
  completedExerciseIds,
  exerciseLog,
  warmupChecklist,
  onChangeSet,
  onNextExercise,
  onOpenHelp,
  onPreviousExercise,
  onSaveExercise,
  onToggleWarmupItem,
  onUpdateNote,
}: {
  activeExercise: WorkoutExercise
  activeExerciseIndex: number
  completedExerciseIds: string[]
  exerciseLog: WorkoutExerciseLog | undefined
  warmupChecklist: Record<string, boolean>
  onChangeSet: ReturnType<typeof useRecoveryFitStore.getState>["updateSet"]
  onNextExercise: () => void
  onOpenHelp: (topic: HelpTopicId) => void
  onPreviousExercise: () => void
  onSaveExercise: (exerciseId: string) => void
  onToggleWarmupItem: (itemId: string) => void
  onUpdateNote: ReturnType<typeof useRecoveryFitStore.getState>["updateExerciseNote"]
}) {
  const completed = completedExerciseIds.includes(activeExercise.id)
  const warmupDoneCount = Object.values(warmupChecklist).filter(Boolean).length
  const warmupIncomplete = warmupDoneCount < upperAWorkout.warmupItems.length
  const incompleteExercise = isExerciseIncomplete(exerciseLog)

  return (
    <div className="flex flex-col gap-5">
      <WarmupChecklist
        checklist={warmupChecklist}
        onOpenHelp={onOpenHelp}
        onToggleItem={onToggleWarmupItem}
      />

      {warmupIncomplete ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
          Você pode seguir, mas o aquecimento ajuda a calibrar ombros e base do
          pé.
        </div>
      ) : null}

      <Card className={completed ? "ring-emerald-300" : undefined}>
        <CardHeader className="border-b">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {activeExercise.order} de {upperAWorkout.exercises.length}
            </p>
            <CardTitle className="text-lg">{activeExercise.name}</CardTitle>
            <CardDescription>
              {activeExercise.plannedSets}×{activeExercise.repRange} · alvo RIR{" "}
              {activeExercise.targetRir}
            </CardDescription>
          </div>
          <CardAction>
            <Badge variant={completed ? "default" : "secondary"}>
              {completed ? "Salvo" : "Em registro"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-5">
          {activeExercise.observation ? (
            <p className="rounded-lg bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              {activeExercise.observation}
            </p>
          ) : null}

          <div className="grid grid-cols-[1.75rem_minmax(3.2rem,1fr)_minmax(3rem,0.85fr)_minmax(3rem,0.85fr)_minmax(3.2rem,0.9fr)] items-center gap-1.5 px-1 text-[10px] font-semibold uppercase text-muted-foreground">
            <span>Série</span>
            <span className="text-center">Kg</span>
            <span className="text-center">Reps</span>
            <span className="text-center">RIR</span>
            <button
              className="inline-flex items-center justify-center gap-1 text-rose-500"
              type="button"
              onClick={() => onOpenHelp("painDuringExercise")}
            >
              Dor
              <HelpCircleIcon className="size-3" />
            </button>
          </div>

          {exerciseLog?.sets.map((set) => (
            <WorkoutSetRow
              exerciseId={activeExercise.id}
              key={set.id}
              set={set}
              onChangeSet={onChangeSet}
            />
          ))}

          <PainRegionSelector
            exerciseId={activeExercise.id}
            exerciseLog={exerciseLog}
            onChangeSet={onChangeSet}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="exercise-note">
              Nota curta do exercício
            </label>
            <Textarea
              id="exercise-note"
              className="min-h-20 resize-none"
              maxLength={240}
              placeholder="Ex.: ombro ok, hálux sensível no apoio..."
              value={exerciseLog?.note ?? ""}
              onChange={(event) =>
                onUpdateNote(activeExercise.id, event.currentTarget.value)
              }
            />
          </div>

          {incompleteExercise ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
              Exercício com campos essenciais incompletos. Você pode avançar,
              mas o relatório vai marcar o que faltar.
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 border-t bg-muted/50">
          <Button className="w-full" onClick={() => onSaveExercise(activeExercise.id)}>
            <CheckIcon data-icon="inline-start" />
            Salvar exercício
          </Button>
          <div className="grid w-full grid-cols-2 gap-2">
            <Button
              disabled={activeExerciseIndex === 0}
              variant="outline"
              onClick={onPreviousExercise}
            >
              <ArrowLeftIcon data-icon="inline-start" />
              Voltar
            </Button>
            {activeExerciseIndex === upperAWorkout.exercises.length - 1 ? (
              <Button variant="outline" onClick={() => useRecoveryFitStore.getState().setActiveView("recovery")}>
                Recuperação
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            ) : (
              <Button variant="outline" onClick={onNextExercise}>
                Avançar
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      <ExerciseProgress completedExerciseIds={completedExerciseIds} />
    </div>
  )
}

function WarmupChecklist({
  checklist,
  onOpenHelp,
  onToggleItem,
}: {
  checklist: Record<string, boolean>
  onOpenHelp: (topic: HelpTopicId) => void
  onToggleItem: (itemId: string) => void
}) {
  const doneCount = Object.values(checklist).filter(Boolean).length

  return (
    <Card className="bg-zinc-950 text-white ring-zinc-800">
      <CardHeader>
        <div>
          <CardTitle className="text-white">Aquecimento obrigatório</CardTitle>
          <CardDescription className="text-zinc-400">
            {doneCount}/{upperAWorkout.warmupItems.length} itens feitos
          </CardDescription>
        </div>
        <CardAction>
          <Button
            aria-label="Ajuda do aquecimento"
            className="border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
            size="icon"
            variant="outline"
            onClick={() => onOpenHelp("warmup")}
          >
            <HelpCircleIcon data-icon="inline-start" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {upperAWorkout.warmupItems.map((item) => (
          <label
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm"
            key={item.id}
          >
            <Checkbox
              checked={Boolean(checklist[item.id])}
              className="mt-0.5 border-zinc-600"
              onCheckedChange={() => onToggleItem(item.id)}
            />
            <span className="flex min-w-0 flex-col">
              <span className="font-medium text-white">{item.label}</span>
              <span className="text-xs text-zinc-400">{item.prescription}</span>
            </span>
          </label>
        ))}
      </CardContent>
    </Card>
  )
}

function WorkoutSetRow({
  exerciseId,
  set,
  onChangeSet,
}: {
  exerciseId: string
  set: WorkoutSetDraft
  onChangeSet: ReturnType<typeof useRecoveryFitStore.getState>["updateSet"]
}) {
  return (
    <div className="grid grid-cols-[1.75rem_minmax(3.2rem,1fr)_minmax(3rem,0.85fr)_minmax(3rem,0.85fr)_minmax(3.2rem,0.9fr)] items-center gap-1.5">
      <div className="grid size-7 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
        {set.setNumber}
      </div>
      <Input
        aria-label={`Carga da série ${set.setNumber}`}
        className="h-11 px-1 text-center font-semibold"
        inputMode="decimal"
        min={0}
        step={0.5}
        type="number"
        value={set.loadKg}
        onChange={(event) =>
          onChangeSet(exerciseId, set.id, "loadKg", event.currentTarget.value)
        }
      />
      <Input
        aria-label={`Repetições da série ${set.setNumber}`}
        className="h-11 px-1 text-center font-semibold"
        inputMode="numeric"
        min={1}
        step={1}
        type="number"
        value={set.reps}
        onChange={(event) =>
          onChangeSet(exerciseId, set.id, "reps", event.currentTarget.value)
        }
      />
      <Select
        value={set.rir}
        onValueChange={(value) => onChangeSet(exerciseId, set.id, "rir", value)}
      >
        <SelectTrigger
          aria-label={`RIR da série ${set.setNumber}`}
          className="h-11 w-full justify-center px-1 text-center font-semibold"
        >
          <SelectValue placeholder="-" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {[0, 1, 2, 3, 4, 5].map((rir) => (
              <SelectItem key={rir} value={String(rir)}>
                {rir}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Input
        aria-label={`Dor da série ${set.setNumber}`}
        className="h-11 border-rose-200 bg-rose-50/60 px-1 text-center font-semibold text-rose-700"
        inputMode="numeric"
        max={10}
        min={0}
        step={1}
        type="number"
        value={set.painDuring}
        onChange={(event) =>
          onChangeSet(exerciseId, set.id, "painDuring", event.currentTarget.value)
        }
      />
    </div>
  )
}

function PainRegionSelector({
  exerciseId,
  exerciseLog,
  onChangeSet,
}: {
  exerciseId: string
  exerciseLog: WorkoutExerciseLog | undefined
  onChangeSet: ReturnType<typeof useRecoveryFitStore.getState>["updateSet"]
}) {
  const setsWithPain =
    exerciseLog?.sets.filter((set) => parseNumericDraft(set.painDuring) !== null) ??
    []

  if (setsWithPain.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">Região da dor por série</span>
      <div className="flex flex-col gap-2">
        {setsWithPain.map((set) => (
          <div className="grid grid-cols-[3rem_1fr] items-center gap-2" key={set.id}>
            <span className="text-xs font-semibold text-muted-foreground">
              Série {set.setNumber}
            </span>
            <Select
              value={set.painRegion || "none"}
              onValueChange={(value) =>
                onChangeSet(
                  exerciseId,
                  set.id,
                  "painRegion",
                  value === "none" ? "" : value
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar região" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="none">Não preenchido</SelectItem>
                  {Object.entries(painRegionLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  )
}

function ExerciseProgress({
  completedExerciseIds,
}: {
  completedExerciseIds: string[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Exercícios do Upper A</CardTitle>
        <CardDescription>
          {completedExerciseIds.length}/{upperAWorkout.exercises.length} salvos
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {upperAWorkout.exercises.map((exercise) => {
          const completed = completedExerciseIds.includes(exercise.id)

          return (
            <div
              className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2 text-sm"
              key={exercise.id}
            >
              <span className="min-w-0 truncate">{exercise.name}</span>
              <Badge variant={completed ? "default" : "outline"}>
                {completed ? "Salvo" : `${exercise.plannedSets}×${exercise.repRange}`}
              </Badge>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function RecoveryView({
  recovery,
  recommendation,
  onChangeRecovery,
  onFinishDiary,
  onOpenHelp,
}: {
  recovery: ReturnType<typeof useRecoveryFitStore.getState>["recovery"]
  recommendation: ReturnType<typeof getReportRecommendation>
  onChangeRecovery: ReturnType<typeof useRecoveryFitStore.getState>["updateRecovery"]
  onFinishDiary: () => void
  onOpenHelp: (topic: HelpTopicId) => void
}) {
  const tone = toneClasses[recommendation.tone]

  return (
    <div className="flex flex-col gap-5">
      <button
        className={cn(
          "flex w-full items-start gap-3 rounded-xl border p-4 text-left",
          tone.surface,
          tone.border
        )}
        type="button"
        onClick={() => onOpenHelp("recoveryCheckin")}
      >
        <ShieldCheckIcon className={cn("mt-0.5 size-5 shrink-0", tone.icon)} />
        <span>
          <span className={cn("block text-sm font-semibold", tone.text)}>
            {recommendation.title}
          </span>
          <span className={cn("mt-1 block text-xs leading-relaxed", tone.text)}>
            {recommendation.message}
          </span>
        </span>
      </button>

      <div className="flex flex-col gap-4">
        {Object.entries(recoveryRegionLabels).map(([region, label]) => (
          <PainRegionCard
            key={region}
            label={label}
            value={recovery.pain[region as RecoveryRegionId]}
            onChange={(value) =>
              onChangeRecovery({
                pain: {
                  [region]: value,
                } as Partial<typeof recovery.pain>,
              })
            }
          />
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <label className="flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-xl border bg-card p-4 text-sm font-medium">
            <span>Piorou em relação a ontem?</span>
            <Checkbox
              checked={recovery.worseThanYesterday}
              onCheckedChange={(value) =>
                onChangeRecovery({ worseThanYesterday: value === true })
              }
            />
          </label>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="recovery-notes">
              Notas de recuperação
            </label>
            <Textarea
              id="recovery-notes"
              className="min-h-24 resize-none"
              maxLength={500}
              placeholder="Ex.: hálux sensível, ombro ok, sono ruim..."
              value={recovery.notes}
              onChange={(event) =>
                onChangeRecovery({ notes: event.currentTarget.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Button className="h-12 w-full" onClick={onFinishDiary}>
        Salvar diário
      </Button>
    </div>
  )
}

function PainRegionCard({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  const severity = getPainSeverity(value)
  const tone = toneClasses[severity.tone]

  return (
    <Card className={cn(value >= 4 ? tone.border : undefined)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {label}
          {value >= 4 ? (
            <AlertCircleIcon className={cn("size-4", tone.icon)} />
          ) : null}
        </CardTitle>
        <CardAction>
          <span
            className={cn(
              "inline-flex h-6 items-center rounded-md px-2 text-[10px] font-semibold uppercase tracking-wide",
              tone.badge
            )}
          >
            {severity.label}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Slider
          max={10}
          min={0}
          step={1}
          value={[value]}
          onValueChange={([nextValue]) => onChange(nextValue ?? 0)}
        />
        <div className="flex justify-between text-[10px] font-semibold uppercase text-muted-foreground">
          <span>Zero</span>
          <span>Atenção</span>
          <span>Reduzir dose</span>
        </div>
      </CardContent>
    </Card>
  )
}

function BottomNav({
  activeView,
  onChangeView,
}: {
  activeView: AppView
  onChangeView: (view: AppView) => void
}) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-[min(100vw,28rem)] -translate-x-1/2 border-t bg-card px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="grid grid-cols-3 gap-2">
        {tabConfig.map((tab) => {
          const Icon = tab.icon
          const active = activeView === tab.id

          return (
            <button
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-semibold transition-colors",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
              key={tab.id}
              type="button"
              onClick={() => onChangeView(tab.id)}
            >
              <Icon className="size-5" />
              <span className="max-w-full truncate">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function HelpDrawer({
  topic,
  open,
  onOpenChange,
}: {
  topic: HelpTopic | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto w-full max-w-md">
        <DrawerHeader className="text-left">
          <DrawerTitle>{topic?.title ?? "Ajuda"}</DrawerTitle>
          <DrawerDescription>{topic?.description}</DrawerDescription>
        </DrawerHeader>
        {topic ? (
          <div className="flex max-h-[55vh] flex-col gap-4 overflow-y-auto px-4 pb-2 text-sm leading-relaxed">
            {topic.sections.map((section, index) => (
              <section className="flex flex-col gap-2" key={index}>
                {section.title ? (
                  <h3 className="font-semibold">{section.title}</h3>
                ) : null}
                {section.paragraphs?.map((paragraph) => (
                  <p className="text-muted-foreground" key={paragraph}>
                    {paragraph}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="flex list-disc flex-col gap-1 pl-5 text-muted-foreground">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        ) : null}
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Fechar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function ReportDrawer({
  input,
  open,
  onOpenChange,
}: {
  input: MarkdownReportInput
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [copyState, setCopyState] = useState<CopyState>("idle")
  const markdown = useMemo(() => generateMarkdownReport(input), [input])

  useEffect(() => {
    if (copyState === "manual") {
      textareaRef.current?.focus()
      textareaRef.current?.select()
    }
  }, [copyState])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setCopyState("idle")
    }

    onOpenChange(nextOpen)
  }

  async function handleCopy() {
    try {
      const copied = await copyReportToClipboard(markdown)

      if (copied) {
        setCopyState("copied")
        toast.success("Markdown copiado.")
        return
      }
    } catch {
      // The visible textarea below is the intentional manual fallback.
    }

    setCopyState("manual")
    toast.warning("Não consegui copiar automaticamente. O texto foi selecionado.")
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="mx-auto w-full max-w-md">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2">
            <FileTextIcon className="size-4" />
            Exportar relatório
          </DrawerTitle>
          <DrawerDescription>
            Markdown gerado localmente com os dados atuais da sessão.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-3 px-4">
          <div
            className={cn(
              "rounded-xl border p-3 text-xs leading-relaxed",
              copyState === "manual"
                ? "border-amber-200 bg-amber-50 text-amber-950"
                : "border-border bg-muted text-muted-foreground"
            )}
          >
            {copyState === "manual" ? (
              <span>
                Cópia automática indisponível. O texto abaixo está selecionado
                para cópia manual.
              </span>
            ) : (
              <span>
                A cópia usa a Clipboard API. Se o navegador bloquear, o texto
                fica selecionável aqui.
              </span>
            )}
          </div>
          <Textarea
            ref={textareaRef}
            aria-label="Relatório Markdown"
            className="h-72 resize-none font-mono text-xs leading-relaxed"
            readOnly
            value={markdown}
          />
        </div>
        <DrawerFooter>
          <Button onClick={handleCopy}>
            {copyState === "copied" ? (
              <CheckCircle2Icon data-icon="inline-start" />
            ) : (
              <ClipboardIcon data-icon="inline-start" />
            )}
            {copyState === "copied" ? "Copiado" : "Copiar Markdown"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Fechar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
