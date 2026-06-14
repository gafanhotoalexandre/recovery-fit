import { painRegionLabels, recoveryRegionLabels } from "../mock-data"
import { normalizeExerciseLogDraft, parseNumericDraft } from "../schemas"
import type {
  MarkdownReportInput,
  PainRegionId,
  RecoveryFitSessionState,
  WeeklyScheduleItem,
  WorkoutExercise,
  WorkoutPlan,
} from "../types"
import { getRecoveryRecommendation } from "./recovery-rules"

const emptyValue = "não preenchido"
const incompleteValue = "não concluído"

function formatBoolean(value: boolean) {
  return value ? "sim" : "não"
}

function formatNumber(value: number | null) {
  return value === null ? emptyValue : String(value)
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

function formatSessionStatus(status: RecoveryFitSessionState["sessionStatus"]) {
  const labels = {
    active: "ativo",
    completed: "concluído",
    idle: "não iniciado",
  } satisfies Record<RecoveryFitSessionState["sessionStatus"], string>

  return labels[status]
}

function formatActivityKind(kind: WeeklyScheduleItem["activityKind"]) {
  const labels = {
    rest: "descanso",
    swim: "natação",
    workout: "treino de academia",
  } satisfies Record<WeeklyScheduleItem["activityKind"], string>

  return labels[kind]
}

function formatPlannedPrescription(exercise: WorkoutExercise) {
  return `${exercise.plannedSetsLabel ?? exercise.plannedSets}×${exercise.repRange}`
}

function getCompletedExerciseCount(
  workout: WorkoutPlan,
  session: RecoveryFitSessionState
) {
  const exerciseIds = new Set(workout.exercises.map((exercise) => exercise.id))

  return session.completedExerciseIds.filter((id) => exerciseIds.has(id)).length
}

function getExercisePainValues(session: RecoveryFitSessionState) {
  return Object.values(session.exerciseLogs).flatMap((log) =>
    log.sets
      .map((set) => parseNumericDraft(set.painDuring))
      .filter((value): value is number => value !== null)
  )
}

function getReportedPainRegions(session: RecoveryFitSessionState) {
  const regions = new Set<PainRegionId>()

  for (const log of Object.values(session.exerciseLogs)) {
    for (const set of log.sets) {
      const pain = parseNumericDraft(set.painDuring)

      if (pain !== null && pain > 0 && set.painRegion !== "") {
        regions.add(set.painRegion)
      }
    }
  }

  return Array.from(regions)
}

function getRecoveryPainValues(session: RecoveryFitSessionState) {
  return Object.values(session.recovery.pain)
}

function hasAnySessionData(session: RecoveryFitSessionState) {
  return (
    session.completedExerciseIds.length > 0 ||
    getExercisePainValues(session).length > 0 ||
    getRecoveryPainValues(session).some((value) => value > 0) ||
    session.recovery.notes.trim().length > 0
  )
}

function formatSetLine({
  exerciseName,
  setNumber,
  loadKg,
  reps,
  rir,
  painDuring,
  painRegion,
  trackingUnit,
}: {
  exerciseName: string
  loadKg: number | null
  painDuring: number | null
  painRegion: PainRegionId | null
  reps: number | null
  rir: number | null
  setNumber: number
  trackingUnit: WorkoutExercise["trackingUnit"]
}) {
  const region = painRegion ? painRegionLabels[painRegion] : emptyValue
  const volumeLabel = trackingUnit === "seconds" ? "tempo" : "reps"
  const volumeValue =
    trackingUnit === "seconds" && reps !== null ? `${reps}s` : formatNumber(reps)

  return `- ${exerciseName} | série ${setNumber}: carga ${formatNumber(
    loadKg
  )} kg, ${volumeLabel} ${volumeValue}, RIR ${formatNumber(
    rir
  )}, dor ${formatNumber(painDuring)}, região ${region}`
}

function formatExerciseSection(workout: WorkoutPlan, session: RecoveryFitSessionState) {
  return workout.exercises
    .map((exercise) => {
      const log = session.exerciseLogs[exercise.id]
      const completed = session.completedExerciseIds.includes(exercise.id)
      const normalized = log ? normalizeExerciseLogDraft(log) : null
      const setLines = normalized?.sets.map((set) =>
        formatSetLine({
          exerciseName: exercise.name,
          trackingUnit: exercise.trackingUnit,
          ...set,
        })
      )

      return [
        `### ${exercise.order}. ${exercise.name}`,
        `- Status: ${completed ? "concluído" : incompleteValue}`,
        `- Planejado: ${formatPlannedPrescription(exercise)}, alvo RIR ${exercise.targetRir}`,
        `- Nota: ${normalized?.note || emptyValue}`,
        ...(setLines?.length ? setLines : ["- Séries: não preenchido"]),
      ].join("\n")
    })
    .join("\n\n")
}

export function getReportRecommendation(input: Pick<MarkdownReportInput, "session">) {
  const exercisePainValues = getExercisePainValues(input.session)
  const recoveryPainValues = getRecoveryPainValues(input.session)
  const allPainValues = [...exercisePainValues, ...recoveryPainValues]
  const maxPain = allPainValues.length > 0 ? Math.max(...allPainValues) : null

  return getRecoveryRecommendation({
    hasEnoughData: hasAnySessionData(input.session),
    maxPain,
    worseThanYesterday: input.session.recovery.worseThanYesterday,
  })
}

export function generateMarkdownReport(input: MarkdownReportInput) {
  const { selectedScheduleItem, session, sessionWorkout } = input
  const exercisePainValues = getExercisePainValues(session)
  const maxExercisePain =
    exercisePainValues.length > 0 ? Math.max(...exercisePainValues) : null
  const reportedRegions = getReportedPainRegions(session)
  const recommendation = getReportRecommendation(input)
  const completedExerciseCount = sessionWorkout
    ? getCompletedExerciseCount(sessionWorkout, session)
    : 0
  const exerciseCompletionLabel = sessionWorkout
    ? `${completedExerciseCount}/${sessionWorkout.exercises.length}`
    : "não iniciado"
  const registeredWorkoutName = sessionWorkout?.name ?? "não iniciado"

  return [
    `# Relatório RecoveryFit — ${sessionWorkout?.name ?? selectedScheduleItem.title}`,
    "",
    `Gerado em: ${formatDateTime(input.generatedAt)}`,
    "",
    "## Plano selecionado",
    `- Dia: ${selectedScheduleItem.label}`,
    `- Atividade: ${selectedScheduleItem.title}`,
    `- Tipo: ${formatActivityKind(selectedScheduleItem.activityKind)}`,
    `- Descrição: ${selectedScheduleItem.description}`,
    "",
    "## Sessão registrada",
    `- Treino registrado: ${registeredWorkoutName}`,
    `- Status da sessão: ${formatSessionStatus(session.sessionStatus)}`,
    `- Exercícios concluídos: ${exerciseCompletionLabel}`,
    "",
    "## Resumo",
    `- Treino: ${registeredWorkoutName}`,
    `- Status da sessão: ${formatSessionStatus(session.sessionStatus)}`,
    `- Exercícios concluídos: ${exerciseCompletionLabel}`,
    `- Maior dor durante exercício: ${formatNumber(maxExercisePain)}`,
    `- Regiões relatadas durante exercício: ${
      reportedRegions.length > 0
        ? reportedRegions.map((region) => painRegionLabels[region]).join(", ")
        : emptyValue
    }`,
    "",
    "## Check-in do dia",
    `- Lanche das 17h feito: ${formatBoolean(session.dailyCheckin.snack17hDone)}`,
    `- Tomou chá: ${formatBoolean(session.dailyCheckin.hadTea)}`,
    `- Ultraprocessados: ${formatBoolean(session.dailyCheckin.ateUltraprocessed)}`,
    `- Sintoma gástrico: ${formatBoolean(session.dailyCheckin.gastricSymptoms)}`,
    `- Fome antes do jantar: ${session.dailyCheckin.hungerBeforeDinner}/10`,
    ...(sessionWorkout
      ? [
          "",
          "## Aquecimento",
          ...sessionWorkout.warmupItems.map(
            (item) =>
              `- ${item.label} (${item.prescription}): ${
                session.warmupChecklist[item.id] ? "feito" : incompleteValue
              }`
          ),
          "",
          "## Exercícios e séries",
          formatExerciseSection(sessionWorkout, session),
        ]
      : []),
    "",
    "## Recuperação pós-treino",
    ...Object.entries(session.recovery.pain).map(
      ([region, value]) =>
        `- ${recoveryRegionLabels[region as keyof typeof recoveryRegionLabels]}: ${value}/10`
    ),
    `- Piorou em relação a ontem: ${formatBoolean(
      session.recovery.worseThanYesterday
    )}`,
    `- Notas: ${session.recovery.notes.trim() || emptyValue}`,
    "",
    "## Recomendação",
    `- ${recommendation.title}: ${recommendation.message}`,
  ].join("\n")
}
