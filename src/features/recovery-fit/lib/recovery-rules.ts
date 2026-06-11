import type { PainSeverity, Tone } from "../types"

export type PainSeverityResult = {
  severity: PainSeverity
  tone: Tone
  label: string
  shortLabel: string
}

export type RecoveryRecommendation = {
  tone: Tone
  title: string
  message: string
}

export function getPainSeverity(value: number): PainSeverityResult {
  if (value <= 3) {
    return {
      label: `${value} - Tolerável`,
      severity: "tolerable",
      shortLabel: "Tolerável",
      tone: "success",
    }
  }

  if (value <= 5) {
    return {
      label: `${value} - Atenção`,
      severity: "attention",
      shortLabel: "Atenção",
      tone: "warning",
    }
  }

  return {
    label: `${value} - Reduzir dose`,
    severity: "reduce",
    shortLabel: "Reduzir dose",
    tone: "danger",
  }
}

export function getRecoveryRecommendation({
  hasEnoughData,
  maxPain,
  worseThanYesterday,
}: {
  hasEnoughData: boolean
  maxPain: number | null
  worseThanYesterday: boolean
}): RecoveryRecommendation {
  if (!hasEnoughData || maxPain === null) {
    return {
      message:
        "Dados incompletos. Mantenha uma dose conservadora e registre dor/check-in antes de progredir.",
      title: "Conservador",
      tone: "warning",
    }
  }

  if (maxPain > 5 || worseThanYesterday) {
    return {
      message:
        "Dor alta ou piora pede reduzir carga/amplitude e evitar progressão no próximo treino.",
      title: "Reduzir dose",
      tone: "danger",
    }
  }

  if (maxPain >= 4) {
    return {
      message:
        "Dor moderada pede manter dose, reduzir amplitude se necessário e observar a resposta.",
      title: "Manter ou ajustar",
      tone: "warning",
    }
  }

  return {
    message:
      "Sessão tolerada. Repita a dose antes de considerar progressão de carga.",
    title: "Manter dose",
    tone: "info",
  }
}
