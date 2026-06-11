import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { initialDailyCheckin, initialRecovery, upperAWorkout } from "./mock-data"
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
  WorkoutExerciseLog,
  WorkoutSetDraft,
} from "./types"

const STORAGE_VERSION = 2
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
  resetSession: () => void
  saveExercise: (exerciseId?: string) => void
  setActiveView: (view: AppView) => void
  startSession: () => void
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

function createExerciseLog(exerciseId: string): WorkoutExerciseLog {
  const exercise = upperAWorkout.exercises.find((item) => item.id === exerciseId)
  const plannedSets = exercise?.plannedSets ?? 1

  return {
    exerciseId,
    note: "",
    sets: Array.from({ length: plannedSets }, (_, index) =>
      createSetDraft(index + 1)
    ),
  }
}

function createExerciseLogs() {
  return Object.fromEntries(
    upperAWorkout.exercises.map((exercise) => [
      exercise.id,
      createExerciseLog(exercise.id),
    ])
  )
}

function createWarmupChecklist() {
  return Object.fromEntries(
    upperAWorkout.warmupItems.map((item) => [item.id, false])
  )
}

function createInitialSessionState(): RecoveryFitSessionState {
  return {
    activeExerciseIndex: 0,
    activeView: "today",
    completedExerciseIds: [],
    dailyCheckin: initialDailyCheckin,
    exerciseLogs: createExerciseLogs(),
    recovery: initialRecovery,
    sessionStatus: "idle",
    warmupChecklist: createWarmupChecklist(),
    workoutId: upperAWorkout.id,
  }
}

function normalizePersistedState(
  persistedState: unknown
): RecoveryFitSessionState {
  if (typeof persistedState !== "object" || persistedState === null) {
    return createInitialSessionState()
  }

  const candidate = persistedState as Partial<RecoveryFitSessionState>
  const initialState = createInitialSessionState()

  return {
    ...initialState,
    ...candidate,
    activeView: initialState.activeView,
    dailyCheckin: {
      ...initialState.dailyCheckin,
      ...candidate.dailyCheckin,
    },
    exerciseLogs: {
      ...initialState.exerciseLogs,
      ...candidate.exerciseLogs,
    },
    recovery: {
      ...initialState.recovery,
      ...candidate.recovery,
      pain: {
        ...initialState.recovery.pain,
        ...candidate.recovery?.pain,
      },
    },
    warmupChecklist: {
      ...initialState.warmupChecklist,
      ...candidate.warmupChecklist,
    },
  }
}

function currentExerciseId(state: RecoveryFitSessionState) {
  return upperAWorkout.exercises[state.activeExerciseIndex]?.id
}

function clampExerciseIndex(index: number) {
  return Math.min(Math.max(index, 0), upperAWorkout.exercises.length - 1)
}

export const useRecoveryFitStore = create<RecoveryFitStore>()(
  persist(
    (set, get) => ({
      ...createInitialSessionState(),

      finishDiary: () =>
        set({
          activeView: "today",
          sessionStatus: "completed",
        }),

      nextExercise: () =>
        set((state) => ({
          activeExerciseIndex: clampExerciseIndex(state.activeExerciseIndex + 1),
        })),

      previousExercise: () =>
        set((state) => ({
          activeExerciseIndex: clampExerciseIndex(state.activeExerciseIndex - 1),
        })),

      resetSession: () => set(createInitialSessionState()),

      saveExercise: (exerciseId) => {
        const state = get()
        const targetExerciseId = exerciseId ?? currentExerciseId(state)

        if (!targetExerciseId) {
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

      setActiveView: (view) => set({ activeView: view }),

      startSession: () =>
        set({
          activeView: "session",
          sessionStatus: "active",
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
          const log = state.exerciseLogs[exerciseId] ?? createExerciseLog(exerciseId)

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
          const log = state.exerciseLogs[exerciseId] ?? createExerciseLog(exerciseId)

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
