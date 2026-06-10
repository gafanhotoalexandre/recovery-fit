import {
  ActivityIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  BrainCircuitIcon,
  CheckCircle2Icon,
  CheckIcon,
  ClipboardIcon,
  DumbbellIcon,
  FileTextIcon,
  HelpCircleIcon,
  HomeIcon,
  PlayCircleIcon,
  PlayIcon,
  ShieldCheckIcon,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import {
  helpTopics,
  initialDailyCheckin,
  initialPainLog,
  initialSessionSets,
  painRegions,
  reportInput,
  workoutSummary,
} from "./mock-data"
import { generateMarkdownReport } from "./lib/export-report"
import {
  getPainSeverity,
  getRecoveryRecommendation,
} from "./lib/recovery-rules"
import type {
  AppTab,
  DailyCheckinState,
  HelpTopic,
  HelpTopicId,
  NumericDraft,
  PainLogState,
  PainRegionId,
  SessionSetDraft,
  Tone,
} from "./types"

type NumericOptions = {
  min: number
  max?: number
  integer?: boolean
}

type CopyState = "idle" | "copied" | "manual"

const tabConfig: Array<{
  id: AppTab
  label: string
  title: string
  icon: typeof HomeIcon
}> = [
  { id: "today", label: "Hoje", title: "Diário de Treino", icon: HomeIcon },
  { id: "session", label: "Treino", title: "Sessão Ativa", icon: PlayCircleIcon },
  { id: "recovery", label: "Recuperação", title: "Carga Tolerada", icon: ActivityIcon },
]

const toneClasses: Record<
  Tone,
  {
    surface: string
    border: string
    text: string
    icon: string
    badge: string
  }
> = {
  neutral: {
    surface: "bg-muted",
    border: "border-border",
    text: "text-foreground",
    icon: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground",
  },
  info: {
    surface: "bg-indigo-50",
    border: "border-indigo-100",
    text: "text-indigo-950",
    icon: "text-indigo-600",
    badge: "bg-indigo-100 text-indigo-800",
  },
  success: {
    surface: "bg-emerald-50",
    border: "border-emerald-100",
    text: "text-emerald-950",
    icon: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-800",
  },
  warning: {
    surface: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-950",
    icon: "text-amber-600",
    badge: "bg-amber-100 text-amber-800",
  },
  danger: {
    surface: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-950",
    icon: "text-rose-600",
    badge: "bg-rose-100 text-rose-800",
  },
}

function normalizeNumericDraft(rawValue: string, options: NumericOptions) {
  if (rawValue === "") {
    return ""
  }

  const normalized = rawValue.replace(",", ".")
  const pattern = options.integer ? /^\d+$/ : /^\d+(\.\d*)?$/

  if (!pattern.test(normalized)) {
    return null
  }

  const parsed = Number(normalized)

  if (!Number.isFinite(parsed)) {
    return null
  }

  const max = options.max ?? Number.POSITIVE_INFINITY
  const clamped = Math.min(Math.max(parsed, options.min), max)
  const nextValue = options.integer ? Math.trunc(clamped) : clamped

  return String(nextValue)
}

function finalizeNumericDraft(rawValue: string, options: NumericOptions) {
  return normalizeNumericDraft(rawValue, options) ?? ""
}

function getMaxPainValue(painLog: PainLogState) {
  return Math.max(...Object.values(painLog.values))
}

function copyWithExecCommand(text: string) {
  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.setAttribute("readonly", "")
  textarea.style.position = "fixed"
  textarea.style.top = "0"
  textarea.style.left = "-9999px"
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()

  try {
    return document.execCommand("copy")
  } finally {
    document.body.removeChild(textarea)
  }
}

async function copyReportToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return true
  }

  return copyWithExecCommand(text)
}

