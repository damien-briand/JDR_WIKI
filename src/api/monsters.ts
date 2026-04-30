export type MonsterRecord = {
  id: number
  name: string
  slug: string
  tier: number
  category: string | null
  description: string | null
  lore: string | null
  difficulty: number
  image_url: string | null
  is_boss: 0 | 1
  secrets: string | null
  created_at: string
}

export type MonsterCreateInput = {
  name: string
  slug?: string
  tier?: number
  category?: string | null
  description?: string | null
  lore?: string | null
  secrets?: string | null
  difficulty?: number
  image_url?: string | null
  is_boss?: boolean
}

export type MonsterPatchInput = Partial<MonsterCreateInput>

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as unknown
    if (
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof (data as Record<string, unknown>).error === "string"
    ) {
      return (data as Record<string, string>).error
    }
  } catch {
    // ignore
  }

  return `HTTP ${res.status}`
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res))
  }

  return (await res.json()) as T
}

export async function listMonsters(): Promise<MonsterRecord[]> {
  return requestJson<MonsterRecord[]>("/api/monsters")
}

export async function createMonster(input: MonsterCreateInput): Promise<MonsterRecord> {
  return requestJson<MonsterRecord>("/api/monsters", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function patchMonster(id: number, patch: MonsterPatchInput): Promise<MonsterRecord> {
  return requestJson<MonsterRecord>(`/api/monsters/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  })
}

export async function deleteMonster(id: number): Promise<void> {
  const res = await fetch(`/api/monsters/${id}`, { method: "DELETE" })

  if (res.status === 204) {
    return
  }

  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res))
  }
}
