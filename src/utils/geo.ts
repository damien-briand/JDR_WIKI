import type { LatLngTuple } from "../types/map"

export function isPointInRing(point: LatLngTuple, ring: LatLngTuple[]): boolean {
  let inside = false
  const x = point[1]
  const y = point[0]

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][1]
    const yi = ring[i][0]
    const xj = ring[j][1]
    const yj = ring[j][0]

    const intersects =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi + Number.EPSILON) + xi

    if (intersects) {
      inside = !inside
    }
  }

  return inside
}

export function boundsToRing(bounds: [LatLngTuple, LatLngTuple]): LatLngTuple[] {
  const south = bounds[0][0]
  const west = bounds[0][1]
  const north = bounds[1][0]
  const east = bounds[1][1]

  return [
    [south, west],
    [south, east],
    [north, east],
    [north, west],
  ]
}
