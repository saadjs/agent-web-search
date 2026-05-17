import { useEffect, useState } from "react"
import { CircleHelpIcon, Code2Icon, KeyRoundIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  dismissLandingIntroForSession,
  dismissLandingIntroPermanently,
  getBrowserLandingIntroStorage,
  shouldOpenLandingIntro,
} from "@/lib/landing-intro"

export function LandingIntroDialog() {
  const [open, setOpen] = useState(false)
  const [recordSessionDismissalOnClose, setRecordSessionDismissalOnClose] =
    useState(false)

  useEffect(() => {
    const storage = getBrowserLandingIntroStorage()

    if (shouldOpenLandingIntro(storage)) {
      setRecordSessionDismissalOnClose(true)
      setOpen(true)
    }
  }, [])

  const openManually = () => {
    setRecordSessionDismissalOnClose(false)
    setOpen(true)
  }

  const closeForSession = () => {
    dismissLandingIntroForSession(getBrowserLandingIntroStorage())
    setRecordSessionDismissalOnClose(false)
    setOpen(false)
  }

  const closePermanently = () => {
    dismissLandingIntroPermanently(getBrowserLandingIntroStorage())
    setRecordSessionDismissalOnClose(false)
    setOpen(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      openManually()
      return
    }

    if (recordSessionDismissalOnClose) {
      dismissLandingIntroForSession(getBrowserLandingIntroStorage())
    }

    setRecordSessionDismissalOnClose(false)
    setOpen(false)
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={openManually}
            aria-label="Open intro"
          >
            <CircleHelpIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>What this builder does</TooltipContent>
      </Tooltip>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>What this builder does</DialogTitle>
            <DialogDescription>
              Build and inspect web_search request payloads for OpenAI/Codex and
              Claude.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 text-xs">
            <div className="flex items-center gap-2 rounded-md border bg-card/60 px-3 py-2.5">
              <Code2Icon className="size-3.5 shrink-0 text-primary" />
              <p className="leading-snug text-muted-foreground">
                Compare provider-specific blocks and output shapes.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-md border bg-card/60 px-3 py-2.5">
              <KeyRoundIcon className="size-3.5 shrink-0 text-primary" />
              <p className="leading-snug text-muted-foreground">
                No API keys, no real requests; everything is visualized locally.
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row">
            <Button type="button" onClick={closeForSession}>
              Dismiss
            </Button>
            <Button type="button" variant="outline" onClick={closePermanently}>
              Don&apos;t show again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
