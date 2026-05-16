import type { CanvasState, Provider } from "./types"

export function buildMockResponse(
  provider: Provider,
  state: CanvasState
): Record<string, unknown> {
  return provider === "codex" ? codexMock(state) : claudeMock(state)
}

function codexMock(state: CanvasState): Record<string, unknown> {
  const v = state.values.codex
  const order = state.order.codex
  const has = (id: string) => order.includes(id)
  const includeSources = !!v["codex.include_sources"]
  const query =
    typeof v["codex.input"] === "string"
      ? v["codex.input"]
      : "What's new in AI this week?"

  const sources = includeSources
    ? [
        {
          type: "url",
          url: "https://developers.openai.com/api/docs/guides/tools-web-search",
          title: "OpenAI web search guide",
        },
        {
          type: "url",
          url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool",
          title: "Claude web search tool",
        },
      ]
    : undefined

  const answer =
    "OpenAI documents Responses web_search as a hosted tool with citations [1], while Anthropic documents Claude web_search as a server tool with cited search results [2]."

  return {
    id: "resp_01HSIM…",
    object: "response",
    created_at: 1747345200,
    model: v["codex.model"] ?? "gpt-5.5",
    status: "completed",
    output: [
      {
        type: "web_search_call",
        id: "ws_1",
        status: "completed",
        action: {
          type: "search",
          query: query.length > 80 ? query.slice(0, 77) + "..." : query,
          ...(sources ? { sources } : {}),
        },
      },
      {
        type: "message",
        id: "msg_1",
        role: "assistant",
        content: [
          {
            type: "output_text",
            text: answer,
            annotations: [
              {
                type: "url_citation",
                start_index: answer.indexOf("[1]"),
                end_index: answer.indexOf("[1]") + 3,
                url: "https://developers.openai.com/api/docs/guides/tools-web-search",
                title: "OpenAI web search guide",
              },
              {
                type: "url_citation",
                start_index: answer.indexOf("[2]"),
                end_index: answer.indexOf("[2]") + 3,
                url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool",
                title: "Claude web search tool",
              },
            ],
          },
        ],
      },
    ],
    usage: {
      input_tokens: 24,
      output_tokens: 48,
      total_tokens: 72,
    },
    ...(has("codex.store") && v["codex.store"] ? { store: true } : {}),
  }
}

function claudeMock(state: CanvasState): Record<string, unknown> {
  const v = state.values.claude
  return {
    id: "msg_01ABC…",
    type: "message",
    role: "assistant",
    model: v["claude.model"] ?? "claude-opus-4-7",
    content: [
      {
        type: "server_tool_use",
        id: "srvtoolu_01",
        name: "web_search",
        input: { query: "web_search API docs" },
      },
      {
        type: "web_search_tool_result",
        tool_use_id: "srvtoolu_01",
        content: [
          {
            type: "web_search_result",
            url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool",
            title: "Claude web search tool",
            encrypted_content: "…",
          },
          {
            type: "web_search_result",
            url: "https://developers.openai.com/api/docs/guides/tools-web-search",
            title: "OpenAI web search guide",
            encrypted_content: "…",
          },
        ],
      },
      {
        type: "text",
        text: "Anthropic documents Claude web_search as a server tool, while OpenAI documents Responses web_search as a hosted tool.",
        citations: [
          {
            type: "web_search_result_location",
            url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool",
            title: "Claude web search tool",
            cited_text: "Claude web_search server tool",
          },
        ],
      },
    ],
    stop_reason: "end_turn",
    usage: {
      input_tokens: 412,
      output_tokens: 64,
      server_tool_use: { web_search_requests: 1 },
    },
  }
}
