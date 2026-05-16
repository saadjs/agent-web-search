import { useCallback, useEffect, useRef, useState } from "react"
import type { StreamEvent } from "@/lib/streaming-scripts"

export interface PlayedEvent extends StreamEvent {
  /** order index in the script */
  i: number
}

export function useStreamSimulator(script: Array<StreamEvent>, speed = 1) {
  const [played, setPlayed] = useState<Array<PlayedEvent>>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const timeouts = useRef<Array<number>>([])
  const scriptRef = useRef(script)
  scriptRef.current = script

  const stop = useCallback(() => {
    for (const t of timeouts.current) window.clearTimeout(t)
    timeouts.current = []
    setIsPlaying(false)
  }, [])

  const play = useCallback(() => {
    stop()
    setPlayed([])
    if (scriptRef.current.length === 0) return
    setIsPlaying(true)
    let acc = 0
    scriptRef.current.forEach((ev, i) => {
      acc += ev.delay / speed
      const t = window.setTimeout(() => {
        setPlayed((p) => [...p, { ...ev, i }])
        if (i === scriptRef.current.length - 1) setIsPlaying(false)
      }, acc)
      timeouts.current.push(t)
    })
  }, [speed, stop])

  useEffect(() => stop, [stop])

  return { played, isPlaying, play, stop }
}
