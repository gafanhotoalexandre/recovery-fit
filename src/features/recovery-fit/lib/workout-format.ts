import { weeklySchedule } from "../mock-data"
import type {
  WeekdayId,
  WorkoutExercise,
  WorkoutExerciseLog,
  WorkoutPlan,
} from "../types"

export function isExerciseIncomplete(log: WorkoutExerciseLog | undefined) {
  if (!log) {
    return true
  }

  return log.sets.some(
    (set) => set.loadKg === "" || set.reps === "" || set.rir === ""
  )
}

export function formatCompletionCount(completed: number, total: number) {
  return `${completed}/${total}`
}

export function getScheduleItem(dayId: WeekdayId) {
  return weeklySchedule.find((item) => item.id === dayId) ?? weeklySchedule[0]
}

export function getCompletedExerciseCount(
  workout: WorkoutPlan,
  completedExerciseIds: string[]
) {
  const exerciseIds = new Set(workout.exercises.map((exercise) => exercise.id))

  return completedExerciseIds.filter((id) => exerciseIds.has(id)).length
}

export function formatPlannedPrescription(exercise: WorkoutExercise) {
  return `${exercise.plannedSetsLabel ?? exercise.plannedSets}×${exercise.repRange}`
}
