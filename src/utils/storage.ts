import { MAP_CONFIG } from "../constants/map"
import { clampMarkerSpriteIndex } from "../constants/markers"
import { boundsToRing } from "./geo"
import type { LatLngTuple, MapPayload, MarkerData, ZoneData } from "../types/map"

function hasFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function parseZonePoints(zone: unknown): LatLngTuple[] | null {
  if (!zone || typeof zone !== "object") {
    return null
  }

  const source = zone as {
    points?: unknown
    bounds?: unknown
  }

  if (Array.isArray(source.points)) {
    const points = source.points.filter(
      (point): point is LatLngTuple =>
        Array.isArray(point) &&
        point.length === 2 &&
        hasFiniteNumber(point[0]) &&
        hasFiniteNumber(point[1]),
    )

    if (points.length >= 3) {
      return points
    }
  }

  if (Array.isArray(source.bounds) && source.bounds.length === 2) {
    const sw = source.bounds[0]
    const ne = source.bounds[1]

    if (
      Array.isArray(sw) &&
      sw.length === 2 &&
      Array.isArray(ne) &&
      ne.length === 2 &&
      hasFiniteNumber(sw[0]) &&
      hasFiniteNumber(sw[1]) &&
      hasFiniteNumber(ne[0]) &&
      hasFiniteNumber(ne[1])
    ) {
      return boundsToRing([
        [sw[0], sw[1]],
        [ne[0], ne[1]],
      ])
    }
  }

  return null
}

export function buildPayload(markers: MarkerData[], zones: ZoneData[]): MapPayload {
  return {
    version: 2,
    map: MAP_CONFIG.mapId,
    exportedAt: new Date().toISOString(),
    markers,
    zones,
  }
}

export function normalizePayload(raw: unknown): { markers: MarkerData[]; zones: ZoneData[] } {
  if (!raw || typeof raw !== "object") {
    throw new Error("Le JSON est invalide.")
  }

  const source = raw as {
    markers?: unknown
    zones?: unknown
  }

  if (!Array.isArray(source.markers)) {
    throw new Error("Le JSON ne contient pas de tableau markers.")
  }

  const markers: MarkerData[] = source.markers
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null
      }

      const marker = entry as Partial<MarkerData>

      if (!hasFiniteNumber(marker.lat) || !hasFiniteNumber(marker.lng)) {
        return null
      }

      return {
        id: typeof marker.id === "string" && marker.id ? marker.id : crypto.randomUUID(),
        lat: marker.lat,
        lng: marker.lng,
        title: typeof marker.title === "string" ? marker.title : "",
        note: typeof marker.note === "string" ? marker.note : "",
        spriteIndex: clampMarkerSpriteIndex(marker.spriteIndex ?? 0),
      }
    })
    .filter((entry): entry is MarkerData => entry !== null)

  const zones: ZoneData[] = Array.isArray(source.zones)
    ? source.zones
        .map((entry, index) => {
          if (!entry || typeof entry !== "object") {
            return null
          }

          const zone = entry as Partial<ZoneData> & {
            bounds?: unknown
          }
          const points = parseZonePoints(zone)

          if (!points) {
            return null
          }

          return {
            id: typeof zone.id === "string" && zone.id ? zone.id : crypto.randomUUID(),
            name:
              typeof zone.name === "string" && zone.name.trim()
                ? zone.name.trim()
                : `Zone ${index + 1}`,
            discovered: Boolean(zone.discovered),
            points,
          }
        })
        .filter((entry): entry is ZoneData => entry !== null)
    : []

  return { markers, zones }
}

export function saveLocal(payload: MapPayload): void {
  localStorage.setItem(MAP_CONFIG.storageKey, JSON.stringify(payload))
}

export function loadLocal(): { markers: MarkerData[]; zones: ZoneData[] } | null {
  const raw = localStorage.getItem(MAP_CONFIG.storageKey)

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)
    return normalizePayload(parsed)
  } catch {
    return null
  }
}
