import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { BlockPalette, PALETTE_DRAG_PREFIX } from "./BlockPalette"
import { CANVAS_DROPPABLE_ID, RequestCanvas } from "./RequestCanvas"
import { OutputPanel } from "./OutputPanel"
import { PresetBar } from "./PresetBar"
import type { DragEndEvent } from "@dnd-kit/core"
import { useCanvas } from "@/lib/store"

export function BuilderLayout() {
  const { state, dispatch } = useCanvas()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over) return
    const activeId = String(active.id)
    const overId = String(over.id)

    if (activeId.startsWith(PALETTE_DRAG_PREFIX)) {
      const blockId = activeId.slice(PALETTE_DRAG_PREFIX.length)
      const isOnCanvas =
        overId === CANVAS_DROPPABLE_ID ||
        state.order[state.provider].includes(overId)
      if (isOnCanvas) {
        dispatch({ type: "ADD_BLOCK", blockId })
      }
      return
    }

    if (activeId !== overId) {
      const order = state.order[state.provider]
      const oldIdx = order.indexOf(activeId)
      const newIdx = order.indexOf(overId)
      if (oldIdx >= 0 && newIdx >= 0) {
        dispatch({ type: "REORDER", order: arrayMove(order, oldIdx, newIdx) })
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <div className="mb-3">
        <PresetBar />
      </div>
      <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_minmax(0,1.2fr)]">
        <aside className="h-[min(420px,70svh)] min-h-72 overflow-hidden rounded-lg border bg-card/40 p-3 lg:h-[calc(100svh-13rem)] lg:min-h-140">
          <BlockPalette />
        </aside>
        <section className="h-[min(480px,72svh)] min-h-80 min-w-0 lg:h-[calc(100svh-13rem)] lg:min-h-140">
          <RequestCanvas />
        </section>
        <section className="h-[min(520px,76svh)] min-h-88 min-w-0 overflow-hidden rounded-lg border bg-card/40 p-3 lg:col-span-2 lg:h-[calc(100svh-13rem)] lg:min-h-140 xl:col-span-1">
          <OutputPanel />
        </section>
      </div>
    </DndContext>
  )
}
