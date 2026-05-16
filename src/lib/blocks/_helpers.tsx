/* Shared controls + helpers used by both provider block registries. */
import type { UserLocationValue } from "../types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function asObj(x: unknown): Record<string, unknown> {
  return (x && typeof x === "object" ? x : {}) as Record<string, unknown>
}

export function asArr(x: unknown): Array<unknown> {
  return Array.isArray(x) ? x : []
}

/** Get-or-create the tool object at tools[0]. */
export function ensureTool(
  req: Record<string, unknown>,
  factory: () => Record<string, unknown>
): Record<string, unknown> {
  if (!Array.isArray(req.tools)) req.tools = []
  const tools = req.tools as Array<Record<string, unknown>>
  if (tools.length === 0) tools.push(factory())
  return tools[0]
}

export function parseDomains(s: string): Array<string> {
  return s
    .split(/[\s,]+/)
    .map((d) => d.trim())
    .filter(Boolean)
}

export function TextControl({
  value,
  setValue,
  placeholder,
}: {
  value: unknown
  setValue: (v: unknown) => void
  placeholder?: string
}) {
  return (
    <Input
      value={typeof value === "string" ? value : ""}
      placeholder={placeholder}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}

export function NumberControl({
  value,
  setValue,
  placeholder,
}: {
  value: unknown
  setValue: (v: unknown) => void
  placeholder?: string
}) {
  return (
    <Input
      type="number"
      value={typeof value === "number" ? value : ""}
      placeholder={placeholder}
      onChange={(e) =>
        setValue(e.target.value === "" ? undefined : Number(e.target.value))
      }
    />
  )
}

export function TextareaControl({
  value,
  setValue,
  placeholder,
  rows = 3,
}: {
  value: unknown
  setValue: (v: unknown) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <Textarea
      rows={rows}
      value={typeof value === "string" ? value : ""}
      placeholder={placeholder}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}

export function SwitchControl({
  value,
  setValue,
}: {
  value: unknown
  setValue: (v: unknown) => void
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <Switch checked={!!value} onCheckedChange={(v) => setValue(v)} />
      <span className="text-sm text-muted-foreground">
        {value ? "on" : "off"}
      </span>
    </div>
  )
}

export function SelectControl({
  value,
  setValue,
  options,
  placeholder,
}: {
  value: unknown
  setValue: (v: unknown) => void
  options: Array<string>
  placeholder?: string
}) {
  return (
    <Select
      value={typeof value === "string" ? value : undefined}
      onValueChange={(v) => setValue(v)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder ?? "Select…"} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function DomainListControl({
  value,
  setValue,
}: {
  value: unknown
  setValue: (v: unknown) => void
}) {
  return (
    <div>
      <Textarea
        rows={2}
        value={typeof value === "string" ? value : ""}
        placeholder="e.g. arxiv.org, nytimes.com, anthropic.com"
        onChange={(e) => setValue(e.target.value)}
      />
      <p className="mt-1 text-xs text-muted-foreground">
        Comma or whitespace separated. No https:// prefix.
      </p>
    </div>
  )
}

export function UserLocationControl({
  value,
  setValue,
}: {
  value: unknown
  setValue: (v: unknown) => void
}) {
  const v = (value || {}) as UserLocationValue
  const update = (patch: Partial<UserLocationValue>) =>
    setValue({ ...v, ...patch })
  return (
    <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
      <div>
        <Label className="text-xs">country (ISO-2)</Label>
        <Input
          value={v.country ?? ""}
          placeholder="US"
          onChange={(e) => update({ country: e.target.value })}
        />
      </div>
      <div>
        <Label className="text-xs">region</Label>
        <Input
          value={v.region ?? ""}
          placeholder="California"
          onChange={(e) => update({ region: e.target.value })}
        />
      </div>
      <div>
        <Label className="text-xs">city</Label>
        <Input
          value={v.city ?? ""}
          placeholder="San Francisco"
          onChange={(e) => update({ city: e.target.value })}
        />
      </div>
      <div>
        <Label className="text-xs">timezone (IANA)</Label>
        <Input
          value={v.timezone ?? ""}
          placeholder="America/Los_Angeles"
          onChange={(e) => update({ timezone: e.target.value })}
        />
      </div>
    </div>
  )
}

/** Strip undefined / empty-string fields from a flat object. */
export function compact<T extends Record<string, unknown>>(o: T): T {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined || v === "" || v === null) continue
    out[k] = v
  }
  return out as T
}
