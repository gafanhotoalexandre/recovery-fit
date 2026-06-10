import type { MarkdownReportInput } from "../types"

function formatPercent(completed: number, planned: number) {
  if (planned <= 0) {
    return "0%"
  }

  return `${Math.round((completed / planned) * 100)}%`
}

function formatList(items: string[]) {
  if (items.length === 0) {
    return "- Nenhum registro relevante."
  }

  return items.map((item) => `- ${item}`).join("\n")
}

export function generateMarkdownReport(input: MarkdownReportInput) {
  const adherence = formatPercent(input.workouts.completed, input.workouts.planned)
  const painAverages = input.painAverages
    .map((item) => `- ${item.region}: ${item.average.toFixed(1)}/10`)
    .join("\n")
  const nutrition = input.nutrition
    .map((item) => `- ${item.label}: ${item.value}`)
    .join("\n")

  return [
    `# ${input.title} - ${input.periodLabel}`,
    "",
    `Gerado em: ${input.generatedAtLabel}`,
    "",
    "## Treinos",
    `- Sessões concluídas: ${input.workouts.completed}`,
    `- Sessões planejadas: ${input.workouts.planned}`,
    `- Aderência: ${adherence}`,
    "",
    "## Dor media",
    painAverages,
    "",
    "## Alertas",
    formatList(input.alerts),
    "",
    "## Exercícios em observação",
    formatList(input.observedExercises),
    "",
    "## Alimentação e recuperação",
    nutrition,
    "",
    "## Notas",
    formatList(input.notes),
  ].join("\n")
}
