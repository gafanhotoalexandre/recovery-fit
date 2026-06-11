import {
  ActivityIcon,
  AlertCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BrainCircuitIcon,
  CheckCircle2Icon,
  CheckIcon,
  DumbbellIcon,
  FileTextIcon,
  HelpCircleIcon,
  HomeIcon,
  PlayCircleIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
} from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"
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

import { HelpDrawer } from "./components/help-drawer"
import {
  ReportDrawer,
  type ReportDraftInput,
} from "./components/report-drawer"
import {
  getWeekdayId,
  helpTopics,
  painRegionLabels,
  plannedWorkouts,
  recoveryRegionLabels,
  upperAWorkout,
  weeklySchedule,
} from "./mock-data"
import { getReportRecommendation } from "./lib/export-report"
import { getPainSeverity } from "./lib/recovery-rules"
import { parseNumericDraft } from "./schemas"
import { useRecoveryFitStore } from "./store"
import type {
  AppView,
  HelpTopicId,
  RecoveryRegionId,
  WeekdayId,
  Tone,
  WeeklyScheduleItem,
  WorkoutExercise,
  WorkoutExerciseLog,
  WorkoutSetDraft,
} from "./types"

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

function getScheduleItem(dayId: WeekdayId) {
  return weeklySchedule.find((item) => item.id === dayId) ?? weeklySchedule[0]
}

function isUpperASelected(scheduleItem: WeeklyScheduleItem) {
  return scheduleItem.workoutId === upperAWorkout.id
}

