import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  HelpCircleIcon,
} from "lucide-react"

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
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import { painRegionLabels } from "../mock-data"
import {
  getCompletedExerciseCount,
  formatPlannedPrescription,
  isExerciseIncomplete,
} from "../lib/workout-format"
import { parseNumericDraft } from "../schemas"
import type {
  HelpTopicId,
  PainRegionId,
  WorkoutExercise,
  WorkoutExerciseLog,
  WorkoutPlan,
  WorkoutSetDraft,
} from "../types"
import type { RecoveryFitStore } from "../store"

export function SessionView({
  activeExercise,
  activeExerciseIndex,
  completedExerciseIds,
  exerciseLog,
  workout,
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
  workout: WorkoutPlan
  warmupChecklist: Record<string, boolean>
  onChangeSet: RecoveryFitStore["updateSet"]
  onGoRecovery: () => void
  onNextExercise: () => void
  onOpenHelp: (topic: HelpTopicId) => void
  onPreviousExercise: () => void
  onSaveExercise: (exerciseId: string) => void
  onToggleWarmupItem: (itemId: string) => void
  onUpdateNote: RecoveryFitStore["updateExerciseNote"]
}) {
  const completed = completedExerciseIds.includes(activeExercise.id)
  const warmupDoneCount = Object.values(warmupChecklist).filter(Boolean).length
  const warmupIncomplete = warmupDoneCount < workout.warmupItems.length
  const incompleteExercise = isExerciseIncomplete(exerciseLog)
  const completedCount = getCompletedExerciseCount(workout, completedExerciseIds)
  const progressValue = (completedCount / workout.exercises.length) * 100

  return (
    <div className="flex flex-col gap-5">
      <WarmupChecklist
        checklist={warmupChecklist}
        workout={workout}
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
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">
              {activeExercise.order} de {workout.exercises.length}
            </p>
            <CardTitle className="text-lg">{activeExercise.name}</CardTitle>
            <CardDescription>
              {formatPlannedPrescription(activeExercise)} - alvo RIR{" "}
              {activeExercise.targetRir}
            </CardDescription>
          </div>
          <CardAction>
            <Badge variant={completed ? "default" : "secondary"}>
              {completed ? "Salvo" : "Registro"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-5">
          {activeExercise.observation ? (
            <p className="rounded-lg bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              {activeExercise.observation}
            </p>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Séries do exercício</p>
              <p className="text-xs text-muted-foreground">
                Toques maiores para registrar durante o treino.
              </p>
            </div>
            <Button
              aria-label="Ajuda sobre dor durante o exercício"
              size="icon"
              variant="ghost"
              onClick={() => onOpenHelp("painDuringExercise")}
            >
              <HelpCircleIcon data-icon="inline-start" />
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {exerciseLog?.sets.map((set) => (
              <WorkoutSetCard
                exerciseId={activeExercise.id}
                key={set.id}
                set={set}
                trackingUnit={activeExercise.trackingUnit}
                onChangeSet={onChangeSet}
              />
            ))}
          </div>

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
          <Button className="h-12 w-full" onClick={() => onSaveExercise(activeExercise.id)}>
            <CheckIcon data-icon="inline-start" />
            Salvar exercício
          </Button>
          <div className="grid w-full grid-cols-2 gap-2">
            <Button
              className="h-11"
              disabled={activeExerciseIndex === 0}
              variant="outline"
              onClick={onPreviousExercise}
            >
              <ArrowLeftIcon data-icon="inline-start" />
              Voltar
            </Button>
            {activeExerciseIndex === workout.exercises.length - 1 ? (
              <Button className="h-11" variant="outline" onClick={onGoRecovery}>
                Recuperação
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            ) : (
              <Button className="h-11" variant="outline" onClick={onNextExercise}>
                Avançar
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      <ExerciseProgress
        completedExerciseIds={completedExerciseIds}
        progressValue={progressValue}
        workout={workout}
      />
    </div>
  )
}

function WarmupChecklist({
  checklist,
  workout,
  onOpenHelp,
  onToggleItem,
}: {
  checklist: Record<string, boolean>
  workout: WorkoutPlan
  onOpenHelp: (topic: HelpTopicId) => void
  onToggleItem: (itemId: string) => void
}) {
  const doneCount = Object.values(checklist).filter(Boolean).length

  return (
    <Card className="border-zinc-800 bg-zinc-950 text-white">
      <CardHeader>
        <div>
          <CardTitle className="text-white">Aquecimento obrigatório</CardTitle>
          <CardDescription className="text-zinc-400">
            {doneCount}/{workout.warmupItems.length} itens feitos
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
        {workout.warmupItems.map((item) => (
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

function WorkoutSetCard({
  exerciseId,
  set,
  trackingUnit,
  onChangeSet,
}: {
  exerciseId: string
  set: WorkoutSetDraft
  trackingUnit: WorkoutExercise["trackingUnit"]
  onChangeSet: RecoveryFitStore["updateSet"]
}) {
  const volumeLabel = trackingUnit === "seconds" ? "Seg" : "Reps"
  const volumeAria = trackingUnit === "seconds" ? "segundos" : "repetições"
  const pain = parseNumericDraft(set.painDuring)
  const hasPain = pain !== null && pain > 0

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-3 shadow-sm",
        hasPain ? "border-rose-200 bg-rose-50/40" : "border-border"
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold">Série {set.setNumber}</span>
        {hasPain ? (
          <Badge className="bg-rose-100 text-rose-800">Dor {set.painDuring}</Badge>
        ) : (
          <Badge variant="outline">Sem dor</Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <SetField label="Kg">
          <Input
            aria-label={`Carga da série ${set.setNumber}`}
            className="h-12 text-center text-base font-semibold"
            inputMode="decimal"
            min={0}
            step={0.5}
            type="number"
            value={set.loadKg}
            onChange={(event) =>
              onChangeSet(exerciseId, set.id, "loadKg", event.currentTarget.value)
            }
          />
        </SetField>
        <SetField label={volumeLabel}>
          <Input
            aria-label={`${volumeAria} da série ${set.setNumber}`}
            className="h-12 text-center text-base font-semibold"
            inputMode="numeric"
            min={1}
            step={1}
            type="number"
            value={set.reps}
            onChange={(event) =>
              onChangeSet(exerciseId, set.id, "reps", event.currentTarget.value)
            }
          />
        </SetField>
        <SetField label="RIR">
          <Select
            value={set.rir}
            onValueChange={(value) => onChangeSet(exerciseId, set.id, "rir", value)}
          >
            <SelectTrigger
              aria-label={`RIR da série ${set.setNumber}`}
              className="h-12 w-full justify-center text-center text-base font-semibold"
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
        </SetField>
        <SetField label="Dor">
          <Input
            aria-label={`Dor da série ${set.setNumber}`}
            className="h-12 border-rose-200 bg-white text-center text-base font-semibold text-rose-700"
            inputMode="numeric"
            max={10}
            min={0}
            step={1}
            type="number"
            value={set.painDuring}
            onChange={(event) =>
              onChangeSet(
                exerciseId,
                set.id,
                "painDuring",
                event.currentTarget.value
              )
            }
          />
        </SetField>
      </div>

      {hasPain ? (
        <div className="mt-3">
          <SetField label="Região da dor">
            <Select
              value={set.painRegion || "none"}
              onValueChange={(value) =>
                onChangeSet(
                  exerciseId,
                  set.id,
                  "painRegion",
                  value === "none" ? "" : (value as PainRegionId)
                )
              }
            >
              <SelectTrigger className="h-12 w-full">
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
          </SetField>
        </div>
      ) : null}
    </div>
  )
}

function SetField({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-[11px] font-semibold uppercase text-muted-foreground">
      <span>{label}</span>
      {children}
    </label>
  )
}

function ExerciseProgress({
  completedExerciseIds,
  progressValue,
  workout,
}: {
  completedExerciseIds: string[]
  progressValue: number
  workout: WorkoutPlan
}) {
  return (
    <Card>
      <CardHeader>
          <CardTitle className="text-base">Exercícios do {workout.name}</CardTitle>
        <CardDescription>
          {getCompletedExerciseCount(workout, completedExerciseIds)}/
          {workout.exercises.length} salvos
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Progress value={progressValue} />
        <div className="flex flex-col gap-2">
          {workout.exercises.map((exercise) => {
            const completed = completedExerciseIds.includes(exercise.id)

            return (
              <div
                className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2 text-sm"
                key={exercise.id}
              >
                <span className="min-w-0 truncate">{exercise.name}</span>
                <Badge variant={completed ? "default" : "outline"}>
                  {completed ? "Salvo" : formatPlannedPrescription(exercise)}
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
