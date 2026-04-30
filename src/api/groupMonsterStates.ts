export type GroupMonsterStatus = "unknown" | "known" | "encountered" | "defeated"

export type GroupMonsterStateRecord = {
  group_id: number
  monster_id: number
  status: GroupMonsterStatus
  defeat_session_id: number | null
  notes: string | null
}

export type GroupMonsterStateUpsertInput = {
  status: GroupMonsterStatus
  defeat_session_id?: number | null
  notes?: string | null
}

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

export async function listGroupMonsterStates(groupId: number): Promise<GroupMonsterStateRecord[]> {
  return requestJson<GroupMonsterStateRecord[]>(`/api/groups/${groupId}/monster-states`)
}

export async function upsertGroupMonsterState(
  groupId: number,
  monsterId: number,
  input: GroupMonsterStateUpsertInput,
): Promise<GroupMonsterStateRecord> {
  return requestJson<GroupMonsterStateRecord>(`/api/groups/${groupId}/monster-states/${monsterId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
}
