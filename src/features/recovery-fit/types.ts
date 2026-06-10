export type AppTab = "today" | "session" | "recovery"

export type Tone = "neutral" | "info" | "success" | "warning" | "danger"

export type PainRegionId =
  | "leftShoulder"
  | "rightShoulder"
  | "leftHallux"
  | "rightHallux"

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

export type SessionSetDraft = {
  id: string
  setNumber: number
  loadKg: NumericDraft
  reps: NumericDraft
  rir: NumericDraft
  painDuring: NumericDraft
}

export type PainLogState = {
  values: Record<PainRegionId, number>
  worseThanYesterday: boolean
  worse24hAfter: boolean
}

export type PainRegion = {
  id: PainRegionId
  label: string
  shortLabel: string
}

export type WorkoutExercise = {
  id: string
  order: number
  name: string
  targetRir: number
  plannedSets: number
  safetyNote: string
}

export type WorkoutSummary = {
  id: string
  name: string
  statusLabel: string
  focus: string
  exerciseCount: number
  activeExercise: WorkoutExercise
  warmupItems: string[]
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

export type MarkdownReportInput = {
  title: string
  periodLabel: string
  generatedAtLabel: string
  workouts: {
    completed: number
    planned: number
  }
  painAverages: Array<{
    region: string
    average: number
  }>
  alerts: string[]
  observedExercises: string[]
  nutrition: Array<{
    label: string
    value: string
  }>
  notes: string[]
}
