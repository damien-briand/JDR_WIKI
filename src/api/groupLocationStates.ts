export type GroupLocationStatus =
  | "undiscovered"
  | "discovered"
  | "partially_explored"
  | "fully_explored"
  | "cleared"

export type GroupLocationStateRecord = {
  group_id: number
  location_id: number
  status: GroupLocationStatus
  notes: string | null
  discovery_session_id: number | null
}

export type GroupLocationStateUpsertInput = {
  status: GroupLocationStatus
  notes?: string | null
  discovery_session_id?: number | null
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

export async function listGroupLocationStates(groupId: number): Promise<GroupLocationStateRecord[]> {
  return requestJson<GroupLocationStateRecord[]>(`/api/groups/${groupId}/location-states`)
}

export async function upsertGroupLocationState(
  groupId: number,
  locationId: number,
  input: GroupLocationStateUpsertInput,
): Promise<GroupLocationStateRecord> {
  return requestJson<GroupLocationStateRecord>(`/api/groups/${groupId}/location-states/${locationId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
}
