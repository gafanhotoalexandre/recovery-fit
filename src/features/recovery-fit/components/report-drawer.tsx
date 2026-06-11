import { CheckCircle2Icon, ClipboardIcon, FileTextIcon } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import { generateMarkdownReport } from "../lib/export-report"
import type { MarkdownReportInput } from "../types"

type CopyState = "idle" | "copied" | "manual"

export type ReportDraftInput = Omit<MarkdownReportInput, "generatedAt">

function copyWithExecCommand(text: string) {
  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.setAttribute("readonly", "")
  textarea.style.left = "-9999px"
  textarea.style.position = "fixed"
  textarea.style.top = "0"
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

export function ReportDrawer({
  input,
  open,
  onOpenChange,
}: {
  input: ReportDraftInput
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [copyState, setCopyState] = useState<CopyState>("idle")
  const [copiedMarkdown, setCopiedMarkdown] = useState<string | null>(null)
  const previewMarkdown = useMemo(
    () =>
      open
        ? generateMarkdownReport({ ...input, generatedAt: new Date() })
        : "",
    [input, open]
  )
  const markdown = copiedMarkdown ?? previewMarkdown

  useEffect(() => {
    if (copyState === "manual") {
      textareaRef.current?.focus()
      textareaRef.current?.select()
    }
  }, [copyState])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setCopyState("idle")
      setCopiedMarkdown(null)
    }

    onOpenChange(nextOpen)
  }

  async function handleCopy() {
    const nextMarkdown = generateMarkdownReport({
      ...input,
      generatedAt: new Date(),
    })

    setCopiedMarkdown(nextMarkdown)

    try {
      const copied = await copyReportToClipboard(nextMarkdown)

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
            Markdown gerado localmente com os dados atuais da sessão.
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
                A cópia usa a Clipboard API. Se o navegador bloquear, o texto
                fica selecionável aqui.
              </span>
            )}
          </div>
          <Textarea
            ref={textareaRef}
            aria-label="Relatório Markdown"
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