export function RecoveryFitApp() {
  const [activeTab, setActiveTab] = useState<AppTab>("today")
  const [checkin, setCheckin] =
    useState<DailyCheckinState>(initialDailyCheckin)
  const [sets, setSets] = useState<SessionSetDraft[]>(initialSessionSets)
  const [painLog, setPainLog] = useState<PainLogState>(initialPainLog)
  const [exerciseSaved, setExerciseSaved] = useState(false)
  const [warmupDone, setWarmupDone] = useState(false)
  const [helpTopicId, setHelpTopicId] = useState<HelpTopicId | null>(null)
  const [reportOpen, setReportOpen] = useState(false)

  const reportMarkdown = useMemo(() => generateMarkdownReport(reportInput), [])
  const activeTitle =
    tabConfig.find((tab) => tab.id === activeTab)?.title ?? "RecoveryFit"
  const activeRecommendation = useMemo(
    () =>
      getRecoveryRecommendation({
        pain: 2,
        worse24hAfter: false,
        consecutiveAttentionCount: 0,
      }),
    []
  )

  const recoveryRecommendation = useMemo(
    () =>
      getRecoveryRecommendation({
        pain: getMaxPainValue(painLog),
        worse24hAfter: painLog.worse24hAfter,
        consecutiveAttentionCount: painLog.values.rightHallux >= 4 ? 1 : 0,
      }),
    [painLog]
  )

  function updateSetField(
    setId: string,
    field: keyof Omit<SessionSetDraft, "id" | "setNumber">,
    value: NumericDraft
  ) {
    setSets((currentSets) =>
      currentSets.map((set) =>
        set.id === setId
          ? {
              ...set,
              [field]: value,
            }
          : set
      )
    )
  }

  function handleSetNumberChange(
    setId: string,
    field: keyof Omit<SessionSetDraft, "id" | "setNumber">,
    value: string,
    options: NumericOptions
  ) {
    const nextValue = normalizeNumericDraft(value, options)

    if (nextValue !== null) {
      updateSetField(setId, field, nextValue)
    }
  }

  function handleSetNumberBlur(
    setId: string,
    field: keyof Omit<SessionSetDraft, "id" | "setNumber">,
    value: string,
    options: NumericOptions
  ) {
    updateSetField(setId, field, finalizeNumericDraft(value, options))
  }

  function handleFinishDiary() {
    toast.info("Salvando histórico local...")
    setActiveTab("today")
    setExerciseSaved(false)
    setWarmupDone(false)
    toast.success("Concluído! Próxima sessão ajustada no mock.")
  }

  const helpTopic = helpTopicId ? helpTopics[helpTopicId] : null

  return (
    <div className="min-h-svh overflow-x-clip bg-stone-100 text-foreground">
      <div className="mx-auto flex min-h-svh w-[min(100vw,28rem)] min-w-0 max-w-md flex-col overflow-hidden bg-stone-50 shadow-2xl ring-1 ring-border">
        <AppHeader
          title={activeTitle}
          onOpenExport={() => setReportOpen(true)}
        />
        <main className="min-w-0 flex-1 overflow-y-auto px-5 pb-24 pt-5">
          {activeTab === "today" ? (
            <TodayView
              checkin={checkin}
              recommendation={activeRecommendation}
              onChangeCheckin={setCheckin}
              onOpenHelp={setHelpTopicId}
              onStartSession={() => setActiveTab("session")}
            />
          ) : null}
          {activeTab === "session" ? (
            <SessionView
              exerciseSaved={exerciseSaved}
              sets={sets}
              warmupDone={warmupDone}
              onChangeNumber={handleSetNumberChange}
              onBlurNumber={handleSetNumberBlur}
              onFinishSession={() => setActiveTab("recovery")}
              onOpenHelp={setHelpTopicId}
              onSaveExercise={() => {
                setExerciseSaved(true)
                toast.success("Séries salvas no diário local.")
              }}
              onToggleWarmup={() => {
                setWarmupDone(true)
                toast.success("Aquecimento registrado.")
              }}
            />
          ) : null}
          {activeTab === "recovery" ? (
            <RecoveryView
              painLog={painLog}
              recommendation={recoveryRecommendation}
              onChangePainLog={setPainLog}
              onFinishDiary={handleFinishDiary}
              onOpenHelp={setHelpTopicId}
            />
          ) : null}
        </main>
        <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>

      <HelpDrawer
        topic={helpTopic}
        open={helpTopic !== null}
        onOpenChange={(open) => {
          if (!open) {
            setHelpTopicId(null)
          }
        }}
      />
      <ReportDrawer
        markdown={reportMarkdown}
        open={reportOpen}
        onOpenChange={setReportOpen}
      />
    </div>
  )
}

function AppHeader({
  title,
  onOpenExport,
}: {
  title: string
  onOpenExport: () => void
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-card px-5 pb-4 pt-10">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="text-sm font-medium text-muted-foreground">
          Progressão segura
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Exportar relatório"
              size="icon"
              variant="outline"
              onClick={onOpenExport}
            >
              <FileTextIcon data-icon="inline-start" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Exportar relatório</TooltipContent>
        </Tooltip>
        <div className="grid size-10 place-items-center rounded-full bg-muted text-sm font-semibold">
          AM
        </div>
      </div>
    </header>
  )
}

