import { z } from "zod"

import type {
  NormalizedExerciseLog,
  NormalizedWorkoutSet,
  PainRegionId,
  WorkoutExerciseLog,
  WorkoutSetDraft,
} from "./types"

const decimalDraftRegex = /^\d+([.,]\d*)?$/
const integerDraftRegex = /^\d+$/

function numericDraftSchema({
  integer = false,
  max,
  min,
}: {
  integer?: boolean
  max?: number
  min: number
}) {
  return z.string().refine(
    (value) => {
      if (value === "") {
        return true
      }

      const matches = integer
        ? integerDraftRegex.test(value)
        : decimalDraftRegex.test(value)

      if (!matches) {
        return false
      }

      const parsed = Number(value.replace(",", "."))

      if (!Number.isFinite(parsed) || parsed < min) {
        return false
      }

      return max === undefined || parsed <= max
    },
    {
      message: "Valor fora do intervalo permitido.",
    }
  )
}

export const loadKgDraftSchema = numericDraftSchema({ min: 0 })

export const repsDraftSchema = numericDraftSchema({
  integer: true,
  min: 1,
})

export const rirDraftSchema = numericDraftSchema({
  integer: true,
  max: 5,
  min: 0,
})

export const painDraftSchema = numericDraftSchema({
  integer: true,
  max: 10,
  min: 0,
})

export const painRegionSchema = z.enum([
  "ombro_esquerdo",
  "ombro_direito",
  "halux_esquerdo",
  "halux_direito",
  "outra",
])

export const optionalPainRegionDraftSchema = z.union([
  z.literal(""),
  painRegionSchema,
])

export const exerciseNoteDraftSchema = z.string().max(240)

export const recoveryNotesDraftSchema = z.string().max(500)

export const workoutSetDraftSchema = z.object({
  id: z.string(),
  setNumber: z.number().int().positive(),
  loadKg: loadKgDraftSchema,
  reps: repsDraftSchema,
  rir: rirDraftSchema,
  painDuring: painDraftSchema,
  painRegion: optionalPainRegionDraftSchema,
})

export const workoutExerciseLogDraftSchema = z.object({
  exerciseId: z.string(),
  sets: z.array(workoutSetDraftSchema),
  note: exerciseNoteDraftSchema,
})

export const normalizedWorkoutSetSchema = z.object({
  setNumber: z.number().int().positive(),
  loadKg: z.number().min(0).nullable(),
  reps: z.number().int().positive().nullable(),
  rir: z.number().int().min(0).max(5).nullable(),
  painDuring: z.number().int().min(0).max(10).nullable(),
  painRegion: painRegionSchema.nullable(),
})

export const normalizedExerciseLogSchema = z.object({
  exerciseId: z.string(),
  sets: z.array(normalizedWorkoutSetSchema),
  note: exerciseNoteDraftSchema,
})

export function parseNumericDraft(value: string) {
  if (value === "") {
    return null
  }

  const parsed = Number(value.replace(",", "."))

  return Number.isFinite(parsed) ? parsed : null
}

export function normalizeWorkoutSetDraft(
  set: WorkoutSetDraft
): NormalizedWorkoutSet {
  const normalized = {
    setNumber: set.setNumber,
    loadKg: parseNumericDraft(set.loadKg),
    reps: parseNumericDraft(set.reps),
    rir: parseNumericDraft(set.rir),
    painDuring: parseNumericDraft(set.painDuring),
    painRegion: set.painRegion === "" ? null : set.painRegion,
  }

  return normalizedWorkoutSetSchema.parse(normalized)
}

export function normalizeExerciseLogDraft(
  log: WorkoutExerciseLog
): NormalizedExerciseLog {
  const normalized = {
    exerciseId: log.exerciseId,
    note: log.note.trim(),
    sets: log.sets.map(normalizeWorkoutSetDraft),
  }

  return normalizedExerciseLogSchema.parse(normalized)
}

export function validateSetField(
  field: keyof Pick<
    WorkoutSetDraft,
    "loadKg" | "painDuring" | "painRegion" | "reps" | "rir"
  >,
  value: string
) {
  const schemaByField = {
    loadKg: loadKgDraftSchema,
    painDuring: painDraftSchema,
    painRegion: optionalPainRegionDraftSchema,
    reps: repsDraftSchema,
    rir: rirDraftSchema,
  } satisfies Record<typeof field, z.ZodType<string | PainRegionId>>

  return schemaByField[field].safeParse(value).success
}
