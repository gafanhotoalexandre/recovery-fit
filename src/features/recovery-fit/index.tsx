import {
  ActivityIcon,
  FileTextIcon,
  HomeIcon,
  PlayCircleIcon,
} from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
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
import { RecoveryView } from "./components/recovery-view"
import { SessionView } from "./components/session-view"
import { TodayView } from "./components/today-view"
import { getReportRecommendation } from "./lib/export-report"
import { getScheduleItem, isExerciseIncomplete } from "./lib/workout-format"
import { getWeekdayId, helpTopics, workoutsById } from "./mock-data"
import { useRecoveryFitStore } from "./store"
import type { AppView, HelpTopicId, WeekdayId, WorkoutId } from "./types"

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

export function RecoveryFitApp() {
  const store = useRecoveryFitStore()
  const todayDayId = useMemo(() => getWeekdayId(), [])
  const [selectedDayId, setSelectedDayId] = useState<WeekdayId>(todayDayId)
  const [helpTopicId, setHelpTopicId] = useState<HelpTopicId | null>(null)
  const [reportOpen, setReportOpen] = useState(false)

  const selectedScheduleItem = getScheduleItem(selectedDayId)
  const selectedWorkout = selectedScheduleItem.workoutId
    ? workoutsById[selectedScheduleItem.workoutId]
    : null
  const sessionWorkout =
    store.sessionStatus === "idle" ? null : workoutsById[store.workoutId]
  const activeTitle =
    tabConfig.find((tab) => tab.id === store.activeView)?.title ?? "RecoveryFit"
  const activeExercise = sessionWorkout?.exercises[store.activeExerciseIndex]
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
      sessionWorkout,
    }),
    [
      selectedScheduleItem,
      sessionWorkout,
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

  function handleSelectDay(dayId: WeekdayId) {
    const nextScheduleItem = getScheduleItem(dayId)

    setSelectedDayId(dayId)

    if (store.sessionStatus === "idle" && nextScheduleItem.workoutId) {
      store.setBaseWorkout(nextScheduleItem.workoutId)
    }
  }

  function handleStartSession(workoutId: WorkoutId) {
    store.startSession(workoutId)
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

  function handleFinishDiary() {
    const previousStatus = store.sessionStatus

    store.finishDiary()

    if (previousStatus === "active") {
      toast.success("Diário salvo. Relatório disponível na tela Hoje.")
      return
    }

    if (previousStatus === "completed") {
      toast.success("Recuperação atualizada no diário local.")
      return
    }

    toast.success("Recuperação salva sem concluir treino.")
  }

  return (
    <div className="min-h-svh overflow-x-clip bg-stone-200 text-foreground">
      <div className="mx-auto flex min-h-svh w-full max-w-xl flex-col overflow-hidden bg-stone-50 shadow-2xl ring-1 ring-zinc-200">
        <AppHeader
          title={activeTitle}
          onOpenExport={() => setReportOpen(true)}
        />
        <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-5 sm:px-5">
          <ViewTransition view={store.activeView}>
            {store.activeView === "today" ? (
              <TodayView
                completedExerciseIds={store.completedExerciseIds}
                dailyCheckin={store.dailyCheckin}
                recommendation={recommendation}
                selectedDayId={selectedDayId}
                selectedScheduleItem={selectedScheduleItem}
                selectedWorkout={selectedWorkout}
                sessionStatus={store.sessionStatus}
                sessionWorkout={sessionWorkout}
                todayDayId={todayDayId}
                onChangeCheckin={store.updateDailyCheckin}
                onContinueSession={() => store.setActiveView("session")}
                onOpenExport={() => setReportOpen(true)}
                onOpenHelp={setHelpTopicId}
                onResetSession={store.resetSession}
                onSelectDay={handleSelectDay}
                onStartSession={handleStartSession}
              />
            ) : null}
            {store.activeView === "session" && activeExercise && sessionWorkout ? (
              <SessionView
                activeExercise={activeExercise}
                activeExerciseIndex={store.activeExerciseIndex}
                completedExerciseIds={store.completedExerciseIds}
                exerciseLog={activeLog}
                workout={sessionWorkout}
                warmupChecklist={store.warmupChecklist}
                onChangeSet={store.updateSet}
                onGoRecovery={() => store.setActiveView("recovery")}
                onNextExercise={handleNextExercise}
                onOpenHelp={setHelpTopicId}
                onPreviousExercise={store.previousExercise}
                onSaveExercise={handleSaveExercise}
                onToggleWarmupItem={store.toggleWarmupItem}
                onUpdateNote={store.updateExerciseNote}
              />
            ) : null}
            {store.activeView === "recovery" ? (
              <RecoveryView
                recovery={store.recovery}
                recommendation={recommendation}
                sessionStatus={store.sessionStatus}
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
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] text-stone-50 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <img
          alt=""
          className="size-11 shrink-0 rounded-2xl"
          src="/recoveryfit.svg"
        />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-emerald-300">
            RecoveryFit
          </p>
          <h1 className="truncate text-xl font-semibold">{title}</h1>
        </div>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label="Exportar relatório"
            className="border-zinc-700 bg-zinc-900 text-stone-50 hover:bg-zinc-800 hover:text-white"
            size="icon"
            variant="outline"
            onClick={onOpenExport}
          >
            <FileTextIcon data-icon="inline-start" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Exportar relatório</TooltipContent>
      </Tooltip>
    </header>
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
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-xl -translate-x-1/2 border-t bg-card px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-12px_32px_rgba(12,10,9,0.08)] sm:px-5">
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
                  ? "bg-emerald-100 text-emerald-950"
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
