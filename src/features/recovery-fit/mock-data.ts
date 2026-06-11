import type {
  DailyCheckinState,
  HelpTopic,
  PlannedWorkout,
  RecoveryState,
  WeekdayId,
  WeeklyScheduleItem,
  WarmupItem,
  WorkoutPlan,
} from "./types"

export const weekdayOrder: WeekdayId[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]

export function getWeekdayId(date = new Date()): WeekdayId {
  const weekday = date.getDay()

  return weekdayOrder[(weekday + 6) % 7] ?? "monday"
}

export const warmupItems: WarmupItem[] = [
  {
    id: "shoulder-pendulum",
    label: "Pêndulo de ombro",
    prescription: "30–45s cada lado",
  },
  {
    id: "band-scapular-retraction",
    label: "Retração escapular com elástico",
    prescription: "2×15",
  },
  {
    id: "band-external-rotation",
    label: "Rotação externa com elástico",
    prescription: "2×15–20",
  },
  {
    id: "hallux-mobility",
    label: "Mobilidade do hálux",
    prescription: "2×15 cada pé",
  },
  {
    id: "short-foot",
    label: "Short foot / arco do pé",
    prescription: "2×10 contrações de 5s",
  },
  {
    id: "slow-calf-raise",
    label: "Elevação de panturrilha bilateral lenta",
    prescription: "1×12 leve",
  },
]

export const upperAWorkout: WorkoutPlan = {
  id: "upper-a-v02",
  name: "Upper A",
  focus: "Peito controlado, costas fortes, braços e estabilização",
  warmupItems,
  exercises: [
    {
      id: "low-row",
      order: 1,
      name: "Remada baixa",
      plannedSets: 3,
      repRange: "8–12",
      targetRir: 3,
      observation:
        "Começa por costas para organizar escápulas antes dos empurrões.",
    },
    {
      id: "machine-incline-press",
      order: 2,
      name: "Supino inclinado máquina",
      plannedSets: 3,
      repRange: "6–10",
      targetRir: 3,
      observation: "Amplitude controlada, sem deixar o cotovelo descer demais.",
    },
    {
      id: "front-pulldown",
      order: 3,
      name: "Puxada frontal neutra ou pronada",
      plannedSets: 2,
      repRange: "8–12",
      targetRir: 3,
      observation: "Puxa até a parte alta do peito sem jogar o ombro à frente.",
    },
    {
      id: "dumbbell-flat-press",
      order: 4,
      name: "Supino reto com halteres",
      plannedSets: 2,
      repRange: "8–12",
      targetRir: 3,
      observation: "Pegada levemente neutra e cotovelos a 30–45º do tronco.",
    },
    {
      id: "face-pull",
      order: 5,
      name: "Face pull",
      plannedSets: 2,
      repRange: "15–20",
      targetRir: 3,
      observation: "Puxa para testa/rosto com escápulas para trás.",
    },
    {
      id: "barbell-curl",
      order: 6,
      name: "Rosca direta",
      plannedSets: 2,
      repRange: "8–12",
      targetRir: 3,
    },
    {
      id: "rope-triceps",
      order: 7,
      name: "Tríceps corda",
      plannedSets: 2,
      repRange: "10–15",
      targetRir: 3,
    },
  ],
}

export const plannedWorkouts: Record<string, PlannedWorkout> = {
  [upperAWorkout.id]: {
    id: upperAWorkout.id,
    name: upperAWorkout.name,
    focus: upperAWorkout.focus,
    status: "available",
  },
  "lower-a-v02": {
    id: "lower-a-v02",
    name: "Lower A",
    focus: "Pernas sem agredir hálux",
    status: "planned",
  },
  "upper-b-v02": {
    id: "upper-b-v02",
    name: "Upper B",
    focus: "Ombro terapêutico + hipertrofia",
    status: "planned",
  },
  "lower-b-v02": {
    id: "lower-b-v02",
    name: "Lower B",
    focus: "Pernas + estabilidade do pé",
    status: "planned",
  },
}

