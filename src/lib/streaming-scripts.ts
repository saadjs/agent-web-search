import type { CanvasState, Provider } from "./types"

export interface StreamEvent {
  /** ms after the previous event */
  delay: number
  /** the SSE `event:` name */
  event: string
  /** the parsed JSON `data:` payload */
  data: unknown
}

/**
 * Build a canned event stream that matches what the provider's SSE endpoint
 * actually emits. The script is derived from which blocks are on the canvas
 * so the user sees the connection between request shape and event shape.
 */
export function buildStreamScript(
  provider: Provider,
  state: CanvasState
): Array<StreamEvent> {
  return provider === "codex"
    ? buildCodexStream(state)
    : buildClaudeStream(state)
}

// ──────────────────────────────────────────────────────────────────
// Codex / OpenAI Responses
// ──────────────────────────────────────────────────────────────────

function buildCodexStream(state: CanvasState): Array<StreamEvent> {
  const values = state.values.codex
  const order = state.order.codex
  const has = (id: string) => order.includes(id)
  const includeSources = !!values["codex.include_sources"]
  const cacheOnly =
    values["codex.external_web_access"] === false &&
    has("codex.external_web_access")

  // Synthesize a query from input or a default
  const input =
    typeof values["codex.input"] === "string"
      ? values["codex.input"]
      : "What's new in AI this week?"
  const query = input.length > 60 ? input.slice(0, 57) + "..." : input

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
        {
          type: "url",
          url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/server-tools",
          title: "Claude server tools",
        },
      ]
    : undefined

  const events: Array<StreamEvent> = []

  // Initial response created
  events.push({
    delay: 0,
    event: "response.created",
    data: {
      type: "response.created",
      response: { id: "resp_01HSIM…", status: "in_progress" },
    },
  })

  // ── First search ──
  events.push({
    delay: 250,
    event: "response.output_item.added",
    data: {
      type: "response.output_item.added",
      output_index: 0,
      item: { type: "web_search_call", id: "ws_1", status: "in_progress" },
    },
  })
  events.push({
    delay: 900,
    event: "response.output_item.done",
    data: {
      type: "response.output_item.done",
      output_index: 0,
      item: {
        type: "web_search_call",
        id: "ws_1",
        status: "completed",
        action: {
          type: "search",
          query: cacheOnly ? `${query} (cache-only)` : query,
          ...(sources ? { sources } : {}),
        },
      },
    },
  })

  // If "agentic" (high context size), add an open_page + find_in_page step
  const agentic = values["codex.search_context_size"] === "high"
  if (agentic && sources) {
    events.push({
      delay: 400,
      event: "response.output_item.added",
      data: {
        type: "response.output_item.added",
        output_index: 1,
        item: { type: "web_search_call", id: "ws_2", status: "in_progress" },
      },
    })
    events.push({
      delay: 850,
      event: "response.output_item.done",
      data: {
        type: "response.output_item.done",
        output_index: 1,
        item: {
          type: "web_search_call",
          id: "ws_2",
          status: "completed",
          action: { type: "open_page", url: sources[0].url },
        },
      },
    })
    events.push({
      delay: 600,
      event: "response.output_item.added",
      data: {
        type: "response.output_item.added",
        output_index: 2,
        item: { type: "web_search_call", id: "ws_3", status: "in_progress" },
      },
    })
    events.push({
      delay: 700,
      event: "response.output_item.done",
      data: {
        type: "response.output_item.done",
        output_index: 2,
        item: {
          type: "web_search_call",
          id: "ws_3",
          status: "completed",
          action: {
            type: "find_in_page",
            url: sources[0].url,
            pattern: "web_search",
          },
        },
      },
    })
  }

  // ── Answer streaming ──
  const answerIndex = agentic && sources ? 3 : 1
  events.push({
    delay: 400,
    event: "response.output_item.added",
    data: {
      type: "response.output_item.added",
      output_index: answerIndex,
      item: { type: "message", id: "msg_1", role: "assistant", content: [] },
    },
  })

  const answerChunks = [
    "OpenAI documents ",
    "Responses web_search ",
    "as a hosted tool ",
    "[1], ",
    "while Anthropic documents ",
    "Claude web_search ",
    "as a server tool ",
    "[2]. ",
  ]
  for (const delta of answerChunks) {
    events.push({
      delay: 90,
      event: "response.output_text.delta",
      data: {
        type: "response.output_text.delta",
        output_index: answerIndex,
        content_index: 0,
        delta,
      },
    })
  }

  events.push({
    delay: 250,
    event: "response.completed",
    data: {
      type: "response.completed",
      response: { id: "resp_01HSIM…", status: "completed" },
    },
  })

  return events
}