function TodayView({
  checkin,
  recommendation,
  onChangeCheckin,
  onOpenHelp,
  onStartSession,
}: {
  checkin: DailyCheckinState
  recommendation: ReturnType<typeof getRecoveryRecommendation>
  onChangeCheckin: (checkin: DailyCheckinState) => void
  onOpenHelp: (topic: HelpTopicId) => void
  onStartSession: () => void
}) {
  const tone = toneClasses[recommendation.tone]

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        className={cn(
          "flex w-full items-start gap-3 rounded-xl border p-4 text-left",
          tone.surface,
          tone.border
        )}
        onClick={() => onOpenHelp("activeRule")}
      >
        <BrainCircuitIcon className={cn("mt-0.5 size-5 shrink-0", tone.icon)} />
        <span className="min-w-0 wrap-break-word">
          <span className={cn("block text-sm font-semibold", tone.text)}>
            Regra ativa: {recommendation.title}
          </span>
          <span className={cn("mt-1 block text-xs leading-relaxed", tone.text)}>
            {recommendation.message}
          </span>
        </span>
      </button>

      <Card>
        <CardHeader>
          <div>
            <Badge variant="secondary" className="mb-2 uppercase">
              {workoutSummary.statusLabel}
            </Badge>
            <CardTitle className="text-lg">{workoutSummary.name}</CardTitle>
            <CardDescription>
              {workoutSummary.focus} - {workoutSummary.exerciseCount} exercícios
            </CardDescription>
          </div>
          <CardAction>
            <DumbbellIcon className="size-6 text-muted-foreground/60" />
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="rounded-lg bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground wrap-break-word">
            Ativo hoje: {workoutSummary.activeExercise.name}.{" "}
            {workoutSummary.activeExercise.safetyNote}
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={onStartSession}>
            <PlayIcon data-icon="inline-start" />
            Iniciar treino
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="size-4 text-muted-foreground" />
            Check-in diário
          </CardTitle>
          <CardDescription>
            Pequenos sinais de alimentação e recuperação de hoje.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <CheckinToggle
              checked={checkin.snack17hDone}
              label="Lanche 17h feito"
              tone="success"
              onChange={(checked) =>
                onChangeCheckin({ ...checkin, snack17hDone: checked })
              }
            />
            <CheckinToggle
              checked={checkin.hadTea}
              label="Tomou chás"
              tone="neutral"
              onChange={(checked) =>
                onChangeCheckin({ ...checkin, hadTea: checked })
              }
            />
            <CheckinToggle
              checked={checkin.ateUltraprocessed}
              label="Ultraprocessados"
              tone="danger"
              onChange={(checked) =>
                onChangeCheckin({ ...checkin, ateUltraprocessed: checked })
              }
            />
            <CheckinToggle
              checked={checkin.gastricSymptoms}
              label="Sintoma gástrico"
              tone="warning"
              onChange={(checked) =>
                onChangeCheckin({ ...checkin, gastricSymptoms: checked })
              }
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <label
                className="text-sm font-medium"
                htmlFor="hunger-before-dinner"
              >
                Fome antes do jantar
              </label>
              <Badge variant="outline">{checkin.hungerBeforeDinner}/10</Badge>
            </div>
            <Slider
              id="hunger-before-dinner"
              min={0}
              max={10}
              step={1}
              value={[checkin.hungerBeforeDinner]}
              onValueChange={([value]) =>
                onChangeCheckin({
                  ...checkin,
                  hungerBeforeDinner: value ?? 0,
                })
              }
            />
            <div className="flex justify-between text-[10px] font-semibold uppercase text-muted-foreground">
              <span>Nenhuma</span>
              <span>Muita</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CheckinToggle({
  checked,
  label,
  tone,
  onChange,
}: {
  checked: boolean
  label: string
  tone: Tone
  onChange: (checked: boolean) => void
}) {
  const toneClass = toneClasses[tone]

  return (
    <label
      className={cn(
        "flex min-h-16 cursor-pointer items-start gap-3 rounded-xl border bg-card p-3 text-xs font-medium leading-tight transition-colors",
        checked ? [toneClass.surface, toneClass.border, toneClass.text] : null
      )}
    >
      <Checkbox
        checked={checked}
        className="mt-0.5"
        onCheckedChange={(value) => onChange(value === true)}
      />
      <span>{label}</span>
    </label>
  )
}

function SessionView({
  exerciseSaved,
  sets,
  warmupDone,
  onBlurNumber,
  onChangeNumber,
  onFinishSession,
  onOpenHelp,
  onSaveExercise,
  onToggleWarmup,
}: {
  exerciseSaved: boolean
  sets: SessionSetDraft[]
  warmupDone: boolean
  onBlurNumber: (
    setId: string,
    field: keyof Omit<SessionSetDraft, "id" | "setNumber">,
    value: string,
    options: NumericOptions
  ) => void
  onChangeNumber: (
    setId: string,
    field: keyof Omit<SessionSetDraft, "id" | "setNumber">,
    value: string,
    options: NumericOptions
  ) => void
  onFinishSession: () => void
  onOpenHelp: (topic: HelpTopicId) => void
  onSaveExercise: () => void
  onToggleWarmup: () => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <AlertCircleIcon className="mt-0.5 size-5 shrink-0 text-amber-600" />
        <p className="leading-relaxed">
          <strong>Atenção:</strong> hálux direito nível 5 ontem. Se sentir
          irritação na base de apoio, reduza carga ou volume hoje.
        </p>
      </div>

      <Card className="bg-zinc-950 text-white ring-zinc-800">
        <CardHeader>
          <div>
            <CardTitle className="text-white">Aquecimento obrigatório</CardTitle>
            <CardDescription className="text-zinc-400">
              Ombros, escápulas e hálux
            </CardDescription>
          </div>
          <CardAction>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label={
                    warmupDone
                      ? "Aquecimento registrado"
                      : "Registrar aquecimento"
                  }
                  size="icon"
                  variant="outline"
                  className="border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
                  onClick={onToggleWarmup}
                >
                  {warmupDone ? (
                    <CheckIcon data-icon="inline-start" />
                  ) : (
                    <PlayIcon data-icon="inline-start" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Registrar aquecimento</TooltipContent>
            </Tooltip>
          </CardAction>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            className="flex w-full flex-wrap gap-2 text-left"
            onClick={() => onOpenHelp("warmup")}
          >
            {workoutSummary.warmupItems.map((item) => (
              <Badge
                key={item}
                variant="outline"
                className="border-zinc-700 text-zinc-200"
              >
                {item}
              </Badge>
            ))}
          </button>
        </CardContent>
      </Card>

      <Card className={exerciseSaved ? "ring-emerald-300" : undefined}>
        <CardHeader className="border-b">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {exerciseSaved ? "Concluído" : "1 de 6"}
            </p>
            <CardTitle
              className={cn(
                "text-lg",
                exerciseSaved ? "text-emerald-700 line-through" : null
              )}
            >
              {workoutSummary.activeExercise.name}
            </CardTitle>
            <CardDescription>
              {workoutSummary.activeExercise.safetyNote}
            </CardDescription>
          </div>
          <CardAction>
            <Badge variant="secondary">
              Alvo: RIR {workoutSummary.activeExercise.targetRir}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-5">
          <div className="grid grid-cols-[1.75rem_minmax(3.5rem,1fr)_minmax(3rem,0.85fr)_minmax(3rem,0.85fr)_minmax(3.2rem,0.9fr)] items-center gap-1.5 px-1 text-[10px] font-semibold uppercase text-muted-foreground">
            <span>Série</span>
            <span className="text-center">Kg</span>
            <span className="text-center">Reps</span>
            <span className="text-center">RIR</span>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-1 text-rose-500"
              onClick={() => onOpenHelp("painDuringExercise")}
            >
              Dor
              <HelpCircleIcon className="size-3" />
            </button>
          </div>
          {sets.map((set) => (
            <SessionSetRow
              key={set.id}
              set={set}
              onBlurNumber={onBlurNumber}
              onChangeNumber={onChangeNumber}
            />
          ))}
        </CardContent>
        <CardFooter className="border-t bg-muted/50">
          <Button
            className="w-full"
            disabled={exerciseSaved}
            variant={exerciseSaved ? "outline" : "default"}
            onClick={onSaveExercise}
          >
            {exerciseSaved ? (
              <CheckCircle2Icon data-icon="inline-start" />
            ) : (
              <CheckIcon data-icon="inline-start" />
            )}
            {exerciseSaved ? "Salvo" : "Salvar exercício"}
          </Button>
        </CardFooter>
      </Card>

      <Button
        className="h-12 w-full"
        variant="outline"
        onClick={onFinishSession}
      >
        Encerrar treino e avaliar
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
    </div>
  )
}

function SessionSetRow({
  set,
  onBlurNumber,
  onChangeNumber,
}: {
  set: SessionSetDraft
  onBlurNumber: (
    setId: string,
    field: keyof Omit<SessionSetDraft, "id" | "setNumber">,
    value: string,
    options: NumericOptions
  ) => void
  onChangeNumber: (
    setId: string,
    field: keyof Omit<SessionSetDraft, "id" | "setNumber">,
    value: string,
    options: NumericOptions
  ) => void
}) {
  return (
    <div className="grid grid-cols-[1.75rem_minmax(3.5rem,1fr)_minmax(3rem,0.85fr)_minmax(3rem,0.85fr)_minmax(3.2rem,0.9fr)] items-center gap-1.5">
      <div className="grid size-7 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
        {set.setNumber}
      </div>
      <Input
        aria-label={`Carga da serie ${set.setNumber}`}
        className="h-11 px-1 text-center font-semibold"
        inputMode="decimal"
        min={0}
        step={0.5}
        type="number"
        value={set.loadKg}
        onBlur={(event) =>
          onBlurNumber(set.id, "loadKg", event.currentTarget.value, {
            min: 0,
          })
        }
        onChange={(event) =>
          onChangeNumber(set.id, "loadKg", event.currentTarget.value, {
            min: 0,
          })
        }
      />
      <Input
        aria-label={`Repetições da série ${set.setNumber}`}
        className="h-11 px-1 text-center font-semibold"
        inputMode="numeric"
        min={1}
        step={1}
        type="number"
        value={set.reps}
        onBlur={(event) =>
          onBlurNumber(set.id, "reps", event.currentTarget.value, {
            min: 1,
            integer: true,
          })
        }
        onChange={(event) =>
          onChangeNumber(set.id, "reps", event.currentTarget.value, {
            min: 1,
            integer: true,
          })
        }
      />
      <Select
        value={set.rir}
        onValueChange={(value) =>
          onChangeNumber(set.id, "rir", value, {
            min: 0,
            max: 5,
            integer: true,
          })
        }
      >
        <SelectTrigger
          aria-label={`RIR da serie ${set.setNumber}`}
          className="h-11 w-full justify-center px-1 text-center font-semibold"
        >
          <SelectValue placeholder="-" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {[0, 1, 2, 3, 4, 5].map((rir) => (
              <SelectItem key={rir} value={String(rir)}>
                {rir}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Input
        aria-label={`Dor da serie ${set.setNumber}`}
        className="h-11 border-rose-200 bg-rose-50/60 px-1 text-center font-semibold text-rose-700"
        inputMode="numeric"
        max={10}
        min={0}
        step={1}
        type="number"
        value={set.painDuring}
        onBlur={(event) =>
          onBlurNumber(set.id, "painDuring", event.currentTarget.value, {
            min: 0,
            max: 10,
            integer: true,
          })
        }
        onChange={(event) =>
          onChangeNumber(set.id, "painDuring", event.currentTarget.value, {
            min: 0,
            max: 10,
            integer: true,
          })
        }
      />
    </div>
  )
}

function RecoveryView({
  painLog,
  recommendation,
  onChangePainLog,
  onFinishDiary,
  onOpenHelp,
}: {
  painLog: PainLogState
  recommendation: ReturnType<typeof getRecoveryRecommendation>
  onChangePainLog: (painLog: PainLogState) => void
  onFinishDiary: () => void
  onOpenHelp: (topic: HelpTopicId) => void
}) {
  const tone = toneClasses[recommendation.tone]

  function updatePainValue(regionId: PainRegionId, value: number) {
    onChangePainLog({
      ...painLog,
      values: {
        ...painLog.values,
        [regionId]: value,
      },
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        className={cn(
          "flex w-full items-start gap-3 rounded-xl border p-4 text-left",
          tone.surface,
          tone.border
        )}
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

      <Card>
        <CardContent className="flex flex-col gap-3 pt-6">
          <PainBooleanToggle
            checked={painLog.worseThanYesterday}
            label="A dor piorou em relação a ontem?"
            onChange={(checked) =>
              onChangePainLog({
                ...painLog,
                worseThanYesterday: checked,
              })
            }
          />
          <PainBooleanToggle
            checked={painLog.worse24hAfter}
            label="Ficou pior por mais de 24h?"
            onChange={(checked) =>
              onChangePainLog({
                ...painLog,
                worse24hAfter: checked,
              })
            }
          />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {painRegions.map((region) => (
          <PainRegionCard
            key={region.id}
            label={region.label}
            value={painLog.values[region.id]}
            onChange={(value) => updatePainValue(region.id, value)}
          />
        ))}
      </div>

      <Button className="h-12 w-full" onClick={onFinishDiary}>
        Registrar e finalizar
      </Button>
    </div>
  )
}

function PainBooleanToggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-xl border bg-card p-4 text-sm font-medium">
      <span>{label}</span>
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
      />
    </label>
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
          <span
            className={cn(
              "inline-flex h-6 items-center rounded-md px-2 text-[10px] font-semibold uppercase tracking-wide",
              tone.badge
            )}
          >
            {severity.label}
          </span>
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
          <span>Reduzir</span>
        </div>
      </CardContent>
    </Card>
  )
}

function BottomNav({
  activeTab,
  onChangeTab,
}: {
  activeTab: AppTab
  onChangeTab: (tab: AppTab) => void
}) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-[min(100vw,28rem)] -translate-x-1/2 border-t bg-card px-5 py-3">
      <div className="grid grid-cols-3 gap-2">
        {tabConfig.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id

          return (
            <button
              key={tab.id}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-semibold transition-colors",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
              type="button"
              onClick={() => onChangeTab(tab.id)}
            >
              <Icon className="size-5" />
              <span className="max-w-full truncate">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function HelpDrawer({
  topic,
  open,
  onOpenChange,
}: {
  topic: HelpTopic | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto w-full max-w-md">
        <DrawerHeader className="text-left">
          <DrawerTitle>{topic?.title ?? "Ajuda"}</DrawerTitle>
          <DrawerDescription>{topic?.description}</DrawerDescription>
        </DrawerHeader>
        {topic ? (
          <div className="flex max-h-[55vh] flex-col gap-4 overflow-y-auto px-4 pb-2 text-sm leading-relaxed">
            {topic.sections.map((section, index) => (
              <section className="flex flex-col gap-2" key={index}>
                {section.title ? (
                  <h3 className="font-semibold">{section.title}</h3>
                ) : null}
                {section.paragraphs?.map((paragraph) => (
                  <p className="text-muted-foreground" key={paragraph}>
                    {paragraph}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="flex list-disc flex-col gap-1 pl-5 text-muted-foreground">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        ) : null}
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Fechar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function ReportDrawer({
  markdown,
  open,
  onOpenChange,
}: {
  markdown: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [copyState, setCopyState] = useState<CopyState>("idle")

  useEffect(() => {
    if (copyState === "manual") {
      textareaRef.current?.focus()
      textareaRef.current?.select()
    }
  }, [copyState])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setCopyState("idle")
    }

    onOpenChange(nextOpen)
  }

  async function handleCopy() {
    try {
      const copied = await copyReportToClipboard(markdown)

      if (copied) {
        setCopyState("copied")
        toast.success("Markdown copiado.")
        return
      }
    } catch {
      // The visible textarea below is the intentional manual fallback.
    }

    setCopyState("manual")
    toast.warning("Não consegui copiar automaticamente. O texto foi selecionado.")
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="mx-auto w-full max-w-md">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2">
            <FileTextIcon className="size-4" />
            Exportar relatório
          </DrawerTitle>
          <DrawerDescription>
            Markdown gerado localmente para copiar e colar em outra ferramenta.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-3 px-4">
          <div
            className={cn(
              "rounded-xl border p-3 text-xs leading-relaxed",
              copyState === "manual"
                ? "border-amber-200 bg-amber-50 text-amber-950"
                : "border-border bg-muted text-muted-foreground"
            )}
          >
            {copyState === "manual" ? (
              <span>
                Cópia automática indisponível. O texto abaixo está selecionado
                para cópia manual.
              </span>
            ) : (
              <span>
                A copia usa a Clipboard API. Se o navegador bloquear, o texto
                fica selecionável aqui.
              </span>
            )}
          </div>
          <Textarea
            ref={textareaRef}
            aria-label="Relatorio Markdown"
            className="h-72 resize-none font-mono text-xs leading-relaxed"
            readOnly
            value={markdown}
          />
        </div>
        <DrawerFooter>
          <Button onClick={handleCopy}>
            {copyState === "copied" ? (
              <CheckCircle2Icon data-icon="inline-start" />
            ) : (
              <ClipboardIcon data-icon="inline-start" />
            )}
            {copyState === "copied" ? "Copiado" : "Copiar Markdown"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Fechar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
