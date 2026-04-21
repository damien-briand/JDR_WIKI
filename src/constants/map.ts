export const TILESET_URL =
  "https://tiles.mapgenie.io/games/elden-ring/the-lands-between/default-v5/{z}/{x}/{y}.jpg"

export const MAP_CONFIG = {
  mapId: "elden-ring-the-lands-between",
  storageKey: "penumbra-jdr-map-state-v2",
  minZoom: 9,
  maxZoom: 17,
  initialZoom: 13,
  initialCenter: [0.656762, -0.7623482] as [number, number],
  worldBounds: [
    [-85, -180],
    [85, 180],
  ] as [[number, number], [number, number]],
} as const