// ──────────────────────────────────────────────────────────────────
// Claude / Anthropic Messages
// ──────────────────────────────────────────────────────────────────

function buildClaudeStream(state: CanvasState): Array<StreamEvent> {
  const values = state.values.claude

  const events: Array<StreamEvent> = []

  events.push({
    delay: 0,
    event: "message_start",
    data: {
      type: "message_start",
      message: {
        id: "msg_01ABC…",
        role: "assistant",
        model: values["claude.model"] ?? "claude-opus-4-7",
        content: [],
        stop_reason: null,
      },
    },
  })

  // ── server_tool_use: web_search ──
  events.push({
    delay: 250,
    event: "content_block_start",
    data: {
      type: "content_block_start",
      index: 0,
      content_block: {
        type: "server_tool_use",
        id: "srvtoolu_01",
        name: "web_search",
        input: {},
      },
    },
  })
  const queryDeltas = [`{"query":"`, `web_search`, ` API`, ` docs`, `"}`]
  for (const partial_json of queryDeltas) {
    events.push({
      delay: 70,
      event: "content_block_delta",
      data: {
        type: "content_block_delta",
        index: 0,
        delta: { type: "input_json_delta", partial_json },
      },
    })
  }
  events.push({
    delay: 100,
    event: "content_block_stop",
    data: { type: "content_block_stop", index: 0 },
  })

  // ── web_search_tool_result ──
  events.push({
    delay: 500,
    event: "content_block_start",
    data: {
      type: "content_block_start",
      index: 1,
      content_block: {
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
    },
  })
  events.push({
    delay: 50,
    event: "content_block_stop",
    data: { type: "content_block_stop", index: 1 },
  })

  // ── text block: streamed answer with citations ──
  events.push({
    delay: 400,
    event: "content_block_start",
    data: {
      type: "content_block_start",
      index: 2,
      content_block: { type: "text", text: "" },
    },
  })
  const textChunks = [
    "Anthropic documents ",
    "Claude web_search ",
    "as a server tool, ",
    "while OpenAI documents ",
    "Responses web_search ",
    "as a hosted tool.",
  ]
  for (const delta of textChunks) {
    events.push({
      delay: 90,
      event: "content_block_delta",
      data: {
        type: "content_block_delta",
        index: 2,
        delta: { type: "text_delta", text: delta },
      },
    })
  }
  // citation annotation
  events.push({
    delay: 80,
    event: "content_block_delta",
    data: {
      type: "content_block_delta",
      index: 2,
      delta: {
        type: "citations_delta",
        citation: {
          type: "web_search_result_location",
          url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool",
          title: "Claude web search tool",
          cited_text: "Claude web_search server tool",
        },
      },
    },
  })
  events.push({
    delay: 50,
    event: "content_block_stop",
    data: { type: "content_block_stop", index: 2 },
  })

  events.push({
    delay: 150,
    event: "message_delta",
    data: {
      type: "message_delta",
      delta: { stop_reason: "end_turn" },
      usage: { output_tokens: 64, server_tool_use: { web_search_requests: 1 } },
    },
  })
  events.push({
    delay: 50,
    event: "message_stop",
    data: { type: "message_stop" },
  })

  return events
}
