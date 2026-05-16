import {
  DomainListControl,
  NumberControl,
  SelectControl,
  SwitchControl,
  TextControl,
  TextareaControl,
  UserLocationControl,
  asArr,
  asObj,
  compact,
  ensureTool,
  parseDomains,
} from "./_helpers"
import type { BlockDef } from "../types"

const webSearchDocs =
  "https://developers.openai.com/api/docs/guides/tools-web-search"
const modelDocs = "https://developers.openai.com/api/docs/models"
const stateDocs =
  "https://developers.openai.com/api/docs/guides/conversation-state"

const codexWebSearchTool = () =>
  ({ type: "web_search" }) as Record<string, unknown>

export const codexBlocks: Array<BlockDef> = [
  {
    id: "codex.model",
    provider: "codex",
    label: "model",
    group: "required",
    defaultValue: "gpt-5.5",
    docsUrl: modelDocs,
    shortDesc: "Which model handles the request.",
    longDesc:
      "Top-level OpenAI model id. Current docs recommend gpt-5.5 as the starting point for complex reasoning and coding; smaller GPT-5.4 variants are lower-latency, lower-cost choices. The selected model decides whether to call web_search when tool_choice is auto.",
    renderControl: ({ value, setValue }) => (
      <SelectControl
        value={value}
        setValue={setValue}
        options={["gpt-5.5", "gpt-5.4", "gpt-5.4-mini"]}
        placeholder="Pick a model"
      />
    ),
    applyToRequest: (req, value) => {
      if (typeof value === "string" && value) req.model = value
    },
  },
  {
    id: "codex.input",
    provider: "codex",
    label: "input",
    group: "required",
    defaultValue: "What happened in AI this week?",
    docsUrl: webSearchDocs,
    shortDesc: "The user's prompt / question.",
    longDesc:
      "Responses API accepts input as a string or structured input items. This builder uses the simple string form shown in the web_search examples.",
    renderControl: ({ value, setValue }) => (
      <TextareaControl
        value={value}
        setValue={setValue}
        placeholder="Ask anything…"
      />
    ),
    applyToRequest: (req, value) => {
      if (typeof value === "string" && value) req.input = value
    },
  },
  {
    id: "codex.web_search",
    provider: "codex",
    label: "web_search tool",
    group: "tool",
    defaultValue: true,
    docsUrl: webSearchDocs,
    shortDesc: "Adds the hosted web_search tool to tools[].",
    longDesc:
      "Hosted Responses API tool. Add { type: 'web_search' } to tools[]; with tool_choice auto, the model may choose whether to search before answering.",
    renderControl: () => (
      <p className="text-xs text-muted-foreground">
        Adds <code>{`{ type: "web_search" }`}</code> to <code>tools[]</code>.
      </p>
    ),
    applyToRequest: (req) => {
      ensureTool(req, codexWebSearchTool)
    },
  },
  {
    id: "codex.filters.allowed_domains",
    provider: "codex",
    label: "filters.allowed_domains",
    group: "tool-config",
    requires: ["codex.web_search"],
    defaultValue: "arxiv.org, anthropic.com, openai.com",
    docsUrl: webSearchDocs,
    shortDesc: "Restrict searches to specific domains (max 100).",
    longDesc:
      "Responses API web_search supports up to 100 allowed_domains in filters. Omit http:// or https://; a domain entry also includes its subdomains.",
    renderControl: ({ value, setValue }) => (
      <DomainListControl value={value} setValue={setValue} />
    ),
    applyToRequest: (req, value) => {
      const tool = ensureTool(req, codexWebSearchTool)
      const domains = parseDomains(typeof value === "string" ? value : "")
      if (domains.length === 0) return
      const filters = asObj(tool.filters)
      filters.allowed_domains = domains
      tool.filters = filters
    },
  },
  {
    id: "codex.filters.blocked_domains",
    provider: "codex",
    label: "filters.blocked_domains",
    group: "tool-config",
    requires: ["codex.web_search"],
    defaultValue: "reddit.com, quora.com",
    docsUrl: webSearchDocs,
    shortDesc: "Exclude searches from specific domains (max 100).",
    longDesc:
      "Responses API web_search supports up to 100 blocked_domains in filters. Omit http:// or https://; a domain entry also applies to its subdomains.",
    renderControl: ({ value, setValue }) => (
      <DomainListControl value={value} setValue={setValue} />
    ),
    applyToRequest: (req, value) => {
      const tool = ensureTool(req, codexWebSearchTool)
      const domains = parseDomains(typeof value === "string" ? value : "")
      if (domains.length === 0) return
      const filters = asObj(tool.filters)
      filters.blocked_domains = domains
      tool.filters = filters
    },
  },
  {
    id: "codex.user_location",
    provider: "codex",
    label: "user_location",
    group: "tool-config",
    requires: ["codex.web_search"],
    defaultValue: {
      country: "US",
      region: "California",
      city: "San Francisco",
      timezone: "America/Los_Angeles",
    },
    docsUrl: webSearchDocs,
    shortDesc: "Bias results to a geographic location.",
    longDesc:
      "Localizes web_search results with an approximate user location. OpenAI's shape includes type: 'approximate' plus country, region, city, and/or timezone fields.",
    renderControl: ({ value, setValue }) => (
      <UserLocationControl value={value} setValue={setValue} />
    ),
    applyToRequest: (req, value) => {
      const tool = ensureTool(req, codexWebSearchTool)
      const loc = compact((value || {}) as Record<string, unknown>)
      if (Object.keys(loc).length === 0) return
      tool.user_location = { type: "approximate", ...loc }
    },
  },
  {
    id: "codex.search_context_size",
    provider: "codex",
    label: "search_context_size",
    group: "tool-config",
    requires: ["codex.web_search"],
    defaultValue: "medium",
    docsUrl: webSearchDocs,
    shortDesc: "How much page content to pull into the model's context.",
    longDesc:
      "Controls the web search context budget: low, medium, or high. Higher settings give the model more retrieved page context and can use more input tokens.",
    renderControl: ({ value, setValue }) => (
      <SelectControl
        value={value}
        setValue={setValue}
        options={["low", "medium", "high"]}
      />
    ),
    applyToRequest: (req, value) => {
      const tool = ensureTool(req, codexWebSearchTool)
      if (typeof value === "string" && value) tool.search_context_size = value
    },
  },
  {
    id: "codex.tool_choice",
    provider: "codex",
    label: "tool_choice",
    group: "tool-config",
    defaultValue: "auto",
    docsUrl: webSearchDocs,
    shortDesc: "Whether the model is required to call a tool.",
    longDesc:
      "With auto, search is optional. Use required when the request must run a tool, or none when configured tools should not be used on this request.",
    renderControl: ({ value, setValue }) => (
      <SelectControl
        value={value}
        setValue={setValue}
        options={["auto", "required", "none"]}
      />
    ),
    applyToRequest: (req, value) => {
      if (typeof value === "string" && value) req.tool_choice = value
    },
  },
  {
    id: "codex.include_sources",
    provider: "codex",
    label: "include sources",
    group: "tool-config",
    requires: ["codex.web_search"],
    defaultValue: true,
    docsUrl: webSearchDocs,
    shortDesc: "Return the full source list, not just inline citations.",
    longDesc:
      "Sets include: ['web_search_call.action.sources']. The response's web_search_call action can then include the complete list of URLs the model consulted, which may be larger than the inline citation list.",
    renderControl: ({ value, setValue }) => (
      <SwitchControl value={value} setValue={setValue} />
    ),
    applyToRequest: (req, value) => {
      if (!value) return
      const include = asArr(req.include) as Array<string>
      if (!include.includes("web_search_call.action.sources"))
        include.push("web_search_call.action.sources")
      req.include = include
    },
  },
  {
    id: "codex.stream",
    provider: "codex",
    label: "stream",
    group: "streaming",
    defaultValue: true,
    docsUrl: webSearchDocs,
    shortDesc: "Stream events via SSE instead of a single JSON response.",
    longDesc:
      "When true, Responses streams typed SSE events such as response.output_item.added, response.output_item.done, response.output_text.delta, and response.completed.",
    renderControl: ({ value, setValue }) => (
      <SwitchControl value={value} setValue={setValue} />
    ),
    applyToRequest: (req, value) => {
      if (value) req.stream = true
    },
  },
  {
    id: "codex.previous_response_id",
    provider: "codex",
    label: "previous_response_id",
    group: "multi-turn",
    defaultValue: "resp_abc123",
    docsUrl: stateDocs,
    shortDesc: "Chain to a previous response for multi-turn context.",
    longDesc:
      "Responses API can manage conversation state by passing previous_response_id from an earlier response, instead of resending the whole history.",
    renderControl: ({ value, setValue }) => (
      <TextControl value={value} setValue={setValue} placeholder="resp_…" />
    ),
    applyToRequest: (req, value) => {
      if (typeof value === "string" && value) req.previous_response_id = value
    },
  },
  {
    id: "codex.store",
    provider: "codex",
    label: "store",
    group: "multi-turn",
    defaultValue: true,
    docsUrl: stateDocs,
    shortDesc: "Persist this response so future turns can chain via its id.",
    longDesc:
      "Controls whether OpenAI stores the response for later retrieval or continuation. Keep storing enabled when a later request will use previous_response_id; set store false in real API calls when you need stateless handling.",
    renderControl: ({ value, setValue }) => (
      <SwitchControl value={value} setValue={setValue} />
    ),
    applyToRequest: (req, value) => {
      if (value) req.store = true
    },
  },
  {
    id: "codex.max_output_tokens",
    provider: "codex",
    label: "max_output_tokens",
    group: "advanced",
    defaultValue: 2048,
    docsUrl: webSearchDocs,
    shortDesc: "Cap on tokens the model can emit (reasoning + answer).",
    longDesc:
      "Optional Responses API output-token cap. Raise it for longer cited answers; lower it when you need tighter output length control.",
    renderControl: ({ value, setValue }) => (
      <NumberControl value={value} setValue={setValue} placeholder="2048" />
    ),
    applyToRequest: (req, value) => {
      if (typeof value === "number" && value > 0) req.max_output_tokens = value
    },
  },
  {
    id: "codex.external_web_access",
    provider: "codex",
    label: "external_web_access",
    group: "tool-config",
    requires: ["codex.web_search"],
    defaultValue: false,
    docsUrl: webSearchDocs,
    shortDesc: "Controls whether web_search can access the live web.",
    longDesc:
      "OpenAI documents external_web_access on the hosted web_search tool. Omit it or set true for live web access; set false for offline/cache-only web search behavior. Legacy web_search_preview ignores this field.",
    renderControl: ({ value, setValue }) => (
      <SwitchControl value={value} setValue={setValue} />
    ),
    applyToRequest: (req, value) => {
      const tool = ensureTool(req, codexWebSearchTool)
      tool.external_web_access = !!value
    },
  },
]
