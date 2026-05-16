# web_search builder

Visual request builder for comparing OpenAI Responses `web_search` blocks with
Claude Messages `web_search` server-tool blocks. It does not make real API
requests or require API keys.

## Official References

- [OpenAI web search guide](https://developers.openai.com/api/docs/guides/tools-web-search)
- [OpenAI conversation state guide](https://developers.openai.com/api/docs/guides/conversation-state)
- [OpenAI model docs](https://developers.openai.com/api/docs/models)
- [Claude web search tool docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool)
- [Claude server tools docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/server-tools)
- [Claude model docs](https://platform.claude.com/docs/en/about-claude/models/all-models)

## Development

```bash
pnpm install
pnpm run dev
```

## Verification

```bash
pnpm run test
pnpm run typecheck
```

## Deployment

Build-time `SITE_URL` or `VITE_SITE_URL` controls the canonical and social
preview URLs. The Cloudflare deploy script sets
`SITE_URL=https://agent-web-search.saad.sh`.

This project deploys to Cloudflare Workers Static Assets as
`agent-web-search`:

```bash
pnpm run deploy
```

The deploy script builds with `SITE_URL=https://agent-web-search.saad.sh`, then
uploads `dist/` with Wrangler. The Worker is attached to
`agent-web-search.saad.sh` as a custom domain in `wrangler.jsonc`.
