import {
  ActivityIcon,
  CheckCircle2Icon,
  DumbbellIcon,
  FileTextIcon,
  PlayCircleIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
} from "lucide-react"

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

import { plannedWorkouts } from "../mock-data"
import type { SessionStatus, WeeklyScheduleItem, WorkoutPlan } from "../types"

export function PlannedActivityCard({
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

export function ExistingSessionCard({
  completionCount,
  sessionStatus,
  workout,
  onContinueSession,
  onOpenExport,
  onResetSession,
}: {
  completionCount: string
  sessionStatus: SessionStatus
  workout: WorkoutPlan
  onContinueSession: () => void
  onOpenExport: () => void
  onResetSession: () => void
}) {
  const completed = sessionStatus === "completed"

  return (
    <Card className="border-zinc-200 bg-card/90">
      <CardHeader>
        <div>
          <Badge variant="outline" className="mb-2">
            {workout.name}
          </Badge>
          <CardTitle className="text-base">
            Sessão {completed ? "concluída" : "em andamento"}
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
          <>
            <Button onClick={onContinueSession}>
              <PlayCircleIcon data-icon="inline-start" />
              Continuar treino
            </Button>
            <ResetSessionDialog onResetSession={onResetSession} />
          </>
        )}
      </CardFooter>
    </Card>
  )
}

export function SessionConflictCard({
  selectedWorkout,
  sessionCompletionCount,
  sessionStatus,
  sessionWorkout,
  onContinueSession,
  onOpenExport,
  onResetSession,
}: {
  selectedWorkout: WorkoutPlan
  sessionCompletionCount: string
  sessionStatus: SessionStatus
  sessionWorkout: WorkoutPlan
  onContinueSession: () => void
  onOpenExport: () => void
  onResetSession: () => void
}) {
  const completed = sessionStatus === "completed"

  return (
    <Card className="border-amber-200 bg-amber-50/70">
      <CardHeader>
        <div>
          <Badge className="mb-2 bg-amber-100 text-amber-900">
            Sessão existente
          </Badge>
          <CardTitle className="text-lg">{selectedWorkout.name}</CardTitle>
          <CardDescription className="text-amber-950/80">
            Existe uma sessão {completed ? "concluída" : "em andamento"} de{" "}
            {sessionWorkout.name}. Para registrar {selectedWorkout.name}, inicie
            um novo diário explicitamente.
          </CardDescription>
        </div>
        <CardAction>
          <DumbbellIcon className="size-6 text-amber-700/70" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="rounded-lg border border-amber-200 bg-white/70 px-3 py-2 text-xs leading-relaxed text-amber-950 wrap-break-word">
          Sessão real: {sessionWorkout.name} - {sessionCompletionCount} exercícios
          concluídos. O plano selecionado acima não altera esses dados.
        </p>
      </CardContent>
      <CardFooter className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {completed ? (
          <Button onClick={onOpenExport}>
            <FileTextIcon data-icon="inline-start" />
            Exportar relatório
          </Button>
        ) : (
          <Button onClick={onContinueSession}>
            <PlayCircleIcon data-icon="inline-start" />
            Continuar treino
          </Button>
        )}
        <ResetSessionDialog onResetSession={onResetSession} />
      </CardFooter>
    </Card>
  )
}

export function WorkoutTodayCard({
  completionCount,
  sessionStatus,
  workout,
  onStartSession,
}: {
  completionCount: string
  sessionStatus: SessionStatus
  workout: WorkoutPlan
  onStartSession: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <Badge variant="secondary" className="mb-2 uppercase">
            {sessionStatus === "active" ? "Em andamento" : "Aguardando"}
          </Badge>
          <CardTitle className="text-lg">{workout.name}</CardTitle>
          <CardDescription>
            {workout.focus} - {workout.exercises.length} exercícios
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

export function CompletedDayCard({
  completionCount,
  workout,
  onOpenExport,
  onResetSession,
}: {
  completionCount: string
  workout: WorkoutPlan
  onOpenExport: () => void
  onResetSession: () => void
}) {
  return (
    <Card className="border-emerald-200 ring-emerald-200">
      <CardHeader>
        <div>
          <Badge className="mb-2 bg-emerald-100 text-emerald-800">
            Diário concluído
          </Badge>
          <CardTitle className="text-lg">{workout.name} salvo localmente</CardTitle>
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

function ResetSessionDialog({ onResetSession }: { onResetSession: () => void }) {
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
