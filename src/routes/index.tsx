import { createFileRoute } from "@tanstack/react-router"
import { Globe } from "lucide-react"
import { GithubIcon } from "@/components/icons"
import { CanvasProvider } from "@/lib/store"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ProviderTabs } from "@/components/ProviderTabs"
import { ThemeToggle } from "@/components/ThemeToggle"
import { BuilderLayout } from "@/components/BuilderLayout"
import { LandingIntroDialog } from "@/components/LandingIntroDialog"

export const Route = createFileRoute("/")({ component: App })

function App() {
  return (
    <CanvasProvider>
      <TooltipProvider delayDuration={200}>
        <div className="min-h-svh">
          <header className="sticky top-0 z-10 border-b bg-background">
            <div className="mx-auto flex max-w-350 flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Globe className="size-4" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm leading-tight font-semibold">
                    web_search builder
                  </h1>
                  <p className="hidden text-xs leading-tight text-muted-foreground sm:block">
                    See how Codex & Claude assemble web_search requests.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <ProviderTabs />
                <a
                  href="https://github.com/saadjs/agent-web-search"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="GitHub repository"
                >
                  <GithubIcon className="size-5" />
                </a>
                <LandingIntroDialog />
                <ThemeToggle />
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-350 px-4 py-4 sm:px-6">
            <BuilderLayout />
          </main>
          <footer className="mx-auto max-w-350 px-4 pt-2 pb-16 text-center text-xs text-muted-foreground sm:px-6 sm:pb-6">
            No API keys, no real requests. This tool is a visualisation only.
            Sources:{" "}
            <a
              className="text-primary underline"
              href="https://developers.openai.com/api/docs/guides/tools-web-search"
              target="_blank"
              rel="noreferrer"
            >
              OpenAI web_search
            </a>{" "}
            ·{" "}
            <a
              className="text-primary underline"
              href="https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool"
              target="_blank"
              rel="noreferrer"
            >
              Claude web_search
            </a>{" "}
            ·{" "}
            <a
              className="text-primary underline"
              href="https://developers.openai.com/codex"
              target="_blank"
              rel="noreferrer"
            >
              Codex docs
            </a>
          </footer>
        </div>
      </TooltipProvider>
    </CanvasProvider>
  )
}
