export type LatLngTuple = [number, number]

export type MarkerData = {
  id: string
  lat: number
  lng: number
  title: string
  note: string
  spriteIndex: number
}

export type ZoneData = {
  id: string
  name: string
  discovered: boolean
  points: LatLngTuple[]
}

export type MapPayload = {
  version: number
  map: string
  exportedAt: string
  markers: MarkerData[]
  zones: ZoneData[]
}
