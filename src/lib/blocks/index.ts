import { codexBlocks } from "./codex"
import { claudeBlocks } from "./claude"
import type { BlockDef, BlockId, Provider } from "../types"

export const ALL_BLOCKS: Record<BlockId, BlockDef | undefined> =
  Object.fromEntries([...codexBlocks, ...claudeBlocks].map((b) => [b.id, b]))

export const BLOCKS_BY_PROVIDER: Record<Provider, Array<BlockDef>> = {
  codex: codexBlocks,
  claude: claudeBlocks,
}

export const GROUP_LABELS: Record<string, string> = {
  required: "Required",
  tool: "Tool",
  "tool-config": "Tool config",
  streaming: "Streaming",
  "multi-turn": "Multi-turn",
  advanced: "Advanced",
  quirks: "Caveats",
}
