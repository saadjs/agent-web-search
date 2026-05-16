import type { Provider } from "../types"

export interface SnippetTarget {
  id: "curl" | "fetch" | "ts-sdk" | "python-sdk"
  label: string
  language: string
}

export const SNIPPET_TARGETS: Array<SnippetTarget> = [
  { id: "curl", label: "curl", language: "bash" },
  { id: "fetch", label: "fetch (TS)", language: "ts" },
  { id: "ts-sdk", label: "SDK (TS)", language: "ts" },
  { id: "python-sdk", label: "SDK (Python)", language: "python" },
]

const ENDPOINTS: Record<Provider, string> = {
  codex: "https://api.openai.com/v1/responses",
  claude: "https://api.anthropic.com/v1/messages",
}

const AUTH_HEADERS: Record<Provider, Record<string, string>> = {
  codex: {
    "Content-Type": "application/json",
    Authorization: "Bearer $OPENAI_API_KEY",
  },
  claude: {
    "Content-Type": "application/json",
    "x-api-key": "$ANTHROPIC_API_KEY",
    "anthropic-version": "2023-06-01",
  },
}

function pretty(body: unknown): string {
  return JSON.stringify(body, null, 2)
}

function indent(s: string, n: number): string {
  const pad = " ".repeat(n)
  return s
    .split("\n")
    .map((l, i) => (i === 0 ? l : pad + l))
    .join("\n")
}

export function genCurl(
  provider: Provider,
  body: Record<string, unknown>
): string {
  const url = ENDPOINTS[provider]
  const headerArgs = Object.entries(AUTH_HEADERS[provider])
    .map(([k, v]) => `  -H "${k}: ${v}"`)
    .join(" \\\n")
  return `curl ${url} \\
${headerArgs} \\
  -d '${pretty(body)}'`
}

export function genFetch(
  provider: Provider,
  body: Record<string, unknown>
): string {
  const url = ENDPOINTS[provider]
  const headers = pretty(AUTH_HEADERS[provider])
  return `const res = await fetch("${url}", {
  method: "POST",
  headers: ${indent(headers, 2)},
  body: JSON.stringify(${indent(pretty(body), 2)}),
})
const data = await res.json()`
}

export function genTsSdk(
  provider: Provider,
  body: Record<string, unknown>
): string {
  if (provider === "codex") {
    const args = pretty(body)
    return `import OpenAI from "openai"

const client = new OpenAI()
const response = await client.responses.create(${indent(args, 0)})
console.log(response.output_text)`
  }
  const args = pretty(body)
  return `import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()
const message = await client.messages.create(${indent(args, 0)})
console.log(message.content)`
}

export function genPythonSdk(
  provider: Provider,
  body: Record<string, unknown>
): string {
  const args = toPyKwargs(body)
  if (provider === "codex") {
    return `from openai import OpenAI

client = OpenAI()
response = client.responses.create(
${indent(args, 4)}
)
print(response.output_text)`
  }
  return `from anthropic import Anthropic

client = Anthropic()
message = client.messages.create(
${indent(args, 4)}
)
print(message.content)`
}

/** Convert a JS object into Python kwargs (key=value, one per line). */
function toPyKwargs(o: Record<string, unknown>): string {
  return Object.entries(o)
    .map(([k, v]) => `${k}=${toPy(v, 0)},`)
    .join("\n")
}

function toPy(v: unknown, depth: number): string {
  if (v === null) return "None"
  if (v === true) return "True"
  if (v === false) return "False"
  if (typeof v === "number") return String(v)
  if (typeof v === "string") return JSON.stringify(v)
  if (Array.isArray(v)) {
    if (v.length === 0) return "[]"
    const items = v.map((x) => toPy(x, depth + 1))
    const inline = `[${items.join(", ")}]`
    if (inline.length < 70) return inline
    const pad = " ".repeat((depth + 1) * 4)
    return `[\n${items.map((x) => pad + x).join(",\n")}\n${" ".repeat(depth * 4)}]`
  }
  if (typeof v === "object") {
    const o = v as Record<string, unknown>
    const entries = Object.entries(o)
    if (entries.length === 0) return "{}"
    const pad = " ".repeat((depth + 1) * 4)
    const closePad = " ".repeat(depth * 4)
    return `{\n${entries
      .map(([k, val]) => `${pad}${JSON.stringify(k)}: ${toPy(val, depth + 1)}`)
      .join(",\n")}\n${closePad}}`
  }
  return JSON.stringify(v)
}

export function genSnippet(
  target: SnippetTarget["id"],
  provider: Provider,
  body: Record<string, unknown>
): string {
  switch (target) {
    case "curl":
      return genCurl(provider, body)
    case "fetch":
      return genFetch(provider, body)
    case "ts-sdk":
      return genTsSdk(provider, body)
    case "python-sdk":
      return genPythonSdk(provider, body)
  }
}
