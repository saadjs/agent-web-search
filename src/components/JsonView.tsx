import { useMemo, useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Minimal token highlighter for JSON, no extra deps. */
function highlight(json: string) {
  return json.replace(
    /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|\b(true|false|null)\b|(-?\d+\.?\d*(?:[eE][+-]?\d+)?)/g,
    (match, key, str, kw, num) => {
      if (key) return `<span class="tok-key">${match}</span>`
      if (str) return `<span class="tok-str">${match}</span>`
      if (kw) return `<span class="tok-kw">${match}</span>`
      if (num) return `<span class="tok-num">${match}</span>`
      return match
    }
  )
}

export function JsonView({ data }: { data: unknown }) {
  const [copied, setCopied] = useState(false)
  const json = useMemo(() => JSON.stringify(data, null, 2), [data])
  const html = useMemo(() => highlight(json), [json])

  const copy = async () => {
    await navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="relative">
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-1 right-1 size-7"
        onClick={copy}
        aria-label="Copy JSON"
      >
        {copied ? (
          <Check className="size-3.5" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </Button>
      <pre
        className="rounded-md bg-muted/40 p-3 pr-10 font-mono text-xs leading-relaxed break-all whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

export function CodeView({
  code,
  language,
}: {
  code: string
  language?: string
}) {
  const [copied, setCopied] = useState(false)

  // Light JSON-ish highlight for snippets that contain JSON-like literals.
  const html = useMemo(() => {
    if (language === "bash") return code
    return code.replace(
      /("(?:\\.|[^"\\])*")|\b(const|await|import|from|client|new|return|true|false|None|True|False|null|def|print)\b|\/\/.*$|#.*$/gm,
      (m, str, kw) => {
        if (str) return `<span class="tok-str">${m}</span>`
        if (kw) return `<span class="tok-kw">${m}</span>`
        if (m.startsWith("//") || m.startsWith("#"))
          return `<span class="tok-comment">${m}</span>`
        return m
      }
    )
  }, [code, language])

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="relative">
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-1 right-1 size-7"
        onClick={copy}
        aria-label="Copy"
      >
        {copied ? (
          <Check className="size-3.5" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </Button>
      <pre
        className="rounded-md bg-muted/40 p-3 pr-10 font-mono text-xs leading-relaxed break-all whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
