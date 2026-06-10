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
      severity: "tolerable",
      tone: "success",
      label: `${value} - Tolerável`,
      shortLabel: "Tolerável",
    }
  }

  if (value <= 5) {
    return {
      severity: "attention",
      tone: "warning",
      label: `${value} - Atenção`,
      shortLabel: "Atenção",
    }
  }

  return {
    severity: "reduce",
    tone: "danger",
    label: `${value} - Reduzir carga`,
    shortLabel: "Reduzir",
  }
}

export function getRecoveryRecommendation({
  pain,
  worse24hAfter,
  consecutiveAttentionCount,
}: {
  pain: number
  worse24hAfter: boolean
  consecutiveAttentionCount: number
}): RecoveryRecommendation {
  if (pain >= 6 || worse24hAfter) {
    return {
      tone: "danger",
      title: "Reduzir dose",
      message:
        "Dor alta ou piora por mais de 24h pede reduzir 10-15%, ajustar amplitude ou remover temporariamente o exercício.",
    }
  }

  if (consecutiveAttentionCount >= 2) {
    return {
      tone: "warning",
      title: "Exercício em observação",
      message:
        "Duas ocorrências seguidas de dor relevante indicam manter a carga e observar resposta antes de progredir.",
    }
  }

  if (pain >= 4) {
    return {
      tone: "warning",
      title: "Manter ou ajustar",
      message:
        "Dor moderada pede manter dose, reduzir amplitude se necessário e evitar progressão hoje.",
    }
  }

  return {
    tone: "info",
    title: "Manter dose",
    message:
      "Sessão tolerada. Repita a dose antes de considerar progressão de carga.",
  }
}
