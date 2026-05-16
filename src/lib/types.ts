import type { ReactNode } from "react"

export type Provider = "codex" | "claude"
export type BlockId = string
export type BlockValue = unknown

export type BlockGroup =
  | "required"
  | "tool"
  | "tool-config"
  | "streaming"
  | "multi-turn"
  | "advanced"
  | "quirks"

export interface BlockDef {
  id: BlockId
  provider: Provider
  label: string
  group: BlockGroup
  /** Other block ids that must be present for this block to do anything */
  requires?: Array<BlockId>
  /** Blocks that cannot coexist with this one */
  conflicts?: Array<BlockId>
  /** Default value when added to canvas */
  defaultValue: BlockValue
  docsUrl: string
  shortDesc: string
  longDesc: string
  /** Shows a caution badge for non-standard blocks. */
  quirk?: boolean
  /** Render the form control for this block's value */
  renderControl: (args: {
    value: BlockValue
    setValue: (v: BlockValue) => void
  }) => ReactNode
  /**
   * Mutate the in-progress request body to include this block's contribution.
   * Implementations should be permissive. If a dependency is missing, no-op.
   */
  applyToRequest: (req: Record<string, unknown>, value: BlockValue) => void
}

export interface CanvasState {
  provider: Provider
  order: Record<Provider, Array<BlockId>>
  values: Record<Provider, Record<BlockId, BlockValue>>
}

export interface Preset {
  id: string
  provider: Provider
  label: string
  description: string
  order: Array<BlockId>
  values: Record<BlockId, BlockValue>
}

export type CanvasAction =
  | { type: "ADD_BLOCK"; blockId: BlockId; value?: BlockValue }
  | { type: "REMOVE_BLOCK"; blockId: BlockId }
  | { type: "UPDATE_VALUE"; blockId: BlockId; value: BlockValue }
  | { type: "REORDER"; order: Array<BlockId> }
  | { type: "LOAD_PRESET"; preset: Preset }
  | { type: "SWITCH_PROVIDER"; provider: Provider }
  | { type: "RESET" }

export interface UserLocationValue {
  country?: string
  region?: string
  city?: string
  timezone?: string
}

export interface MessagesValue {
  /** Single user input. Multi-turn block expands to alternating roles. */
  turns: Array<{ role: "user" | "assistant"; content: string }>
}
