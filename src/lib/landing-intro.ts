export const LANDING_INTRO_SESSION_KEY =
  "agent-web-search:intro-dismissed-session"
export const LANDING_INTRO_PERMANENT_KEY =
  "agent-web-search:intro-dismissed-permanent"

const DISMISSED_VALUE = "1"

export interface LandingIntroStorageLike {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export interface LandingIntroStorage {
  localStorage?: LandingIntroStorageLike | null
  sessionStorage?: LandingIntroStorageLike | null
}

export function getBrowserLandingIntroStorage(): LandingIntroStorage {
  if (typeof window === "undefined") {
    return { localStorage: null, sessionStorage: null }
  }

  return {
    localStorage: getStorage("localStorage"),
    sessionStorage: getStorage("sessionStorage"),
  }
}

export function shouldOpenLandingIntro(storage: LandingIntroStorage): boolean {
  return (
    !hasDismissal(storage.localStorage, LANDING_INTRO_PERMANENT_KEY) &&
    !hasDismissal(storage.sessionStorage, LANDING_INTRO_SESSION_KEY)
  )
}

export function dismissLandingIntroForSession(
  storage: LandingIntroStorage
): boolean {
  return writeDismissal(storage.sessionStorage, LANDING_INTRO_SESSION_KEY)
}

export function dismissLandingIntroPermanently(
  storage: LandingIntroStorage
): boolean {
  return writeDismissal(storage.localStorage, LANDING_INTRO_PERMANENT_KEY)
}

function hasDismissal(
  storage: LandingIntroStorageLike | null | undefined,
  key: string
) {
  if (!storage) return false

  try {
    return storage.getItem(key) === DISMISSED_VALUE
  } catch {
    return false
  }
}

function writeDismissal(
  storage: LandingIntroStorageLike | null | undefined,
  key: string
) {
  if (!storage) return false

  try {
    storage.setItem(key, DISMISSED_VALUE)
    return true
  } catch {
    return false
  }
}

function getStorage(key: "localStorage" | "sessionStorage") {
  try {
    return window[key]
  } catch {
    return null
  }
}
