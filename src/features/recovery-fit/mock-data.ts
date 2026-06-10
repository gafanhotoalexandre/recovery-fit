import type {
  DailyCheckinState,
  HelpTopic,
  MarkdownReportInput,
  PainLogState,
  PainRegion,
  SessionSetDraft,
  WorkoutSummary,
} from "./types"

export const workoutSummary: WorkoutSummary = {
  id: "upper-a-safe",
  name: "Upper A",
  statusLabel: "Aguardando",
  focus: "Peito, costas, braços e estabilização",
  exerciseCount: 6,
  activeExercise: {
    id: "low-row-triangle",
    order: 1,
    name: "Remada Baixa Triângulo",
    targetRir: 2,
    plannedSets: 3,
    safetyNote:
      "Movimento puxado e controlado, sem desenvolvimento acima da cabeça.",
  },
  warmupItems: [
    "Ativação de escápulas",
    "Controle de ombros",
    "Mobilidade leve do hálux",
  ],
}

export const initialDailyCheckin: DailyCheckinState = {
  snack17hDone: false,
  hadTea: false,
  ateUltraprocessed: false,
  gastricSymptoms: false,
  hungerBeforeDinner: 5,
}

export const initialSessionSets: SessionSetDraft[] = [
  {
    id: "set-1",
    setNumber: 1,
    loadKg: "45",
    reps: "12",
    rir: "2",
    painDuring: "",
  },
  {
    id: "set-2",
    setNumber: 2,
    loadKg: "",
    reps: "",
    rir: "",
    painDuring: "",
  },
  {
    id: "set-3",
    setNumber: 3,
    loadKg: "",
    reps: "",
    rir: "",
    painDuring: "",
  },
]

export const painRegions: PainRegion[] = [
  {
    id: "leftShoulder",
    label: "Ombro esquerdo",
    shortLabel: "Ombro E",
  },
  {
    id: "rightShoulder",
    label: "Ombro direito",
    shortLabel: "Ombro D",
  },
  {
    id: "leftHallux",
    label: "Hálux esquerdo",
    shortLabel: "Hálux E",
  },
  {
    id: "rightHallux",
    label: "Hálux direito",
    shortLabel: "Hálux D",
  },
]

export const initialPainLog: PainLogState = {
  worseThanYesterday: false,
  worse24hAfter: false,
  values: {
    leftShoulder: 0,
    rightShoulder: 0,
    leftHallux: 0,
    rightHallux: 5,
  },
}

export const helpTopics: Record<HelpTopic["id"], HelpTopic> = {
  activeRule: {
    id: "activeRule",
    title: "Regra ativa",
    description:
      "A regra resume a resposta recente do corpo e transforma isso em uma dose prudente para a próxima sessão.",
    sections: [
      {
        bullets: [
          "Dor até 3/10 sem piora por 24h: manter dose antes de progredir.",
          "Dor 4-5/10: manter carga ou reduzir amplitude.",
          "Dor 6+/10: reduzir 10-15% ou remover temporariamente o exercício.",
        ],
      },
    ],
  },
  painDuringExercise: {
    id: "painDuringExercise",
    title: "Dor durante o exercício",
    description:
      "Use este campo para registrar dor percebida durante a série, sem tentar compensar técnica ou aumentar carga.",
    sections: [
      {
        bullets: [
          "0-3: tolerável, desde que não piore depois.",
          "4-5: sinal de atenção; mantenha ou ajuste.",
          "6-10: interrompa a progressão e reduza dose.",
        ],
      },
    ],
  },
  warmup: {
    id: "warmup",
    title: "Aquecimento obrigatório",
    description:
      "O aquecimento prepara ombros, escápulas e hálux para uma sessão mais previsível.",
    sections: [
      {
        bullets: [
          "Escápulas: controle e depressão leve.",
          "Ombros: ativação sem dor e sem amplitude forçada.",
          "Hálux: mobilidade leve e apoio confortável.",
        ],
      },
    ],
  },
  recoveryCheckin: {
    id: "recoveryCheckin",
    title: "Check-in de recuperação",
    description:
      "A dor no dia seguinte pesa mais do que a dor isolada ao terminar o treino.",
    sections: [
      {
        bullets: [
          "Marque piora em relação a ontem quando o desconforto subir de forma clara.",
          "Marque piora 24h+ quando a resposta ruim persistir ate o dia seguinte.",
          "Esses sinais seguram a progressão mesmo se a sessão parecer boa na hora.",
        ],
      },
    ],
  },
  exportReport: {
    id: "exportReport",
    title: "Exportar Markdown",
    description:
      "O relatório resume treino, dor e recuperação em um formato fácil de colar em outra ferramenta.",
    sections: [
      {
        bullets: [
          "A cópia usa a Clipboard API do navegador.",
          "Se a cópia automática falhar, o texto fica selecionável para cópia manual.",
          "Nenhum dado é enviado para backend nesta POC.",
        ],
      },
    ],
  },
}

export const reportInput: MarkdownReportInput = {
  title: "Relatório RecoveryFit",
  periodLabel: "Últimos 7 dias",
  generatedAtLabel: "10/06/2026",
  workouts: {
    completed: 3,
    planned: 4,
  },
  painAverages: [
    { region: "Ombro esquerdo", average: 2.8 },
    { region: "Ombro direito", average: 2.1 },
    { region: "Hálux esquerdo", average: 3.4 },
    { region: "Hálux direito", average: 2.6 },
  ],
  alerts: [
    "Hálux esquerdo passou de 4/10 em 2 dias.",
    "Dor piorou por mais de 24h após Lower A.",
  ],
  observedExercises: [
    "Leg press: dor no hálux esquerdo relatada em 2 sessões.",
    "Supino inclinado máquina: ombro esquerdo 4/10 em 1 sessão.",
  ],
  nutrition: [
    { label: "Lanche das 17h feito", value: "4/7 dias" },
    { label: "Ultraprocessados", value: "3/7 dias" },
    { label: "Sintomas gástricos", value: "2/7 dias" },
    { label: "Fome média antes do jantar", value: "7/10" },
  ],
  notes: [
    "Manter progressão conservadora até estabilizar resposta do hálux.",
    "Sem integração com IA nesta fase; relatório é apenas copiável.",
  ],
}
