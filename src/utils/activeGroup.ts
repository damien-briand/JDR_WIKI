const STORAGE_KEY = "jdr-wiki-active-group-id-v1"

export function loadActiveGroupId(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = Number.parseInt(raw, 10)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null
  } catch {
    return null
  }
}

export function saveActiveGroupId(groupId: number | null): void {
  try {
    if (!groupId) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }

    localStorage.setItem(STORAGE_KEY, String(groupId))
  } catch {
    // ignore
  }
}
