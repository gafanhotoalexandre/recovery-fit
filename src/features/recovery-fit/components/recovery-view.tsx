import { AlertCircleIcon, ShieldCheckIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import { getReportRecommendation } from "../lib/export-report"
import { getPainSeverity } from "../lib/recovery-rules"
import { recoveryRegionLabels } from "../mock-data"
import type {
  HelpTopicId,
  RecoveryRegionId,
  RecoveryState,
  SessionStatus,
} from "../types"
import type { RecoveryFitStore } from "../store"
import { toneClasses } from "./view-tone"

export function RecoveryView({
  recovery,
  recommendation,
  sessionStatus,
  onChangeRecovery,
  onFinishDiary,
  onOpenHelp,
}: {
  recovery: RecoveryState
  recommendation: ReturnType<typeof getReportRecommendation>
  sessionStatus: SessionStatus
  onChangeRecovery: RecoveryFitStore["updateRecovery"]
  onFinishDiary: () => void
  onOpenHelp: (topic: HelpTopicId) => void
}) {
  const tone = toneClasses[recommendation.tone]
  const hasActiveSession = sessionStatus === "active"
  const finishLabel = hasActiveSession
    ? "Salvar diário"
    : sessionStatus === "completed"
      ? "Atualizar recuperação"
      : "Salvar recuperação"

  return (
    <div className="flex flex-col gap-5">
      <button
        className={cn(
          "flex w-full items-start gap-3 rounded-xl border p-4 text-left",
          tone.surface,
          tone.border
        )}
        type="button"
        onClick={() => onOpenHelp("recoveryCheckin")}
      >
        <ShieldCheckIcon className={cn("mt-0.5 size-5 shrink-0", tone.icon)} />
        <span>
          <span className={cn("block text-sm font-semibold", tone.text)}>
            {recommendation.title}
          </span>
          <span className={cn("mt-1 block text-xs leading-relaxed", tone.text)}>
            {recommendation.message}
          </span>
        </span>
      </button>

      {!hasActiveSession ? (
        <Card className="border-amber-200 bg-amber-50/70">
          <CardHeader>
            <CardTitle className="text-base">
              Recuperação sem treino ativo
            </CardTitle>
            <CardDescription className="text-amber-950/80">
              Salvar aqui registra apenas sinais de recuperação. Isso não inicia
              nem conclui uma sessão de treino.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className="flex flex-col gap-4">
        {Object.entries(recoveryRegionLabels).map(([region, label]) => (
          <PainRegionCard
            key={region}
            label={label}
            value={recovery.pain[region as RecoveryRegionId]}
            onChange={(value) =>
              onChangeRecovery({
                pain: {
                  [region]: value,
                } as Partial<typeof recovery.pain>,
              })
            }
          />
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <label className="flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-xl border bg-card p-4 text-sm font-medium">
            <span>Piorou em relação a ontem?</span>
            <Checkbox
              checked={recovery.worseThanYesterday}
              onCheckedChange={(value) =>
                onChangeRecovery({ worseThanYesterday: value === true })
              }
            />
          </label>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="recovery-notes">
              Notas de recuperação
            </label>
            <Textarea
              id="recovery-notes"
              className="min-h-24 resize-none"
              maxLength={500}
              placeholder="Ex.: hálux sensível, ombro ok, sono ruim..."
              value={recovery.notes}
              onChange={(event) =>
                onChangeRecovery({ notes: event.currentTarget.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Button className="h-12 w-full" onClick={onFinishDiary}>
        {finishLabel}
      </Button>
    </div>
  )
}

function PainRegionCard({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  const severity = getPainSeverity(value)
  const tone = toneClasses[severity.tone]

  return (
    <Card className={cn(value >= 4 ? tone.border : undefined)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {label}
          {value >= 4 ? (
            <AlertCircleIcon className={cn("size-4", tone.icon)} />
          ) : null}
        </CardTitle>
        <CardAction>
          <Badge className={tone.badge}>{severity.label}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Slider
          max={10}
          min={0}
          step={1}
          value={[value]}
          onValueChange={([nextValue]) => onChange(nextValue ?? 0)}
        />
        <div className="flex justify-between text-[10px] font-semibold uppercase text-muted-foreground">
          <span>Zero</span>
          <span>Atenção</span>
          <span>Reduzir dose</span>
        </div>
      </CardContent>
    </Card>
  )
}
