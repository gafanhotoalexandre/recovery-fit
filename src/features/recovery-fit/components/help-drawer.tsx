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

import type { HelpTopic } from "../types"

export function HelpDrawer({
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
