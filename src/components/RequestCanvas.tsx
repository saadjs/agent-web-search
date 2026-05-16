import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { BlockCard } from "./BlockCard"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useCanvas } from "@/lib/store"

export const CANVAS_DROPPABLE_ID = "canvas-drop"

export function RequestCanvas() {
  const { state, dispatch } = useCanvas()
  const order = state.order[state.provider]
  const { setNodeRef, isOver } = useDroppable({ id: CANVAS_DROPPABLE_ID })

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-medium tracking-wide uppercase">
          Request canvas
        </h2>
        {order.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: "RESET" })}
          >
            Clear
          </Button>
        )}
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div
          ref={setNodeRef}
          className={
            "min-h-100 w-0 max-w-full min-w-full rounded-lg border-2 border-dashed p-3 transition-colors " +
            (isOver
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/20")
          }
        >
          {order.length === 0 ? (
            <div className="flex h-90 flex-col items-center justify-center text-center text-sm text-muted-foreground">
              <p className="font-medium">Drop building blocks here</p>
              <p className="mt-1 max-w-xs">
                Drag any block from the palette on the left, or click a preset
                above to load a complete request.
              </p>
            </div>
          ) : (
            <SortableContext
              items={order}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {order.map((id) => (
                  <BlockCard key={id} blockId={id} />
                ))}
              </div>
            </SortableContext>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
