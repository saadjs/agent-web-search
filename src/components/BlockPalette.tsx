import { useDraggable } from "@dnd-kit/core"
import { AlertTriangle, GripVertical, Info, Plus } from "lucide-react"
import type { BlockDef, BlockGroup } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useCanvas } from "@/lib/store"
import { BLOCKS_BY_PROVIDER, GROUP_LABELS } from "@/lib/blocks"

export const PALETTE_DRAG_PREFIX = "palette/"

function PaletteItem({
  block,
  disabled,
}: {
  block: BlockDef
  disabled: boolean
}) {
  const { dispatch } = useCanvas()
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: PALETTE_DRAG_PREFIX + block.id,
    data: { blockId: block.id, fromPalette: true },
    disabled,
  })

  return (
    <div
      ref={setNodeRef}
      className={
        "group flex max-w-full min-w-0 items-center gap-1.5 overflow-hidden rounded-md border bg-card px-2 py-2 text-sm transition-colors " +
        (disabled
          ? "opacity-40"
          : "hover:border-primary/40 hover:bg-accent/50") +
        (isDragging ? " opacity-30" : "")
      }
    >
      <button
        {...attributes}
        {...listeners}
        disabled={disabled}
        className="flex size-6 shrink-0 cursor-grab items-center justify-center text-muted-foreground group-hover:text-foreground active:cursor-grabbing"
        aria-label={`Drag ${block.label}`}
      >
        <GripVertical className="size-3.5" />
      </button>
      <code className="block min-w-0 flex-1 truncate text-xs">
        {block.label}
      </code>
      {block.quirk && (
        <Badge variant="destructive" className="shrink-0 gap-0.5 text-[9px]">
          <AlertTriangle className="size-2.5" />
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
        <PopoverContent
          className="w-80 text-sm"
          side="bottom"
          align="end"
          sideOffset={8}
        >
          <p className="font-medium">{block.label}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {block.shortDesc}
          </p>
          <p className="mt-2">{block.longDesc}</p>
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
      <Button
        size="icon"
        variant="ghost"
        className="size-6 shrink-0"
        disabled={disabled}
        onClick={() => dispatch({ type: "ADD_BLOCK", blockId: block.id })}
        aria-label={`Add ${block.label} to canvas`}
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  )
}

export function BlockPalette() {
  const { state } = useCanvas()
  const provider = state.provider
  const onCanvas = new Set(state.order[provider])
  const blocks = BLOCKS_BY_PROVIDER[provider]

  const grouped = new Map<BlockGroup, Array<BlockDef>>()
  for (const b of blocks) {
    const arr = grouped.get(b.group) ?? []
    arr.push(b)
    grouped.set(b.group, arr)
  }

  const ORDER: Array<BlockGroup> = [
    "required",
    "tool",
    "tool-config",
    "streaming",
    "multi-turn",
    "advanced",
    "quirks",
  ]

  return (
    <div className="flex h-full min-h-0 flex-col">
      <h2 className="mb-2 text-sm font-medium tracking-wide uppercase">
        Building blocks
      </h2>
      <ScrollArea className="min-h-0 flex-1">
        <div className="w-0 min-w-full space-y-4">
          {ORDER.map((group) => {
            const items = grouped.get(group)
            if (!items?.length) return null
            return (
              <div key={group}>
                <div className="mb-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                  {GROUP_LABELS[group]}
                </div>
                <div className="space-y-1.5">
                  {items.map((b) => (
                    <PaletteItem
                      key={b.id}
                      block={b}
                      disabled={onCanvas.has(b.id)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
