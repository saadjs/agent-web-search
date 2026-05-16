import {
  DomainListControl,
  NumberControl,
  SelectControl,
  SwitchControl,
  TextareaControl,
  UserLocationControl,
  compact,
  ensureTool,
  parseDomains,
} from "./_helpers"
import type { BlockDef, MessagesValue } from "../types"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const webSearchDocs =
  "https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool"
const serverToolsDocs =
  "https://platform.claude.com/docs/en/agents-and-tools/tool-use/server-tools"
const modelDocs =
  "https://platform.claude.com/docs/en/about-claude/models/all-models"

const claudeWebSearchTool = () =>
  ({ type: "web_search_20250305", name: "web_search" }) as Record<
    string,
    unknown
  >

function MessagesControl({
  value,
  setValue,
}: {
  value: unknown
  setValue: (v: unknown) => void
}) {
  const maybeMessages =
    value && typeof value === "object" ? (value as Partial<MessagesValue>) : {}
  const v: MessagesValue = Array.isArray(maybeMessages.turns)
    ? (maybeMessages as MessagesValue)
    : { turns: [{ role: "user", content: "" }] }
  const update = (i: number, content: string) => {
    const turns = v.turns.map((t, idx) => (idx === i ? { ...t, content } : t))
    setValue({ turns })
  }
  const addTurn = () => {
    const nextRole =
      v.turns[v.turns.length - 1]?.role === "user" ? "assistant" : "user"
    setValue({ turns: [...v.turns, { role: nextRole, content: "" }] })
  }
  const removeTurn = (i: number) => {
    setValue({ turns: v.turns.filter((_, idx) => idx !== i) })
  }
  return (
    <div className="space-y-2">
      {v.turns.map((t, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs tracking-wide uppercase">{t.role}</Label>
            {v.turns.length > 1 && (
              <Button size="sm" variant="ghost" onClick={() => removeTurn(i)}>
                remove
              </Button>
            )}
          </div>
          <Textarea
            rows={2}
            value={t.content}
            placeholder={
              t.role === "user"
                ? "What's new in AI this week?"
                : "Assistant's prior reply…"
            }
            onChange={(e) => update(i, e.target.value)}
          />
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={addTurn}>
        + add{" "}
        {v.turns[v.turns.length - 1]?.role === "user" ? "assistant" : "user"}{" "}
        turn
      </Button>
    </div>
  )
}

export const claudeBlocks: Array<BlockDef> = [
  {
    id: "claude.model",
    provider: "claude",
    label: "model",
    group: "required",
    defaultValue: "claude-opus-4-7",
    docsUrl: modelDocs,
    shortDesc: "Which Claude model handles the request.",
    longDesc:
      "Top-level Claude API model id. Anthropic's current model docs list Opus 4.7, Sonnet 4.6, and Haiku 4.5; the web_search examples use claude-opus-4-7.",
    renderControl: ({ value, setValue }) => (
      <SelectControl
        value={value}
        setValue={setValue}
        options={[
          "claude-opus-4-7",
          "claude-sonnet-4-6",
          "claude-haiku-4-5-20251001",
        ]}
      />
    ),
    applyToRequest: (req, value) => {
      if (typeof value === "string" && value) req.model = value
    },
  },
  {
    id: "claude.max_tokens",
    provider: "claude",
    label: "max_tokens",
    group: "required",
    defaultValue: 2048,
    docsUrl: webSearchDocs,
    shortDesc: "Required: hard cap on assistant output tokens.",
    longDesc:
      "Messages API examples include max_tokens on each request. Web search usage is billed in addition to token usage, and search result content is counted as input tokens.",
    renderControl: ({ value, setValue }) => (
      <NumberControl value={value} setValue={setValue} placeholder="2048" />
    ),
    applyToRequest: (req, value) => {
      if (typeof value === "number" && value > 0) req.max_tokens = value
    },
  },
  {
    id: "claude.system",
    provider: "claude",
    label: "system",
    group: "required",
    defaultValue:
      "You are a research assistant. Cite every claim with a source URL.",
    docsUrl: webSearchDocs,
    shortDesc: "System prompt: persona, rules, citation policy.",
    longDesc:
      "Anthropic Messages requests put system instructions in the top-level system field, separate from messages. Use it for citation policy, voice, and output rules.",
    renderControl: ({ value, setValue }) => (
      <TextareaControl
        value={value}
        setValue={setValue}
        placeholder="Persona, rules, citation policy…"
      />
    ),
    applyToRequest: (req, value) => {
      if (typeof value === "string" && value) req.system = value
    },
  },
  {
    id: "claude.messages",
    provider: "claude",
    label: "messages",
    group: "required",
    defaultValue: {
      turns: [{ role: "user", content: "What happened in AI this week?" }],
    },
    docsUrl: serverToolsDocs,
    shortDesc: "Conversation turns. Add more to demo multi-turn context.",
    longDesc:
      "Claude Messages calls send the conversation history in messages. Real server-tool continuations should preserve prior assistant content blocks, including web_search_tool_result data needed for citations; this builder only demos text turns.",
    renderControl: ({ value, setValue }) => (
      <MessagesControl value={value} setValue={setValue} />
    ),
    applyToRequest: (req, value) => {
      const v = value as MessagesValue | undefined
      if (!v || v.turns.length === 0) return
      req.messages = v.turns
        .filter((t) => t.content.trim().length > 0)
        .map((t) => ({ role: t.role, content: t.content }))
    },
  },
  {
    id: "claude.web_search",
    provider: "claude",
    label: "web_search tool",
    group: "tool",
    defaultValue: true,
    docsUrl: webSearchDocs,
    shortDesc: "Adds Anthropic's server-side web_search tool.",
    longDesc:
      "Server tool: Anthropic executes the search internally and returns server_tool_use plus web_search_tool_result content blocks. This builder uses the documented basic version, web_search_20250305; Anthropic also documents web_search_20260209 for dynamic filtering.",
    renderControl: () => (
      <p className="text-xs text-muted-foreground">
        Adds{" "}
        <code>{`{ type: "web_search_20250305", name: "web_search" }`}</code> to{" "}
        <code>tools[]</code>.
      </p>
    ),
    applyToRequest: (req) => {
      ensureTool(req, claudeWebSearchTool)
    },
  },
  {
    id: "claude.max_uses",
    provider: "claude",
    label: "max_uses",
    group: "tool-config",
    requires: ["claude.web_search"],
    defaultValue: 5,
    docsUrl: webSearchDocs,
    shortDesc: "Cap on how many times the model can invoke web_search.",
    longDesc:
      "Limits the number of searches performed by the server tool. If Claude attempts more searches than allowed, the tool result can return a max_uses_exceeded error.",
    renderControl: ({ value, setValue }) => (
      <NumberControl value={value} setValue={setValue} placeholder="5" />
    ),
    applyToRequest: (req, value) => {
      const tool = ensureTool(req, claudeWebSearchTool)
      if (typeof value === "number" && value > 0) tool.max_uses = value
    },
  },
  {
    id: "claude.allowed_domains",
    provider: "claude",
    label: "allowed_domains",
    group: "tool-config",
    requires: ["claude.web_search"],
    conflicts: ["claude.blocked_domains"],
    defaultValue: "arxiv.org, anthropic.com",
    docsUrl: serverToolsDocs,
    shortDesc: "Hard allow-list of domains.",
    longDesc:
      "Domain filters omit the HTTP/HTTPS scheme. For Claude server tools, allowed_domains and blocked_domains are mutually exclusive in the same request; subdomains are included automatically.",
    renderControl: ({ value, setValue }) => (
      <DomainListControl value={value} setValue={setValue} />
    ),
    applyToRequest: (req, value) => {
      const tool = ensureTool(req, claudeWebSearchTool)
      const domains = parseDomains(typeof value === "string" ? value : "")
      if (domains.length > 0) tool.allowed_domains = domains
    },
  },
  {
    id: "claude.blocked_domains",
    provider: "claude",
    label: "blocked_domains",
    group: "tool-config",
    requires: ["claude.web_search"],
    conflicts: ["claude.allowed_domains"],
    defaultValue: "reddit.com, quora.com",
    docsUrl: serverToolsDocs,
    shortDesc: "Hard deny-list of domains.",
    longDesc:
      "Domain filters omit the HTTP/HTTPS scheme. For Claude server tools, blocked_domains and allowed_domains are mutually exclusive in the same request; subdomains are included automatically.",
    renderControl: ({ value, setValue }) => (
      <DomainListControl value={value} setValue={setValue} />
    ),
    applyToRequest: (req, value) => {
      const tool = ensureTool(req, claudeWebSearchTool)
      const domains = parseDomains(typeof value === "string" ? value : "")
      if (domains.length > 0) tool.blocked_domains = domains
    },
  },
  {
    id: "claude.user_location",
    provider: "claude",
    label: "user_location",
    group: "tool-config",
    requires: ["claude.web_search"],
    defaultValue: {
      city: "San Francisco",
      region: "California",
      country: "US",
      timezone: "America/Los_Angeles",
    },
    docsUrl: webSearchDocs,
    shortDesc: "Bias results to a geographic location.",
    longDesc:
      "Localizes web_search results. Anthropic documents user_location with type: 'approximate' plus city, region, country, and timezone fields.",
    renderControl: ({ value, setValue }) => (
      <UserLocationControl value={value} setValue={setValue} />
    ),
    applyToRequest: (req, value) => {
      const tool = ensureTool(req, claudeWebSearchTool)
      const loc = compact((value || {}) as Record<string, unknown>)
      if (Object.keys(loc).length === 0) return
      tool.user_location = { type: "approximate", ...loc }
    },
  },
  {
    id: "claude.stream",
    provider: "claude",
    label: "stream",
    group: "streaming",
    defaultValue: true,
    docsUrl: webSearchDocs,
    shortDesc: "Stream events via SSE.",
    longDesc:
      "With streaming enabled, web search events arrive in the Messages SSE flow, including message_start, content_block_start for server_tool_use and web_search_tool_result, content_block_delta, and content_block_stop.",
    renderControl: ({ value, setValue }) => (
      <SwitchControl value={value} setValue={setValue} />
    ),
    applyToRequest: (req, value) => {
      if (value) req.stream = true
    },
  },
  {
    id: "claude.temperature",
    provider: "claude",
    label: "temperature",
    group: "advanced",
    defaultValue: 1,
    docsUrl: webSearchDocs,
    shortDesc: "Sampling randomness (0–1). Default 1.",
    longDesc:
      "Optional sampling parameter. Lower values reduce randomness; omit the block to rely on the API default.",
    renderControl: ({ value, setValue }) => (
      <NumberControl value={value} setValue={setValue} placeholder="1" />
    ),
    applyToRequest: (req, value) => {
      if (typeof value === "number") req.temperature = value
    },
  },
]
