import type {
  DailyCheckinState,
  HelpTopic,
  PlannedWorkout,
  RecoveryState,
  WeekdayId,
  WeeklyScheduleItem,
  WarmupItem,
  WorkoutId,
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

export const lowerAWorkout: WorkoutPlan = {
  id: "lower-a-v02",
  name: "Lower A",
  focus: "Pernas sem agredir hálux",
  warmupItems,
  exercises: [
    {
      id: "lower-a-machine-squat-no-plates",
      order: 1,
      name: "Agachamento máquina sem anilhas",
      plannedSets: 3,
      repRange: "8–12",
      targetRir: 3,
      observation: "Controle total, sem pressa, pé inteiro apoiado.",
    },
    {
      id: "lower-a-leg-curl",
      order: 2,
      name: "Mesa flexora",
      plannedSets: 3,
      repRange: "8–12",
      targetRir: 3,
      observation: "Treina posterior sem stiff e sem depender do dedão.",
    },
    {
      id: "lower-a-leg-press",
      order: 3,
      name: "Leg press",
      plannedSets: 2,
      repRange: "10–15",
      targetRir: 3,
      observation:
        "Pés um pouco mais altos na plataforma, evitar dobrar demais o hálux.",
    },
    {
      id: "lower-a-leg-extension",
      order: 4,
      name: "Cadeira extensora",
      plannedSets: 2,
      repRange: "10–15",
      targetRir: 3,
    },
    {
      id: "lower-a-seated-calf-raise",
      order: 5,
      name: "Panturrilha sentado",
      plannedSets: 2,
      repRange: "12–20",
      targetRir: 3,
      observation: "Amplitude confortável; se o hálux reclamar, reduzir amplitude.",
    },
    {
      id: "lower-a-plank",
      order: 6,
      name: "Prancha",
      plannedSets: 3,
      repRange: "30–45s",
      targetRir: 3,
      trackingUnit: "seconds",
    },
  ],
}

export const upperBWorkout: WorkoutPlan = {
  id: "upper-b-v02",
  name: "Upper B",
  focus: "Ombro terapêutico + hipertrofia",
  warmupItems,
  exercises: [
    {
      id: "upper-b-single-arm-dumbbell-row",
      order: 1,
      name: "Remada unilateral com halter",
      plannedSets: 3,
      repRange: "8–12 cada lado",
      targetRir: 3,
      observation: "Prioridade para costas fortes e escápulas estáveis.",
    },
    {
      id: "upper-b-incline-press",
      order: 2,
      name: "Supino inclinado máquina ou halteres",
      plannedSets: 2,
      repRange: "8–12",
      targetRir: 3,
      observation: "Se o ombro estiver sensível, preferir máquina.",
    },
    {
      id: "upper-b-machine-fly",
      order: 3,
      name: "Crucifixo máquina",
      plannedSets: 2,
      repRange: "12–15",
      targetRir: 3,
      observation: "Amplitude curta/média; se doer, remover no futuro.",
    },
    {
      id: "upper-b-front-pulldown",
      order: 4,
      name: "Puxada frontal",
      plannedSets: 2,
      repRange: "8–12",
      targetRir: 3,
    },
    {
      id: "upper-b-partial-lateral-raise",
      order: 5,
      name: "Elevação lateral parcial",
      plannedSets: 2,
      repRange: "12–20",
      targetRir: 3,
      observation: "Só até onde não dói; não passar da linha do ombro.",
    },
    {
      id: "upper-b-external-rotation",
      order: 6,
      name: "Rotação externa no cabo/elástico",
      plannedSets: 2,
      repRange: "15–20",
      targetRir: 3,
      observation: "Exercício terapêutico, manter leve e controlado.",
    },
    {
      id: "upper-b-hammer-curl",
      order: 7,
      name: "Rosca martelo",
      plannedSets: 2,
      repRange: "10–12",
      targetRir: 3,
    },
    {
      id: "upper-b-rope-triceps",
      order: 8,
      name: "Tríceps corda",
      plannedSets: 2,
      repRange: "10–15",
      targetRir: 3,
    },
  ],
}

export const lowerBWorkout: WorkoutPlan = {
  id: "lower-b-v02",
  name: "Lower B",
  focus: "Pernas + estabilidade do pé",
  warmupItems,
  exercises: [
    {
      id: "lower-b-leg-press",
      order: 1,
      name: "Leg press",
      plannedSets: 3,
      repRange: "10–15",
      targetRir: 3,
      observation: "Pés altos/confortáveis.",
    },
    {
      id: "lower-b-leg-extension",
      order: 2,
      name: "Cadeira extensora",
      plannedSets: 3,
      repRange: "10–15",
      targetRir: 3,
    },
    {
      id: "lower-b-leg-curl",
      order: 3,
      name: "Mesa flexora",
      plannedSets: 3,
      repRange: "8–12",
      targetRir: 3,
    },
    {
      id: "lower-b-light-machine-squat",
      order: 4,
      name: "Agachamento máquina leve/moderado",
      plannedSets: 2,
      repRange: "10–12",
      targetRir: 3,
    },
    {
      id: "lower-b-wall-tibialis-raise",
      order: 5,
      name: "Tibial anterior na parede",
      plannedSets: 2,
      repRange: "15–20",
      targetRir: 3,
      observation: "Ajuda equilíbrio do tornozelo/pé.",
    },
    {
      id: "lower-b-side-plank",
      order: 6,
      name: "Prancha lateral",
      plannedSets: 3,
      plannedSetsLabel: "2–3",
      repRange: "30–45s cada lado",
      targetRir: 3,
      trackingUnit: "seconds",
      observation:
        "Opção atual para estabilidade; abdominal máquina pode entrar como alternativa em templates editáveis futuros.",
    },
  ],
}

export const workoutsById: Record<WorkoutId, WorkoutPlan> = {
  "upper-a-v02": upperAWorkout,
  "lower-a-v02": lowerAWorkout,
  "upper-b-v02": upperBWorkout,
  "lower-b-v02": lowerBWorkout,
}

export const plannedWorkouts: Record<WorkoutId, PlannedWorkout> = {
  "upper-a-v02": {
    id: upperAWorkout.id,
    name: upperAWorkout.name,
    focus: upperAWorkout.focus,
    status: "available",
  },
  "lower-a-v02": {
    id: lowerAWorkout.id,
    name: lowerAWorkout.name,
    focus: lowerAWorkout.focus,
    status: "available",
  },
  "upper-b-v02": {
    id: upperBWorkout.id,
    name: upperBWorkout.name,
    focus: upperBWorkout.focus,
    status: "available",
  },
  "lower-b-v02": {
    id: lowerBWorkout.id,
    name: lowerBWorkout.name,
    focus: lowerBWorkout.focus,
    status: "available",
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
    description: plannedWorkouts[lowerAWorkout.id].focus,
    workoutId: lowerAWorkout.id,
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
    description: plannedWorkouts[upperBWorkout.id].focus,
    workoutId: upperBWorkout.id,
  },
  {
    id: "saturday",
    shortLabel: "Sáb",
    label: "Sábado",
    activityKind: "workout",
    title: "Lower B",
    description: plannedWorkouts[lowerBWorkout.id].focus,
    workoutId: lowerBWorkout.id,
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
