export type GroupRecord = {
  id: number
  name: string
  color: string
  description: string | null
  created_at: string
  last_session_date: string | null
  notes: string | null
}

export type GroupCreateInput = {
  name: string
  color?: string
  description?: string | null
  last_session_date?: string | null
  notes?: string | null
}

export type GroupPatchInput = Partial<GroupCreateInput>

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

export async function listGroups(): Promise<GroupRecord[]> {
  return requestJson<GroupRecord[]>("/api/groups")
}

export async function createGroup(input: GroupCreateInput): Promise<GroupRecord> {
  return requestJson<GroupRecord>("/api/groups", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function patchGroup(id: number, patch: GroupPatchInput): Promise<GroupRecord> {
  return requestJson<GroupRecord>(`/api/groups/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  })
}

export async function deleteGroup(id: number): Promise<void> {
  const res = await fetch(`/api/groups/${id}`, { method: "DELETE" })

  if (res.status === 204) {
    return
  }

  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res))
  }
}
