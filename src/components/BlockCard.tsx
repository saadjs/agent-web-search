import { AlertTriangle, GripVertical, Info, X } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { BlockDef } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useCanvas } from "@/lib/store"
import { ALL_BLOCKS } from "@/lib/blocks"

export function BlockCard({ blockId }: { blockId: string }) {
  const { state, dispatch } = useCanvas()
  const block: BlockDef | undefined = ALL_BLOCKS[blockId]
  const value = state.values[state.provider][blockId]

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: blockId })

  if (!block) return null

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex max-w-full min-w-0 gap-2 overflow-hidden rounded-lg border bg-card p-3 shadow-sm"
    >
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab pt-1 text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <code className="block max-w-full min-w-0 truncate text-sm font-medium">
            {block.label}
          </code>
          {block.quirk && (
            <Badge variant="destructive" className="gap-1 text-[10px]">
              <AlertTriangle className="size-3" /> caveat
            </Badge>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="flex size-6 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label={`Info about ${block.label}`}
              >
                <Info className="size-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 text-sm">
              <p className="font-medium">{block.label}</p>
              <p className="mt-1 text-muted-foreground">{block.longDesc}</p>
              <a
                href={block.docsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-xs text-primary underline"
              >
                Read the docs
              </a>
            </PopoverContent>
          </Popover>
        </div>
        {block.renderControl({
          value,
          setValue: (v) =>
            dispatch({ type: "UPDATE_VALUE", blockId, value: v }),
        })}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="-mt-1 -mr-1 size-7 shrink-0 text-muted-foreground"
        onClick={() => dispatch({ type: "REMOVE_BLOCK", blockId })}
        aria-label="Remove block"
      >
        <X className="size-4" />
      </Button>
    </div>
  )
}
