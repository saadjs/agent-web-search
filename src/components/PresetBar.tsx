import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCanvas } from "@/lib/store"
import { presetsFor } from "@/lib/presets"

export function PresetBar() {
  const { state, dispatch } = useCanvas()
  const presets = presetsFor(state.provider)

  return (
    <div className="flex flex-wrap items-center gap-2 pb-1">
      <span className="flex items-center gap-1 text-xs font-medium tracking-wide whitespace-nowrap text-muted-foreground uppercase">
        <Sparkles className="size-3" /> Presets
      </span>
      {presets.map((p) => (
        <Tooltip key={p.id}>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="whitespace-nowrap"
              onClick={() => dispatch({ type: "LOAD_PRESET", preset: p })}
            >
              {p.label}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{p.description}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
