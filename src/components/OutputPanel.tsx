import { useMemo, useState } from "react"
import { CodeView, JsonView } from "./JsonView"
import { StreamingPanel } from "./StreamingPanel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCanvas } from "@/lib/store"
import { buildRequest } from "@/lib/build-request"
import { buildMockResponse } from "@/lib/mock-response"
import { SNIPPET_TARGETS, genSnippet } from "@/lib/snippets"

export function OutputPanel() {
  const { state } = useCanvas()
  const provider = state.provider

  const body = useMemo(
    () => buildRequest(provider, state.order[provider], state.values[provider]),
    [provider, state.order, state.values]
  )

  const mock = useMemo(
    () => buildMockResponse(provider, state),
    [provider, state]
  )

  const [snippetTab, setSnippetTab] = useState<
    "curl" | "fetch" | "ts-sdk" | "python-sdk"
  >("curl")
  const snippet = useMemo(
    () => genSnippet(snippetTab, provider, body),
    [snippetTab, provider, body]
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      <h2 className="mb-2 text-sm font-medium tracking-wide uppercase">
        Output
      </h2>
      <Tabs defaultValue="request" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="w-full flex-wrap justify-start group-data-horizontal/tabs:h-auto">
          <TabsTrigger className="h-7 flex-none" value="request">
            Request
          </TabsTrigger>
          <TabsTrigger className="h-7 flex-none" value="stream">
            Streaming events
          </TabsTrigger>
          <TabsTrigger className="h-7 flex-none" value="response">
            Mock response
          </TabsTrigger>
          <TabsTrigger className="h-7 flex-none" value="snippets">
            Snippets
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="request"
          className="mt-2 min-h-0 flex-1 overflow-auto"
        >
          <div className="mb-2 text-xs text-muted-foreground">
            <span className="font-mono">
              POST{" "}
              {provider === "codex"
                ? "https://api.openai.com/v1/responses"
                : "https://api.anthropic.com/v1/messages"}
            </span>
          </div>
          <JsonView data={body} />
        </TabsContent>

        <TabsContent value="stream" className="mt-2 min-h-0 flex-1">
          <div className="h-full rounded-md border bg-card">
            <StreamingPanel />
          </div>
        </TabsContent>

        <TabsContent
          value="response"
          className="mt-2 min-h-0 flex-1 overflow-auto"
        >
          <p className="mb-2 text-xs text-muted-foreground">
            Hand-crafted mock, not a real API call. Shape mirrors what the
            provider actually returns.
          </p>
          <JsonView data={mock} />
        </TabsContent>

        <TabsContent
          value="snippets"
          className="mt-2 min-h-0 flex-1 overflow-auto"
        >
          <Tabs
            value={snippetTab}
            onValueChange={(v) => setSnippetTab(v as typeof snippetTab)}
          >
            <div>
              <TabsList className="w-full flex-wrap justify-start group-data-horizontal/tabs:h-auto">
                {SNIPPET_TARGETS.map((t) => (
                  <TabsTrigger
                    className="h-7 flex-none"
                    key={t.id}
                    value={t.id}
                  >
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <div className="mt-2">
              <CodeView
                code={snippet}
                language={
                  SNIPPET_TARGETS.find((t) => t.id === snippetTab)?.language
                }
              />
            </div>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}
