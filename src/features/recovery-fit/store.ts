import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import {
  initialDailyCheckin,
  initialRecovery,
  upperAWorkout,
  workoutsById,
} from "./mock-data"
import {
  exerciseNoteDraftSchema,
  recoveryNotesDraftSchema,
  validateSetField,
  workoutExerciseLogDraftSchema,
} from "./schemas"
import type {
  AppView,
  DailyCheckinState,
  RecoveryFitSessionState,
  RecoveryState,
  WorkoutExercise,
  WorkoutExerciseLog,
  WorkoutId,
  WorkoutPlan,
  WorkoutSetDraft,
} from "./types"

const STORAGE_VERSION = 3
const STORAGE_NAME = "recovery-fit-session-v2"

type PersistedRecoveryFitState = Omit<RecoveryFitSessionState, "activeView">

type SetField = keyof Pick<
  WorkoutSetDraft,
  "loadKg" | "painDuring" | "painRegion" | "reps" | "rir"
>

type RecoveryFitActions = {
  finishDiary: () => void
  nextExercise: () => void
  previousExercise: () => void
  resetSession: (nextWorkoutId?: WorkoutId) => void
  saveExercise: (exerciseId?: string) => void
  setActiveView: (view: AppView) => void
  setBaseWorkout: (workoutId: WorkoutId) => void
  startSession: (workoutId: WorkoutId) => void
  toggleWarmupItem: (itemId: string) => void
  updateDailyCheckin: (checkin: Partial<DailyCheckinState>) => void
  updateExerciseNote: (exerciseId: string, note: string) => void
  updateRecovery: (
    recovery: {
      notes?: string
      pain?: Partial<RecoveryState["pain"]>
      worseThanYesterday?: boolean
    }
  ) => void
  updateSet: (
    exerciseId: string,
    setId: string,
    field: SetField,
    value: string
  ) => void
}

export type RecoveryFitStore = RecoveryFitSessionState & RecoveryFitActions

function createSetDraft(setNumber: number): WorkoutSetDraft {
  return {
    id: `set-${setNumber}`,
    loadKg: "",
    painDuring: "",
    painRegion: "",
    reps: "",
    rir: "",
    setNumber,
  }
}

function createExerciseLog(exercise: WorkoutExercise): WorkoutExerciseLog {
  return {
    exerciseId: exercise.id,
    note: "",
    sets: Array.from({ length: exercise.plannedSets }, (_, index) =>
      createSetDraft(index + 1)
    ),
  }
}

function createExerciseLogs(workout: WorkoutPlan) {
  return Object.fromEntries(
    workout.exercises.map((exercise) => [
      exercise.id,
      createExerciseLog(exercise),
    ])
  )
}

function createWarmupChecklist(workout: WorkoutPlan) {
  return Object.fromEntries(workout.warmupItems.map((item) => [item.id, false]))
}

function isWorkoutId(value: unknown): value is WorkoutId {
  return typeof value === "string" && value in workoutsById
}

function getWorkout(workoutId: WorkoutId): WorkoutPlan {
  return workoutsById[workoutId] ?? upperAWorkout
}

function cloneDailyCheckin(): DailyCheckinState {
  return { ...initialDailyCheckin }
}

function cloneRecovery(): RecoveryState {
  return {
    ...initialRecovery,
    pain: { ...initialRecovery.pain },
  }
}

function createInitialSessionState(
  workoutId: WorkoutId = upperAWorkout.id
): RecoveryFitSessionState {
  return {
    activeExerciseIndex: 0,
    activeView: "today",
    completedExerciseIds: [],
    dailyCheckin: cloneDailyCheckin(),
    exerciseLogs: {},
    recovery: cloneRecovery(),
    sessionStatus: "idle",
    warmupChecklist: {},
    workoutId,
  }
}

function createActiveSessionState(workout: WorkoutPlan): RecoveryFitSessionState {
  return {
    ...createInitialSessionState(workout.id),
    activeView: "session",
    exerciseLogs: createExerciseLogs(workout),
    sessionStatus: "active",
    warmupChecklist: createWarmupChecklist(workout),
  }
}

function clampExerciseIndex(index: number, workout: WorkoutPlan) {
  return Math.min(Math.max(index, 0), workout.exercises.length - 1)
}