export const weeklySchedule: WeeklyScheduleItem[] = [
  {
    id: "monday",
    shortLabel: "Seg",
    label: "Segunda",
    activityKind: "workout",
    title: "Upper A",
    description: plannedWorkouts[upperAWorkout.id].focus,
    workoutId: upperAWorkout.id,
  },
  {
    id: "tuesday",
    shortLabel: "Ter",
    label: "Terça",
    activityKind: "swim",
    title: "Natação",
    description:
      "Hoje é dia de natação. Se quiser registrar treino de academia, selecione outro dia da semana.",
  },
  {
    id: "wednesday",
    shortLabel: "Qua",
    label: "Quarta",
    activityKind: "workout",
    title: "Lower A",
    description: plannedWorkouts["lower-a-v02"].focus,
    workoutId: "lower-a-v02",
  },
  {
    id: "thursday",
    shortLabel: "Qui",
    label: "Quinta",
    activityKind: "swim",
    title: "Natação",
    description:
      "Hoje é dia de natação. Se quiser registrar treino de academia, selecione outro dia da semana.",
  },
  {
    id: "friday",
    shortLabel: "Sex",
    label: "Sexta",
    activityKind: "workout",
    title: "Upper B",
    description: plannedWorkouts["upper-b-v02"].focus,
    workoutId: "upper-b-v02",
  },
  {
    id: "saturday",
    shortLabel: "Sáb",
    label: "Sábado",
    activityKind: "workout",
    title: "Lower B",
    description: plannedWorkouts["lower-b-v02"].focus,
    workoutId: "lower-b-v02",
  },
  {
    id: "sunday",
    shortLabel: "Dom",
    label: "Domingo",
    activityKind: "rest",
    title: "Descanso",
    description: "Dia de reduzir dose, observar sinais e recuperar ombros e pés.",
  },
]

export const initialDailyCheckin: DailyCheckinState = {
  snack17hDone: false,
  hadTea: false,
  ateUltraprocessed: false,
  gastricSymptoms: false,
  hungerBeforeDinner: 5,
}

export const initialRecovery: RecoveryState = {
  worseThanYesterday: false,
  notes: "",
  pain: {
    ombro_esquerdo: 0,
    ombro_direito: 0,
    halux_esquerdo: 0,
    halux_direito: 0,
  },
}

export const painRegionLabels = {
  ombro_esquerdo: "Ombro esquerdo",
  ombro_direito: "Ombro direito",
  halux_esquerdo: "Hálux esquerdo",
  halux_direito: "Hálux direito",
  outra: "Outra região",
} as const

export const recoveryRegionLabels = {
  ombro_esquerdo: "Ombro esquerdo",
  ombro_direito: "Ombro direito",
  halux_esquerdo: "Hálux esquerdo",
  halux_direito: "Hálux direito",
} as const

export const helpTopics: Record<HelpTopic["id"], HelpTopic> = {
  activeRule: {
    id: "activeRule",
    title: "Dose de hoje",
    description:
      "A dose resume a resposta recente do corpo e orienta a progressão conservadora.",
    sections: [
      {
        bullets: [
          "Dor até 3/10 durante o exercício: ok.",
          "Dor 4–5/10: reduza carga ou amplitude.",
          "Dor acima de 5/10 ou piora por 24h: o exercício errou a dose.",
        ],
      },
    ],
  },
  painDuringExercise: {
    id: "painDuringExercise",
    title: "Dor durante o exercício",
    description:
      "Registre a maior dor percebida na série, sem tentar compensar técnica ou aumentar carga.",
    sections: [
      {
        bullets: [
          "0–3: tolerável, desde que não piore depois.",
          "4–5: atenção; mantenha ou ajuste.",
          "6–10: reduza dose e evite progressão.",
        ],
      },
    ],
  },
  warmup: {
    id: "warmup",
    title: "Aquecimento obrigatório",
    description:
      "O aquecimento prepara ombros, escápulas e hálux antes da sessão principal.",
    sections: [
      {
        bullets: warmupItems.map((item) => `${item.label} — ${item.prescription}`),
      },
    ],
  },
  recoveryCheckin: {
    id: "recoveryCheckin",
    title: "Recuperação",
    description:
      "A dor pós-treino e a piora em relação a ontem guiam a próxima dose.",
    sections: [
      {
        bullets: [
          "Registre ombros e hálux de 0 a 10.",
          "A piora no dia seguinte pesa mais do que a dor isolada ao terminar.",
          "Notas curtas ajudam a explicar contexto, sono ou irritação incomum.",
        ],
      },
    ],
  },
  exportReport: {
    id: "exportReport",
    title: "Exportar Markdown",
    description:
      "O relatório usa o estado local atual e funciona mesmo com sessão incompleta.",
    sections: [
      {
        bullets: [
          "Campos ausentes aparecem como não preenchido.",
          "A cópia usa Clipboard API e tem fallback selecionável.",
          "Nenhum dado é enviado para backend nesta fase.",
        ],
      },
    ],
  },
}
