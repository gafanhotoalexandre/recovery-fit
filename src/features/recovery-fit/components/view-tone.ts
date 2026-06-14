import type { Tone } from "../types"

export const toneClasses: Record<
  Tone,
  {
    badge: string
    border: string
    icon: string
    surface: string
    text: string
  }
> = {
  danger: {
    badge: "bg-rose-100 text-rose-800",
    border: "border-rose-200",
    icon: "text-rose-600",
    surface: "bg-rose-50",
    text: "text-rose-950",
  },
  info: {
    badge: "bg-zinc-100 text-zinc-800",
    border: "border-zinc-200",
    icon: "text-zinc-600",
    surface: "bg-zinc-50",
    text: "text-zinc-950",
  },
  neutral: {
    badge: "bg-muted text-muted-foreground",
    border: "border-border",
    icon: "text-muted-foreground",
    surface: "bg-muted",
    text: "text-foreground",
  },
  success: {
    badge: "bg-emerald-100 text-emerald-800",
    border: "border-emerald-100",
    icon: "text-emerald-600",
    surface: "bg-emerald-50",
    text: "text-emerald-950",
  },
  warning: {
    badge: "bg-amber-100 text-amber-800",
    border: "border-amber-200",
    icon: "text-amber-600",
    surface: "bg-amber-50",
    text: "text-amber-950",
  },
}