function currentExerciseId(state: RecoveryFitSessionState) {
  const workout = getWorkout(state.workoutId)

  return workout.exercises[state.activeExerciseIndex]?.id
}

function normalizePersistedExerciseLogs(
  workout: WorkoutPlan,
  candidateLogs: unknown
) {
  const baseLogs = createExerciseLogs(workout)

  if (typeof candidateLogs !== "object" || candidateLogs === null) {
    return baseLogs
  }

  const logs = candidateLogs as Record<string, unknown>

  return Object.fromEntries(
    workout.exercises.map((exercise) => {
      const candidateLog = logs[exercise.id]
      const parsed = workoutExerciseLogDraftSchema.safeParse(candidateLog)

      return [
        exercise.id,
        parsed.success
          ? { ...parsed.data, exerciseId: exercise.id }
          : baseLogs[exercise.id],
      ]
    })
  )
}

function normalizePersistedWarmupChecklist(
  workout: WorkoutPlan,
  candidateChecklist: unknown
) {
  const baseChecklist = createWarmupChecklist(workout)

  if (typeof candidateChecklist !== "object" || candidateChecklist === null) {
    return baseChecklist
  }

  const checklist = candidateChecklist as Record<string, unknown>
  const normalizedChecklist: Record<string, boolean> = {}

  for (const item of workout.warmupItems) {
    const checked = checklist[item.id]

    normalizedChecklist[item.id] =
      typeof checked === "boolean" ? checked : Boolean(baseChecklist[item.id])
  }

  return normalizedChecklist
}

function normalizePersistedState(
  persistedState: unknown
): RecoveryFitSessionState {
  if (typeof persistedState !== "object" || persistedState === null) {
    return createInitialSessionState()
  }

  const candidate = persistedState as Partial<RecoveryFitSessionState>
  const workoutId = isWorkoutId(candidate.workoutId)
    ? candidate.workoutId
    : upperAWorkout.id
  const workout = getWorkout(workoutId)
  const sessionStatus = candidate.sessionStatus ?? "idle"
  const initialState = createInitialSessionState(workout.id)
  const nextDailyCheckin = {
    ...initialState.dailyCheckin,
    ...candidate.dailyCheckin,
  }
  const nextRecovery = {
    ...initialState.recovery,
    ...candidate.recovery,
    pain: {
      ...initialState.recovery.pain,
      ...candidate.recovery?.pain,
    },
  }

  if (sessionStatus === "idle") {
    return {
      ...initialState,
      dailyCheckin: nextDailyCheckin,
      recovery: nextRecovery,
    }
  }

  const exerciseIds = new Set(workout.exercises.map((exercise) => exercise.id))
  const activeExerciseIndex =
    typeof candidate.activeExerciseIndex === "number"
      ? clampExerciseIndex(candidate.activeExerciseIndex, workout)
      : 0

  return {
    ...initialState,
    activeExerciseIndex,
    completedExerciseIds: (candidate.completedExerciseIds ?? []).filter((id) =>
      exerciseIds.has(id)
    ),
    dailyCheckin: nextDailyCheckin,
    exerciseLogs: normalizePersistedExerciseLogs(workout, candidate.exerciseLogs),
    recovery: nextRecovery,
    sessionStatus,
    warmupChecklist: normalizePersistedWarmupChecklist(
      workout,
      candidate.warmupChecklist
    ),
  }
}

