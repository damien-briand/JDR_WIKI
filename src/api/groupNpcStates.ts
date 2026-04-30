export type GroupNpcStatus =
  | "unknown"
  | "known"
  | "met"
  | "ally"
  | "neutral"
  | "hostile"
  | "dead"

export type GroupNpcStateRecord = {
  group_id: number
  npc_id: number
  status: GroupNpcStatus
  relationship_notes: string | null
}

export type GroupNpcStateUpsertInput = {
  status: GroupNpcStatus
  relationship_notes?: string | null
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

export async function listGroupNpcStates(groupId: number): Promise<GroupNpcStateRecord[]> {
  return requestJson<GroupNpcStateRecord[]>(`/api/groups/${groupId}/npc-states`)
}

export async function upsertGroupNpcState(
  groupId: number,
  npcId: number,
  input: GroupNpcStateUpsertInput,
): Promise<GroupNpcStateRecord> {
  return requestJson<GroupNpcStateRecord>(`/api/groups/${groupId}/npc-states/${npcId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
}
