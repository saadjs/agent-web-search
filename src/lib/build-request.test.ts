import { describe, expect, it } from "vitest"
import { buildRequest } from "./build-request"
import type { BlockId, BlockValue } from "./types"

function values(entries: Record<BlockId, BlockValue>) {
  return entries
}

describe("buildRequest web search blocks", () => {
  it("builds the documented OpenAI web_search request fields", () => {
    const req = buildRequest(
      "codex",
      [
        "codex.model",
        "codex.input",
        "codex.web_search",
        "codex.filters.allowed_domains",
        "codex.filters.blocked_domains",
        "codex.user_location",
        "codex.search_context_size",
        "codex.include_sources",
        "codex.external_web_access",
      ],
      values({
        "codex.model": "gpt-5.5",
        "codex.input": "Find the official web_search docs.",
        "codex.web_search": true,
        "codex.filters.allowed_domains": "openai.com platform.openai.com",
        "codex.filters.blocked_domains": "reddit.com",
        "codex.user_location": {
          country: "US",
          region: "California",
          city: "San Francisco",
          timezone: "America/Los_Angeles",
        },
        "codex.search_context_size": "high",
        "codex.include_sources": true,
        "codex.external_web_access": false,
      })
    )

    expect(req).toEqual({
      model: "gpt-5.5",
      input: "Find the official web_search docs.",
      tools: [
        {
          type: "web_search",
          filters: {
            allowed_domains: ["openai.com", "platform.openai.com"],
            blocked_domains: ["reddit.com"],
          },
          user_location: {
            type: "approximate",
            country: "US",
            region: "California",
            city: "San Francisco",
            timezone: "America/Los_Angeles",
          },
          search_context_size: "high",
          external_web_access: false,
        },
      ],
      include: ["web_search_call.action.sources"],
    })
  })

  it("builds the documented Claude web_search tool and location shape", () => {
    const req = buildRequest(
      "claude",
      [
        "claude.model",
        "claude.max_tokens",
        "claude.messages",
        "claude.web_search",
        "claude.max_uses",
        "claude.allowed_domains",
        "claude.user_location",
      ],
      values({
        "claude.model": "claude-opus-4-7",
        "claude.max_tokens": 2048,
        "claude.messages": {
          turns: [
            { role: "user", content: "Find the Claude web_search docs." },
          ],
        },
        "claude.web_search": true,
        "claude.max_uses": 2,
        "claude.allowed_domains": "anthropic.com platform.claude.com",
        "claude.user_location": {
          country: "US",
          region: "California",
          city: "San Francisco",
          timezone: "America/Los_Angeles",
        },
      })
    )

    expect(req).toEqual({
      model: "claude-opus-4-7",
      max_tokens: 2048,
      messages: [{ role: "user", content: "Find the Claude web_search docs." }],
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 2,
          allowed_domains: ["anthropic.com", "platform.claude.com"],
          user_location: {
            type: "approximate",
            country: "US",
            region: "California",
            city: "San Francisco",
            timezone: "America/Los_Angeles",
          },
        },
      ],
    })
  })
})
