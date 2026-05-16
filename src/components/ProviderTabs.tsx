import type { Provider } from "@/lib/types"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCanvas } from "@/lib/store"

export function ProviderTabs() {
  const { state, dispatch } = useCanvas()
  return (
    <Tabs
      value={state.provider}
      onValueChange={(v) =>
        dispatch({ type: "SWITCH_PROVIDER", provider: v as Provider })
      }
    >
      <TabsList>
        <TabsTrigger value="codex">
          <span className="font-medium">Codex</span>
          <span className="ml-1 hidden text-xs text-muted-foreground md:inline">
            OpenAI Responses
          </span>
        </TabsTrigger>
        <TabsTrigger value="claude">
          <span className="font-medium">Claude</span>
          <span className="ml-1 hidden text-xs text-muted-foreground md:inline">
            Anthropic Messages
          </span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
