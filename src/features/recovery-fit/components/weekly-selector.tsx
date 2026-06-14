import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { weeklySchedule } from "../mock-data"
import type { WeekdayId } from "../types"

export function WeeklySelector({
  selectedDayId,
  todayDayId,
  onSelectDay,
}: {
  selectedDayId: WeekdayId
  todayDayId: WeekdayId
  onSelectDay: (dayId: WeekdayId) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Agenda semanal</CardTitle>
        <CardDescription>Escolha o dia para ver o plano local.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1.5">
          {weeklySchedule.map((item) => {
            const selected = item.id === selectedDayId
            const isToday = item.id === todayDayId

            return (
              <button
                aria-current={selected ? "date" : undefined}
                className={cn(
                  "flex min-h-14 min-w-0 flex-col items-center justify-center rounded-lg border px-1 text-[11px] font-semibold transition-colors",
                  selected
                    ? "border-zinc-900 bg-zinc-950 text-white"
                    : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                key={item.id}
                type="button"
                onClick={() => onSelectDay(item.id)}
              >
                <span>{item.shortLabel}</span>
                {isToday ? (
                  <span
                    className={cn(
                      "mt-1 rounded-full px-1.5 py-0.5 text-[9px] uppercase",
                      selected
                        ? "bg-white/15 text-white"
                        : "bg-amber-100 text-amber-800"
                    )}
                  >
                    hoje
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
