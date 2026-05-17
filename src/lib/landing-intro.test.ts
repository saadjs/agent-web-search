import { describe, expect, it } from "vitest"
import {
  LANDING_INTRO_PERMANENT_KEY,
  LANDING_INTRO_SESSION_KEY,
  dismissLandingIntroForSession,
  dismissLandingIntroPermanently,
  shouldOpenLandingIntro,
} from "./landing-intro"
import type { LandingIntroStorageLike } from "./landing-intro"

function memoryStorage(initial: Record<string, string> = {}) {
  const values = { ...initial }
  const storage: LandingIntroStorageLike = {
    getItem: (key) => values[key] ?? null,
    setItem: (key, value) => {
      values[key] = value
    },
  }

  return storage
}

describe("landing intro dismissal", () => {
  it("opens when no dismissal has been stored", () => {
    expect(
      shouldOpenLandingIntro({
        localStorage: memoryStorage(),
        sessionStorage: memoryStorage(),
      })
    ).toBe(true)
  })

  it("stays hidden for the current session after a session dismissal", () => {
    const sessionStorage = memoryStorage()

    dismissLandingIntroForSession({ sessionStorage })

    expect(
      shouldOpenLandingIntro({
        localStorage: memoryStorage(),
        sessionStorage,
      })
    ).toBe(false)
    expect(sessionStorage.getItem(LANDING_INTRO_SESSION_KEY)).toBe("1")
  })

  it("stays hidden permanently after a permanent dismissal", () => {
    const localStorage = memoryStorage()

    dismissLandingIntroPermanently({ localStorage })

    expect(
      shouldOpenLandingIntro({
        localStorage,
        sessionStorage: memoryStorage(),
      })
    ).toBe(false)
    expect(localStorage.getItem(LANDING_INTRO_PERMANENT_KEY)).toBe("1")
  })
})
