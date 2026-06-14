import { ActivityIcon, BrainCircuitIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

import { getReportRecommendation } from "../lib/export-report"
import {
  formatCompletionCount,
  getCompletedExerciseCount,
} from "../lib/workout-format"
import type {
  DailyCheckinState,
  HelpTopicId,
  SessionStatus,
  Tone,
  WeekdayId,
  WeeklyScheduleItem,
  WorkoutId,
  WorkoutPlan,
} from "../types"
import {
  CompletedDayCard,
  ExistingSessionCard,
  PlannedActivityCard,
  SessionConflictCard,
  WorkoutTodayCard,
} from "./session-cards"
import { toneClasses } from "./view-tone"
import { WeeklySelector } from "./weekly-selector"

export function TodayView({
  completedExerciseIds,
  dailyCheckin,
  recommendation,
  selectedDayId,
  selectedScheduleItem,
  selectedWorkout,
  sessionStatus,
  sessionWorkout,
  todayDayId,
  onChangeCheckin,
  onContinueSession,
  onOpenExport,
  onOpenHelp,
  onResetSession,
  onSelectDay,
  onStartSession,
}: {
  completedExerciseIds: string[]
  dailyCheckin: DailyCheckinState
  recommendation: ReturnType<typeof getReportRecommendation>
  selectedDayId: WeekdayId
  selectedScheduleItem: WeeklyScheduleItem
  selectedWorkout: WorkoutPlan | null
  sessionStatus: SessionStatus
  sessionWorkout: WorkoutPlan | null
  todayDayId: WeekdayId
  onChangeCheckin: (checkin: Partial<DailyCheckinState>) => void
  onContinueSession: () => void
  onOpenExport: () => void
  onOpenHelp: (topic: HelpTopicId) => void
  onResetSession: (nextWorkoutId?: WorkoutId) => void
  onSelectDay: (dayId: WeekdayId) => void
  onStartSession: (workoutId: WorkoutId) => void
}) {
  const tone = toneClasses[recommendation.tone]
  const hasSession = sessionStatus !== "idle" && sessionWorkout !== null
  const selectedMatchesSession =
    hasSession && selectedWorkout?.id === sessionWorkout.id
  const selectedCompletionCount = selectedWorkout
    ? formatCompletionCount(
        selectedMatchesSession
          ? getCompletedExerciseCount(selectedWorkout, completedExerciseIds)
          : 0,
        selectedWorkout.exercises.length
      )
    : "0/0"
  const sessionCompletionCount = sessionWorkout
    ? formatCompletionCount(
        getCompletedExerciseCount(sessionWorkout, completedExerciseIds),
        sessionWorkout.exercises.length
      )
    : "0/0"

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

      {selectedWorkout ? (
        hasSession && !selectedMatchesSession && sessionWorkout ? (
          <SessionConflictCard
            selectedWorkout={selectedWorkout}
            sessionCompletionCount={sessionCompletionCount}
            sessionStatus={sessionStatus}
            sessionWorkout={sessionWorkout}
            onContinueSession={onContinueSession}
            onOpenExport={onOpenExport}
            onResetSession={() => onResetSession(selectedWorkout.id)}
          />
        ) : sessionStatus === "completed" ? (
          <CompletedDayCard
            completionCount={selectedCompletionCount}
            workout={selectedWorkout}
            onOpenExport={onOpenExport}
            onResetSession={() => onResetSession(selectedWorkout.id)}
          />
        ) : (
          <WorkoutTodayCard
            completionCount={selectedCompletionCount}
            sessionStatus={sessionStatus}
            workout={selectedWorkout}
            onStartSession={() => onStartSession(selectedWorkout.id)}
          />
        )
      ) : (
        <PlannedActivityCard scheduleItem={selectedScheduleItem} />
      )}

      {!selectedWorkout && hasSession && sessionWorkout ? (
        <ExistingSessionCard
          completionCount={sessionCompletionCount}
          sessionStatus={sessionStatus}
          workout={sessionWorkout}
          onContinueSession={onContinueSession}
          onOpenExport={onOpenExport}
          onResetSession={() => onResetSession(sessionWorkout.id)}
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
