export type LocationType =
  | "region"
  | "city"
  | "village"
  | "dungeon"
  | "castle"
  | "temple"
  | "poi"
  | "route"

export type LocationRecord = {
  id: number
  name: string
  slug: string
  type: LocationType
  parent_id: number | null
  description: string | null
  lore: string | null
  atmosphere: string | null
  secrets: string | null
  map_x: number | null
  map_y: number | null
  image_url: string | null
  is_discovered_default: 0 | 1
  created_at: string
}

export type LocationCreateInput = {
  name: string
  type: LocationType
  parent_id?: number | null
  description?: string | null
  lore?: string | null
  atmosphere?: string | null
  secrets?: string | null
  map_x?: number | null
  map_y?: number | null
  image_url?: string | null
  is_discovered_default?: boolean
}

export type LocationPatchInput = Partial<LocationCreateInput> & {
  slug?: string
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

export async function listLocations(): Promise<LocationRecord[]> {
  return requestJson<LocationRecord[]>("/api/locations")
}

export async function createLocation(input: LocationCreateInput): Promise<LocationRecord> {
  return requestJson<LocationRecord>("/api/locations", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function patchLocation(id: number, patch: LocationPatchInput): Promise<LocationRecord> {
  return requestJson<LocationRecord>(`/api/locations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  })
}

export async function deleteLocation(id: number): Promise<void> {
  const res = await fetch(`/api/locations/${id}`, { method: "DELETE" })
  if (res.status === 204) {
    return
  }

  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res))
  }
}
