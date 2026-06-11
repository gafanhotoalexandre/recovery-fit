export type AppView = "today" | "session" | "recovery"

export type SessionStatus = "idle" | "active" | "completed"

export type Tone = "neutral" | "info" | "success" | "warning" | "danger"

export type PainRegionId =
  | "ombro_esquerdo"
  | "ombro_direito"
  | "halux_esquerdo"
  | "halux_direito"
  | "outra"

export type RecoveryRegionId = Exclude<PainRegionId, "outra">

export type PainSeverity = "tolerable" | "attention" | "reduce"

export type HelpTopicId =
  | "activeRule"
  | "painDuringExercise"
  | "warmup"
  | "recoveryCheckin"
  | "exportReport"

export type NumericDraft = string

export type DailyCheckinState = {
  snack17hDone: boolean
  hadTea: boolean
  ateUltraprocessed: boolean
  gastricSymptoms: boolean
  hungerBeforeDinner: number
}

export type WorkoutSetDraft = {
  id: string
  setNumber: number
  loadKg: NumericDraft
  reps: NumericDraft
  rir: NumericDraft
  painDuring: NumericDraft
  painRegion: PainRegionId | ""
}

export type WorkoutExerciseLog = {
  exerciseId: string
  sets: WorkoutSetDraft[]
  note: string
}

export type RecoveryState = {
  pain: Record<RecoveryRegionId, number>
  worseThanYesterday: boolean
  notes: string
}

export type WarmupItem = {
  id: string
  label: string
  prescription: string
}

export type WorkoutExercise = {
  id: string
  order: number
  name: string
  plannedSets: number
  repRange: string
  targetRir: number
  observation?: string
}

export type WorkoutPlan = {
  id: string
  name: string
  focus: string
  warmupItems: WarmupItem[]
  exercises: WorkoutExercise[]
}

export type RecoveryFitSessionState = {
  activeView: AppView
  sessionStatus: SessionStatus
  workoutId: string
  activeExerciseIndex: number
  warmupChecklist: Record<string, boolean>
  exerciseLogs: Record<string, WorkoutExerciseLog>
  completedExerciseIds: string[]
  dailyCheckin: DailyCheckinState
  recovery: RecoveryState
}

export type HelpTopicSection = {
  title?: string
  paragraphs?: string[]
  bullets?: string[]
}

export type HelpTopic = {
  id: HelpTopicId
  title: string
  description: string
  sections: HelpTopicSection[]
}

export type NormalizedWorkoutSet = {
  setNumber: number
  loadKg: number | null
  reps: number | null
  rir: number | null
  painDuring: number | null
  painRegion: PainRegionId | null
}

export type NormalizedExerciseLog = {
  exerciseId: string
  sets: NormalizedWorkoutSet[]
  note: string
}

export type MarkdownReportInput = {
  workout: WorkoutPlan
  session: RecoveryFitSessionState
  generatedAt: Date
}
