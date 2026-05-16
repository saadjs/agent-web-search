import {
  createContext,
  createElement,
  useContext,
  useMemo,
  useReducer,
} from "react"
import { ALL_BLOCKS } from "./blocks"
import type { Dispatch, ReactNode } from "react"
import type { CanvasAction, CanvasState, Provider } from "./types"

const initialState: CanvasState = {
  provider: "codex",
  order: { codex: [], claude: [] },
  values: { codex: {}, claude: {} },
}

function reducer(state: CanvasState, action: CanvasAction): CanvasState {
  const p = state.provider
  switch (action.type) {
    case "ADD_BLOCK": {
      if (state.order[p].includes(action.blockId)) return state
      const block = ALL_BLOCKS[action.blockId]
      if (!block || block.provider !== p) return state
      return {
        ...state,
        order: { ...state.order, [p]: [...state.order[p], action.blockId] },
        values: {
          ...state.values,
          [p]: {
            ...state.values[p],
            [action.blockId]:
              action.value !== undefined ? action.value : block.defaultValue,
          },
        },
      }
    }
    case "REMOVE_BLOCK": {
      const nextOrder = state.order[p].filter((id) => id !== action.blockId)
      const nextValues = { ...state.values[p] }
      delete nextValues[action.blockId]
      return {
        ...state,
        order: { ...state.order, [p]: nextOrder },
        values: { ...state.values, [p]: nextValues },
      }
    }
    case "UPDATE_VALUE": {
      return {
        ...state,
        values: {
          ...state.values,
          [p]: { ...state.values[p], [action.blockId]: action.value },
        },
      }
    }
    case "REORDER": {
      return { ...state, order: { ...state.order, [p]: action.order } }
    }
    case "LOAD_PRESET": {
      const presetP = action.preset.provider
      return {
        ...state,
        provider: presetP,
        order: { ...state.order, [presetP]: [...action.preset.order] },
        values: { ...state.values, [presetP]: { ...action.preset.values } },
      }
    }
    case "SWITCH_PROVIDER":
      return { ...state, provider: action.provider }
    case "RESET":
      return {
        ...state,
        order: { ...state.order, [p]: [] },
        values: { ...state.values, [p]: {} },
      }
  }
}

interface CanvasContextValue {
  state: CanvasState
  dispatch: Dispatch<CanvasAction>
}

const CanvasContext = createContext<CanvasContextValue | null>(null)

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const value = useMemo(() => ({ state, dispatch }), [state])
  return createElement(CanvasContext.Provider, { value }, children)
}

export function useCanvas() {
  const ctx = useContext(CanvasContext)
  if (!ctx) throw new Error("useCanvas must be used inside CanvasProvider")
  return ctx
}

export function useProvider(): Provider {
  return useCanvas().state.provider
}
