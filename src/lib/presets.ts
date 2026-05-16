import type { Preset } from "./types"

export const PRESETS: Array<Preset> = [
  // ───── Codex ─────
  {
    id: "codex.basic",
    provider: "codex",
    label: "Basic search",
    description: "Single-shot web_search with no extras.",
    order: ["codex.model", "codex.input", "codex.web_search"],
    values: {
      "codex.model": "gpt-5.5",
      "codex.input": "Who won the 2026 Australian Open men's singles?",
      "codex.web_search": true,
    },
  },
  {
    id: "codex.domain",
    provider: "codex",
    label: "Domain-restricted",
    description: "Allow-listed sources + return full source list.",
    order: [
      "codex.model",
      "codex.input",
      "codex.web_search",
      "codex.filters.allowed_domains",
      "codex.search_context_size",
      "codex.include_sources",
    ],
    values: {
      "codex.model": "gpt-5.5",
      "codex.input":
        "Summarise the latest transformer scaling-laws findings from research papers.",
      "codex.web_search": true,
      "codex.filters.allowed_domains":
        "arxiv.org, openreview.net, anthropic.com, openai.com",
      "codex.search_context_size": "high",
      "codex.include_sources": true,
    },
  },
  {
    id: "codex.streaming",
    provider: "codex",
    label: "Streaming agentic",
    description:
      "stream: true. Emits the live search, open_page, and answer SSE events.",
    order: [
      "codex.model",
      "codex.input",
      "codex.web_search",
      "codex.search_context_size",
      "codex.include_sources",
      "codex.stream",
    ],
    values: {
      "codex.model": "gpt-5.5",
      "codex.input": "What's new in AI this week?",
      "codex.web_search": true,
      "codex.search_context_size": "medium",
      "codex.include_sources": true,
      "codex.stream": true,
    },
  },
  {
    id: "codex.multiturn",
    provider: "codex",
    label: "Multi-turn follow-up",
    description: "Chain to a prior response via previous_response_id + store.",
    order: [
      "codex.model",
      "codex.input",
      "codex.web_search",
      "codex.previous_response_id",
      "codex.store",
    ],
    values: {
      "codex.model": "gpt-5.5",
      "codex.input": "And what were the second-place results?",
      "codex.web_search": true,
      "codex.previous_response_id": "resp_01HXYZ…",
      "codex.store": true,
    },
  },
  {
    id: "codex.cached",
    provider: "codex",
    label: "Cache-only search",
    description:
      "external_web_access: false disables live web access for OpenAI web_search.",
    order: [
      "codex.model",
      "codex.input",
      "codex.web_search",
      "codex.external_web_access",
    ],
    values: {
      "codex.model": "gpt-5.5",
      "codex.input": "Where is fetch documented in the MDN web docs?",
      "codex.web_search": true,
      "codex.external_web_access": false,
    },
  },

  // ───── Claude ─────
  {
    id: "claude.basic",
    provider: "claude",
    label: "Basic search",
    description: "Single-shot web_search_20250305 call.",
    order: [
      "claude.model",
      "claude.max_tokens",
      "claude.system",
      "claude.messages",
      "claude.web_search",
    ],
    values: {
      "claude.model": "claude-opus-4-7",
      "claude.max_tokens": 2048,
      "claude.system":
        "You are a research assistant. Cite every claim with a source URL.",
      "claude.messages": {
        turns: [
          {
            role: "user",
            content: "Who won the 2026 Australian Open men's singles?",
          },
        ],
      },
      "claude.web_search": true,
    },
  },
  {
    id: "claude.domain",
    provider: "claude",
    label: "Domain-restricted",
    description: "max_uses + allowed_domains for a budgeted, grounded search.",
    order: [
      "claude.model",
      "claude.max_tokens",
      "claude.system",
      "claude.messages",
      "claude.web_search",
      "claude.max_uses",
      "claude.allowed_domains",
    ],
    values: {
      "claude.model": "claude-opus-4-7",
      "claude.max_tokens": 4096,
      "claude.system":
        "You are a research assistant. Cite every claim with a source URL.",
      "claude.messages": {
        turns: [
          {
            role: "user",
            content:
              "Summarise the latest transformer scaling-laws findings from research papers.",
          },
        ],
      },
      "claude.web_search": true,
      "claude.max_uses": 5,
      "claude.allowed_domains": "arxiv.org, openreview.net, anthropic.com",
    },
  },
  {
    id: "claude.streaming",
    provider: "claude",
    label: "Streaming",
    description:
      "stream: true. Emits message_start / content_block_start (server_tool_use) / content_block_delta flows.",
    order: [
      "claude.model",
      "claude.max_tokens",
      "claude.system",
      "claude.messages",
      "claude.web_search",
      "claude.max_uses",
      "claude.stream",
    ],
    values: {
      "claude.model": "claude-opus-4-7",
      "claude.max_tokens": 2048,
      "claude.system":
        "You are a research assistant. Cite every claim with a source URL.",
      "claude.messages": {
        turns: [{ role: "user", content: "What's new in AI this week?" }],
      },
      "claude.web_search": true,
      "claude.max_uses": 4,
      "claude.stream": true,
    },
  },
  {
    id: "claude.multiturn",
    provider: "claude",
    label: "Multi-turn",
    description:
      "Resend assistant + user turns. Claude has no previous_response_id; you carry the history.",
    order: [
      "claude.model",
      "claude.max_tokens",
      "claude.system",
      "claude.messages",
      "claude.web_search",
    ],
    values: {
      "claude.model": "claude-opus-4-7",
      "claude.max_tokens": 2048,
      "claude.system":
        "You are a research assistant. Cite every claim with a source URL.",
      "claude.messages": {
        turns: [
          { role: "user", content: "Who won the 2026 Australian Open?" },
          {
            role: "assistant",
            content:
              "The prior answer identified the winner and cited its source [1]. Sources: [1] https://example.com/source",
          },
          { role: "user", content: "And what were the second-place results?" },
        ],
      },
      "claude.web_search": true,
    },
  },
]

export function presetsFor(provider: "codex" | "claude"): Array<Preset> {
  return PRESETS.filter((p) => p.provider === provider)
}
