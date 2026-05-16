import { ALL_BLOCKS } from "./blocks"
import type { BlockId, BlockValue, Provider } from "./types"

/**
 * Pure: turn the active canvas values into the request body the user would
 * POST to the provider's endpoint. Block order in the canvas does NOT affect
 * key order. applyToRequest functions write into a canonical shape.
 */
export function buildRequest(
  provider: Provider,
  order: Array<BlockId>,
  values: Record<BlockId, BlockValue>
): Record<string, unknown> {
  const req: Record<string, unknown> = {}
  for (const id of order) {
    const block = ALL_BLOCKS[id]
    if (!block || block.provider !== provider) continue
    block.applyToRequest(req, values[id])
  }
  return req
}