export function RecoveryFitApp() {
  const store = useRecoveryFitStore()
  const todayDayId = useMemo(() => getWeekdayId(), [])
  const [selectedDayId, setSelectedDayId] = useState<WeekdayId>(todayDayId)
  const [helpTopicId, setHelpTopicId] = useState<HelpTopicId | null>(null)
  const [reportOpen, setReportOpen] = useState(false)

  const selectedScheduleItem = getScheduleItem(selectedDayId)
  const activeTitle =
    tabConfig.find((tab) => tab.id === store.activeView)?.title ?? "RecoveryFit"
  const activeExercise = upperAWorkout.exercises[store.activeExerciseIndex]
  const activeLog = activeExercise
    ? store.exerciseLogs[activeExercise.id]
    : undefined
  const reportInput = useMemo<ReportDraftInput>(
    () => ({
      selectedScheduleItem,
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
      selectedScheduleItem,
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
                selectedDayId={selectedDayId}
                selectedScheduleItem={selectedScheduleItem}
                sessionStatus={store.sessionStatus}
                todayDayId={todayDayId}
                onChangeCheckin={store.updateDailyCheckin}
                onContinueSession={() => store.setActiveView("session")}
                onOpenExport={() => setReportOpen(true)}
                onOpenHelp={setHelpTopicId}
                onResetSession={store.resetSession}
                onSelectDay={setSelectedDayId}
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
                onGoRecovery={() => store.setActiveView("recovery")}
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
  selectedDayId,
  selectedScheduleItem,
  sessionStatus,
  todayDayId,
  onChangeCheckin,
  onContinueSession,
  onOpenExport,
  onOpenHelp,
  onResetSession,
  onSelectDay,
  onStartSession,
}: {
  completionCount: string
  dailyCheckin: ReturnType<typeof useRecoveryFitStore.getState>["dailyCheckin"]
  recommendation: ReturnType<typeof getReportRecommendation>
  selectedDayId: WeekdayId
  selectedScheduleItem: WeeklyScheduleItem
  sessionStatus: ReturnType<typeof useRecoveryFitStore.getState>["sessionStatus"]
  todayDayId: WeekdayId
  onChangeCheckin: ReturnType<typeof useRecoveryFitStore.getState>["updateDailyCheckin"]
  onContinueSession: () => void
  onOpenExport: () => void
  onOpenHelp: (topic: HelpTopicId) => void
  onResetSession: () => void
  onSelectDay: (dayId: WeekdayId) => void
  onStartSession: () => void
}) {
  const tone = toneClasses[recommendation.tone]
  const completed = sessionStatus === "completed"
  const hasUpperASession = sessionStatus !== "idle"
  const selectedIsUpperA = isUpperASelected(selectedScheduleItem)

  return (
    <div className="flex flex-col gap-5">
      <WeeklySelector
        selectedDayId={selectedDayId}
        todayDayId={todayDayId}
        onSelectDay={onSelectDay}
      />

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

      {selectedIsUpperA ? (
        completed ? (
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
        )
      ) : (
        <PlannedActivityCard scheduleItem={selectedScheduleItem} />
      )}

      {!selectedIsUpperA && hasUpperASession ? (
        <UpperASessionCard
          completionCount={completionCount}
          sessionStatus={sessionStatus}
          onContinueSession={onContinueSession}
          onOpenExport={onOpenExport}
          onResetSession={onResetSession}
        />
      ) : null}

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

function WeeklySelector({
  selectedDayId,
  todayDayId,
  onSelectDay,
}: {
  selectedDayId: WeekdayId
  todayDayId: WeekdayId
  onSelectDay: (dayId: WeekdayId) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Agenda semanal</CardTitle>
        <CardDescription>Escolha o dia para ver o plano local.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1.5">
          {weeklySchedule.map((item) => {
            const selected = item.id === selectedDayId
            const isToday = item.id === todayDayId

            return (
              <button
                aria-current={selected ? "date" : undefined}
                className={cn(
                  "flex min-h-14 min-w-0 flex-col items-center justify-center rounded-lg border px-1 text-[11px] font-semibold transition-colors",
                  selected
                    ? "border-zinc-900 bg-zinc-950 text-white"
                    : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                key={item.id}
                type="button"
                onClick={() => onSelectDay(item.id)}
              >
                <span>{item.shortLabel}</span>
                {isToday ? (
                  <span
                    className={cn(
                      "mt-1 rounded-full px-1.5 py-0.5 text-[9px] uppercase",
                      selected
                        ? "bg-white/15 text-white"
                        : "bg-amber-100 text-amber-800"
                    )}
                  >
                    hoje
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function PlannedActivityCard({
  scheduleItem,
}: {
  scheduleItem: WeeklyScheduleItem
}) {
  const plannedWorkout = scheduleItem.workoutId
    ? plannedWorkouts[scheduleItem.workoutId]
    : undefined
  const isWorkout = scheduleItem.activityKind === "workout"
  const isSwim = scheduleItem.activityKind === "swim"

  return (
    <Card>
      <CardHeader>
        <div>
          <Badge variant="secondary" className="mb-2 uppercase">
            {isWorkout ? "Planejado" : isSwim ? "Natação" : "Recuperação"}
          </Badge>
          <CardTitle className="text-lg">{scheduleItem.title}</CardTitle>
          <CardDescription>
            {plannedWorkout?.focus ?? scheduleItem.description}
          </CardDescription>
        </div>
        <CardAction>
          {isWorkout ? (
            <DumbbellIcon className="size-6 text-muted-foreground/60" />
          ) : isSwim ? (
            <ActivityIcon className="size-6 text-muted-foreground/60" />
          ) : (
            <ShieldCheckIcon className="size-6 text-muted-foreground/60" />
          )}
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="rounded-lg bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground wrap-break-word">
          {isWorkout
            ? "Este treino está tipado na agenda, mas o registro completo entra em uma próxima versão."
            : scheduleItem.description}
        </p>
      </CardContent>
    </Card>
  )
}

function UpperASessionCard({
  completionCount,
  sessionStatus,
  onContinueSession,
  onOpenExport,
  onResetSession,
}: {
  completionCount: string
  sessionStatus: ReturnType<typeof useRecoveryFitStore.getState>["sessionStatus"]
  onContinueSession: () => void
  onOpenExport: () => void
  onResetSession: () => void
}) {
  const completed = sessionStatus === "completed"

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <div>
          <Badge variant="outline" className="mb-2">
            Upper A
          </Badge>
          <CardTitle className="text-base">
            Sessão Upper A {completed ? "concluída" : "em andamento"}
          </CardTitle>
          <CardDescription>
            {completionCount} exercícios concluídos no diário local.
          </CardDescription>
        </div>
      </CardHeader>
      <CardFooter className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {completed ? (
          <>
            <Button onClick={onOpenExport}>
              <FileTextIcon data-icon="inline-start" />
              Exportar relatório
            </Button>
            <ResetSessionDialog onResetSession={onResetSession} />
          </>
        ) : (
          <Button className="sm:col-span-2" onClick={onContinueSession}>
            <PlayCircleIcon data-icon="inline-start" />
            Continuar treino
          </Button>
        )}
      </CardFooter>
    </Card>
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
  onGoRecovery,
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
  onGoRecovery: () => void
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
              <Button variant="outline" onClick={onGoRecovery}>
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
    exerciseLog?.sets.filter((set) => {
      const pain = parseNumericDraft(set.painDuring)

      return pain !== null && pain > 0
    }) ??
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
