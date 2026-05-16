import { useEffect, useMemo } from "react"
import { Play, Square } from "lucide-react"
import { useStreamSimulator } from "./hooks/use-stream-simulator"
import { JsonView } from "./JsonView"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCanvas } from "@/lib/store"
import { buildStreamScript } from "@/lib/streaming-scripts"

export function StreamingPanel() {
  const { state } = useCanvas()
  const provider = state.provider
  const order = state.order[provider]
  const orderKey = order.join("|")
  const streamBlock = provider === "codex" ? "codex.stream" : "claude.stream"
  const streamingEnabled =
    order.includes(streamBlock) && !!state.values[provider][streamBlock]

  const script = useMemo(
    () => buildStreamScript(provider, state),
    [provider, state]
  )
  const { played, isPlaying, play, stop } = useStreamSimulator(script, 1)

  // Auto-play when streaming is enabled and the user switches/loads presets.
  useEffect(() => {
    if (streamingEnabled) play()
    else stop()
  }, [streamingEnabled, provider, orderKey, play, stop])

  if (!streamingEnabled) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        <p>
          Add the <code className="text-foreground">stream</code> block to the
          canvas to see the SSE event stream this request would produce.
        </p>
        <p className="mt-2 text-xs">
          Codex emits OpenAI's <code>response.output_item.added</code> /{" "}
          <code>response.output_text.delta</code> sequence; Claude emits{" "}
          <code>message_start</code> / <code>content_block_start</code> with{" "}
          <code>server_tool_use</code> / <code>web_search_tool_result</code>.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b p-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>
            {played.length}/{script.length} events
          </span>
          {isPlaying && (
            <Badge variant="secondary" className="gap-1">
              <span className="size-1.5 animate-pulse rounded-full bg-current" />
              streaming
            </Badge>
          )}
        </div>
        <div className="ml-auto flex shrink-0 gap-1">
          <Button size="sm" variant="outline" onClick={play}>
            <Play className="size-3" /> Replay
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={stop}
            disabled={!isPlaying}
          >
            <Square className="size-3" /> Stop
          </Button>
        </div>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-2 p-3">
          {played.map((ev) => (
            <div
              key={ev.i}
              className="min-w-0 animate-in space-y-1 rounded-md border bg-card p-2 text-xs duration-300 fade-in slide-in-from-bottom-1"
            >
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="h-auto max-w-full shrink text-left font-mono text-[10px] break-all whitespace-normal"
                >
                  {ev.event}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  +{ev.delay}ms
                </span>
              </div>
              <JsonView data={ev.data} />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