export const useRecoveryFitStore = create<RecoveryFitStore>()(
  persist(
    (set, get) => ({
      ...createInitialSessionState(),

      finishDiary: () =>
        set((state) => ({
          activeView: "today",
          sessionStatus:
            state.sessionStatus === "active" ? "completed" : state.sessionStatus,
        })),

      nextExercise: () =>
        set((state) => {
          const workout = getWorkout(state.workoutId)

          return {
            activeExerciseIndex: clampExerciseIndex(
              state.activeExerciseIndex + 1,
              workout
            ),
          }
        }),

      previousExercise: () =>
        set((state) => {
          const workout = getWorkout(state.workoutId)

          return {
            activeExerciseIndex: clampExerciseIndex(
              state.activeExerciseIndex - 1,
              workout
            ),
          }
        }),

      resetSession: (nextWorkoutId) =>
        set(createInitialSessionState(nextWorkoutId ?? upperAWorkout.id)),

      saveExercise: (exerciseId) => {
        const state = get()
        const targetExerciseId = exerciseId ?? currentExerciseId(state)

        if (!targetExerciseId || state.sessionStatus === "idle") {
          return
        }

        const log = state.exerciseLogs[targetExerciseId]

        if (!log || !workoutExerciseLogDraftSchema.safeParse(log).success) {
          return
        }

        set((currentState) => ({
          completedExerciseIds: Array.from(
            new Set([...currentState.completedExerciseIds, targetExerciseId])
          ),
        }))
      },

      setActiveView: (view) =>
        set((state) => ({
          activeView:
            view === "session" && state.sessionStatus === "idle" ? "today" : view,
        })),

      setBaseWorkout: (workoutId) =>
        set((state) =>
          state.sessionStatus === "idle" ? { workoutId } : {}
        ),

      startSession: (workoutId) =>
        set((state) => {
          const workout = getWorkout(workoutId)

          if (state.sessionStatus === "idle") {
            return createActiveSessionState(workout)
          }

          if (state.sessionStatus === "active" && state.workoutId === workoutId) {
            return { activeView: "session" }
          }

          return {}
        }),

      toggleWarmupItem: (itemId) =>
        set((state) => ({
          warmupChecklist: {
            ...state.warmupChecklist,
            [itemId]: !state.warmupChecklist[itemId],
          },
        })),

      updateDailyCheckin: (checkin) =>
        set((state) => ({
          dailyCheckin: {
            ...state.dailyCheckin,
            ...checkin,
          },
        })),

      updateExerciseNote: (exerciseId, note) => {
        const parsed = exerciseNoteDraftSchema.safeParse(note)

        if (!parsed.success) {
          return
        }

        set((state) => {
          const workout = getWorkout(state.workoutId)
          const exercise = workout.exercises.find((item) => item.id === exerciseId)

          if (!exercise || state.sessionStatus === "idle") {
            return {}
          }

          const log = state.exerciseLogs[exerciseId] ?? createExerciseLog(exercise)

          return {
            exerciseLogs: {
              ...state.exerciseLogs,
              [exerciseId]: {
                ...log,
                note: parsed.data,
              },
            },
          }
        })
      },

      updateRecovery: (recovery) =>
        set((state) => {
          const nextNotes =
            recovery.notes === undefined
              ? state.recovery.notes
              : recoveryNotesDraftSchema.safeParse(recovery.notes).success
                ? recovery.notes
                : state.recovery.notes

          return {
            recovery: {
              ...state.recovery,
              ...recovery,
              notes: nextNotes,
              pain: {
                ...state.recovery.pain,
                ...recovery.pain,
              },
            },
          }
        }),

      updateSet: (exerciseId, setId, field, value) => {
        if (!validateSetField(field, value)) {
          return
        }

        set((state) => {
          const workout = getWorkout(state.workoutId)
          const exercise = workout.exercises.find((item) => item.id === exerciseId)

          if (!exercise || state.sessionStatus === "idle") {
            return {}
          }

          const log = state.exerciseLogs[exerciseId] ?? createExerciseLog(exercise)

          return {
            exerciseLogs: {
              ...state.exerciseLogs,
              [exerciseId]: {
                ...log,
                sets: log.sets.map((setDraft) =>
                  setDraft.id === setId
                    ? {
                        ...setDraft,
                        [field]: value,
                      }
                    : setDraft
                ),
              },
            },
          }
        })
      },
    }),
    {
      migrate: (persistedState) => normalizePersistedState(persistedState),
      name: STORAGE_NAME,
      partialize: (state): PersistedRecoveryFitState => ({
        activeExerciseIndex: state.activeExerciseIndex,
        completedExerciseIds: state.completedExerciseIds,
        dailyCheckin: state.dailyCheckin,
        exerciseLogs: state.exerciseLogs,
        recovery: state.recovery,
        sessionStatus: state.sessionStatus,
        warmupChecklist: state.warmupChecklist,
        workoutId: state.workoutId,
      }),
      storage: createJSONStorage(() => localStorage),
      version: STORAGE_VERSION,
    }
  )
)
