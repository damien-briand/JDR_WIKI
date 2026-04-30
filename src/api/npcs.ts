export type NpcRecord = {
  id: number
  name: string
  slug: string
  type: string
  location_id: number | null
  description: string | null
  lore: string | null
  personality: string | null
  secrets: string | null
  image_url: string | null
  is_unique: 0 | 1
  default_status: string | null
  created_at: string
}

export type NpcCreateInput = {
  name: string
  slug?: string
  type?: string
  location_id?: number | null
  description?: string | null
  lore?: string | null
  personality?: string | null
  secrets?: string | null
  image_url?: string | null
  is_unique?: boolean
  default_status?: string
}

export type NpcPatchInput = Partial<NpcCreateInput>

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

export async function listNpcs(): Promise<NpcRecord[]> {
  return requestJson<NpcRecord[]>("/api/npcs")
}

export async function createNpc(input: NpcCreateInput): Promise<NpcRecord> {
  return requestJson<NpcRecord>("/api/npcs", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function patchNpc(id: number, patch: NpcPatchInput): Promise<NpcRecord> {
  return requestJson<NpcRecord>(`/api/npcs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  })
}

export async function deleteNpc(id: number): Promise<void> {
  const res = await fetch(`/api/npcs/${id}`, { method: "DELETE" })

  if (res.status === 204) {
    return
  }

  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res))
  }
}
