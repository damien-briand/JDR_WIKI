import { useEffect, useMemo, useRef } from "react"
import L, { type LatLngExpression, type LatLngTuple, type Map as LeafletMap } from "leaflet"
import "leaflet/dist/leaflet.css"
import { MAP_CONFIG, TILESET_URL } from "../constants/map"
import {
  MARKER_CELL_HEIGHT,
  MARKER_CELL_WIDTH,
  MARKER_SPRITE,
  clampMarkerSpriteIndex,
  spriteBackgroundPosition,
  spriteBackgroundSize,
} from "../constants/markers"
import { isPointInRing } from "../utils/geo"
import type { MarkerData, ZoneData } from "../types/map"

type MapViewProps = {
  markers: MarkerData[]
  zones: ZoneData[]
  editEnabled: boolean
  zoneDrawEnabled: boolean
  showGrid: boolean
  gridScale: number
  showHexGrid: boolean
  hexGridScale: number
  showProgressMasks: boolean
  zoneDraftPoints: LatLngTuple[]
  onMapAddMarker: (lat: number, lng: number) => void
  onMapAddZonePoint: (lat: number, lng: number) => void
  onDeleteMarker: (markerId: string) => void
  onEditMarker: (markerId: string, title: string, note: string) => void
}

function gridStepForZoom(zoom: number): number {
  if (zoom >= 16) return 0.008
  if (zoom >= 15) return 0.015
  if (zoom >= 14) return 0.03
  if (zoom >= 13) return 0.06
  return 0.2
}

function hexStepForZoom(zoom: number): number {
  if (zoom >= 16) return 0.007
  if (zoom >= 15) return 0.013
  if (zoom >= 14) return 0.025
  if (zoom >= 13) return 0.05
  return 0.16
}

function markerVisible(marker: MarkerData, zones: ZoneData[]): boolean {
  if (zones.length === 0) {
    return true
  }

  const discovered = zones.filter((zone) => zone.discovered)

  if (discovered.length === 0) {
    return false
  }

  return discovered.some((zone) => isPointInRing([marker.lat, marker.lng], zone.points))
}

function markerPopupHtml(marker: MarkerData): string {
  const title = marker.title.trim() || "Point d'interet"
  const note = marker.note.trim() || "Aucune note"

  return `
    <div class="popup">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(note)}</p>
      <div class="popup-actions">
        <button type="button" data-action="edit" data-id="${marker.id}">Modifier</button>
        <button type="button" data-action="delete" data-id="${marker.id}">Supprimer</button>
      </div>
    </div>
  `
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function createSpriteIcon(spriteIndex: number): L.DivIcon {
  return L.divIcon({
    className: "marker-sprite-wrapper",
    html: `<span class="marker-sprite" style="background-image:url(${MARKER_SPRITE.url});background-size:${spriteBackgroundSize(MARKER_CELL_WIDTH, MARKER_CELL_HEIGHT)};background-position:${spriteBackgroundPosition(spriteIndex, MARKER_CELL_WIDTH, MARKER_CELL_HEIGHT)};"></span>`,
    iconSize: [MARKER_CELL_WIDTH, MARKER_CELL_HEIGHT],
    iconAnchor: [MARKER_CELL_WIDTH / 2, MARKER_CELL_HEIGHT - 6],
    popupAnchor: [0, -(MARKER_CELL_HEIGHT - 10)],
    tooltipAnchor: [0, -(MARKER_CELL_HEIGHT - 12)],
  })
}

export function MapView({
  markers,
  zones,
  editEnabled,
  zoneDrawEnabled,
  showGrid,
  gridScale,
  showHexGrid,
  hexGridScale,
  showProgressMasks,
  zoneDraftPoints,
  onMapAddMarker,
  onMapAddZonePoint,
  onDeleteMarker,
  onEditMarker,
}: MapViewProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markerLayersRef = useRef<Map<string, L.Marker>>(new Map())
  const markerIconCacheRef = useRef<Map<number, L.DivIcon>>(new Map())
  const zoneLayersRef = useRef<Map<string, L.Polygon>>(new Map())
  const gridLayerRef = useRef<L.LayerGroup | null>(null)
  const hexLayerRef = useRef<L.LayerGroup | null>(null)
  const fogLayerRef = useRef<L.Polygon | null>(null)
  const draftLineRef = useRef<L.Polyline | null>(null)

  const worldRing = useMemo<LatLngTuple[]>(() => {
    return [
      [MAP_CONFIG.worldBounds[0][0], MAP_CONFIG.worldBounds[0][1]],
      [MAP_CONFIG.worldBounds[0][0], MAP_CONFIG.worldBounds[1][1]],
      [MAP_CONFIG.worldBounds[1][0], MAP_CONFIG.worldBounds[1][1]],
      [MAP_CONFIG.worldBounds[1][0], MAP_CONFIG.worldBounds[0][1]],
    ]
  }, [])

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) {
      return
    }

    const map = L.map(mapElementRef.current, {
      minZoom: MAP_CONFIG.minZoom,
      maxZoom: MAP_CONFIG.maxZoom,
      zoomSnap: 0.25,
      zoomControl: true,
    })

    L.tileLayer(TILESET_URL, {
      minZoom: MAP_CONFIG.minZoom,
      maxZoom: MAP_CONFIG.maxZoom,
      noWrap: true,
      attribution: "Map tiles: IGN/MapGenie",
    }).addTo(map)

    map.setMaxBounds(MAP_CONFIG.worldBounds)
    map.setView(MAP_CONFIG.initialCenter, MAP_CONFIG.initialZoom)
    map.createPane("fogPane")
    map.createPane("gridPane")
    map.createPane("hexPane")

    const fogPane = map.getPane("fogPane")
    if (fogPane) {
      fogPane.style.zIndex = "550"
    }

    const gridPane = map.getPane("gridPane")
    if (gridPane) {
      gridPane.style.zIndex = "560"
      gridPane.style.pointerEvents = "none"
    }

    const hexPane = map.getPane("hexPane")
    if (hexPane) {
      hexPane.style.zIndex = "565"
      hexPane.style.pointerEvents = "none"
    }

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) {
      return
    }

    const clickHandler = (event: L.LeafletMouseEvent) => {
      if (zoneDrawEnabled) {
        onMapAddZonePoint(event.latlng.lat, event.latlng.lng)
        return
      }

      if (editEnabled) {
        onMapAddMarker(event.latlng.lat, event.latlng.lng)
      }
    }

    map.on("click", clickHandler)

    return () => {
      map.off("click", clickHandler)
    }
  }, [editEnabled, onMapAddMarker, onMapAddZonePoint, zoneDrawEnabled])

  useEffect(() => {
    const map = mapRef.current
    if (!map) {
      return
    }

    const layerMap = markerLayersRef.current
    const markerById = new Map(markers.map((entry) => [entry.id, entry]))

    layerMap.forEach((layer, id) => {
      if (!markerById.has(id)) {
        map.removeLayer(layer)
        layerMap.delete(id)
      }
    })

    markers.forEach((markerData) => {
      const spriteIndex = clampMarkerSpriteIndex(markerData.spriteIndex)
      const icon = markerIconCacheRef.current.get(spriteIndex) ?? createSpriteIcon(spriteIndex)
      if (!markerIconCacheRef.current.has(spriteIndex)) {
        markerIconCacheRef.current.set(spriteIndex, icon)
      }

      const visible = markerVisible(markerData, zones)
      const existing = layerMap.get(markerData.id)

      if (existing) {
        existing.setLatLng([markerData.lat, markerData.lng])
        existing.setIcon(icon)
        existing.setPopupContent(markerPopupHtml(markerData))

        if (markerData.title.trim()) {
          existing.bindTooltip(markerData.title.trim(), {
            direction: "top",
            offset: [0, -12],
          })
        } else {
          existing.unbindTooltip()
        }

        if (visible && !map.hasLayer(existing)) {
          existing.addTo(map)
        }

        if (!visible && map.hasLayer(existing)) {
          map.removeLayer(existing)
        }

        return
      }

      const marker = L.marker([markerData.lat, markerData.lng], {
        title: markerData.title,
        icon,
      })

      if (visible) {
        marker.addTo(map)
      }

      if (markerData.title.trim()) {
        marker.bindTooltip(markerData.title.trim(), {
          direction: "top",
          offset: [0, -12],
        })
      }

      marker.bindPopup(markerPopupHtml(markerData), { maxWidth: 280 })

      marker.on("popupopen", () => {
        const popupEl = marker.getPopup()?.getElement()
        if (!popupEl) {
          return
        }

        const deleteBtn = popupEl.querySelector<HTMLButtonElement>(
          `button[data-action='delete'][data-id='${markerData.id}']`,
        )
        if (deleteBtn) {
          deleteBtn.onclick = () => {
            onDeleteMarker(markerData.id)
          }
        }

        const editBtn = popupEl.querySelector<HTMLButtonElement>(
          `button[data-action='edit'][data-id='${markerData.id}']`,
        )
        if (editBtn) {
          editBtn.onclick = () => {
            const current = markerById.get(markerData.id)
            if (!current) {
              return
            }

            const nextTitle = window.prompt("Nouveau nom du marqueur:", current.title)
            if (nextTitle === null) {
              return
            }

            const nextNote = window.prompt("Nouvelle note:", current.note)
            if (nextNote === null) {
              return
            }

            onEditMarker(markerData.id, nextTitle.trim(), nextNote.trim())
          }
        }
      })

      layerMap.set(markerData.id, marker)
    })
  }, [markers, onDeleteMarker, onEditMarker, zones])

  useEffect(() => {
    const map = mapRef.current
    if (!map) {
      return
    }

    const layerMap = zoneLayersRef.current
    const zoneById = new Map(zones.map((zone) => [zone.id, zone]))

    layerMap.forEach((layer, id) => {
      if (!zoneById.has(id)) {
        map.removeLayer(layer)
        layerMap.delete(id)
      }
    })

    zones.forEach((zone) => {
      if (!zone.discovered) {
        const hiddenLayer = layerMap.get(zone.id)
        if (hiddenLayer) {
          map.removeLayer(hiddenLayer)
          layerMap.delete(zone.id)
        }
        return
      }

      const style: L.PathOptions = {
        color: "#d9b47a",
        weight: 2,
        fillColor: "#f5e3b5",
        fillOpacity: 0.18,
      }

      const existing = layerMap.get(zone.id)
      if (existing) {
        existing.setLatLngs(zone.points as LatLngExpression[])
        existing.setStyle(style)
        if (!map.hasLayer(existing)) {
          existing.addTo(map)
        }
      } else {
        const polygon = L.polygon(zone.points as LatLngExpression[], style).addTo(map)
        layerMap.set(zone.id, polygon)
      }
    })
  }, [zones])

  useEffect(() => {
    const map = mapRef.current
    if (!map) {
      return
    }

    const discoveredRings = zones.filter((zone) => zone.discovered).map((zone) => zone.points)

    if (fogLayerRef.current) {
      map.removeLayer(fogLayerRef.current)
      fogLayerRef.current = null
    }

    if (!showProgressMasks || zones.length === 0) {
      return
    }

    const fog = L.polygon([worldRing, ...discoveredRings], {
      pane: "fogPane",
      stroke: false,
      fillRule: "evenodd",
      fillColor: "#070605",
      fillOpacity: 0.92,
      interactive: false,
    })

    fog.addTo(map)
    fogLayerRef.current = fog
  }, [showProgressMasks, worldRing, zones])

  useEffect(() => {
    const map = mapRef.current
    if (!map) {
      return
    }

    if (!gridLayerRef.current) {
      gridLayerRef.current = L.layerGroup()
    }

    const gridLayer = gridLayerRef.current
    const maxLat = MAP_CONFIG.worldBounds[1][0]
    const minLat = MAP_CONFIG.worldBounds[0][0]
    const maxLng = MAP_CONFIG.worldBounds[1][1]
    const minLng = MAP_CONFIG.worldBounds[0][1]

    const renderGrid = () => {
      if (!gridLayer) {
        return
      }

      gridLayer.clearLayers()

      if (!showGrid) {
        if (map.hasLayer(gridLayer)) {
          map.removeLayer(gridLayer)
        }
        return
      }

      const bounds = map.getBounds()
      const south = Math.max(bounds.getSouth(), minLat)
      const north = Math.min(bounds.getNorth(), maxLat)
      const west = Math.max(bounds.getWest(), minLng)
      const east = Math.min(bounds.getEast(), maxLng)
      const step = gridStepForZoom(map.getZoom()) * gridScale
      const majorEvery = 5

      const startLat = Math.floor(south / step) * step
      const startLng = Math.floor(west / step) * step

      let latCount = 0
      for (let lat = startLat; lat <= north + step && latCount < 500; lat += step) {
        const roundedLat = Number(lat.toFixed(6))
        const lineIndex = Math.round(roundedLat / step)
        const major = Math.abs(lineIndex % majorEvery) === 0
        L.polyline(
          [
            [roundedLat, west],
            [roundedLat, east],
          ],
          {
            pane: "gridPane",
            color: major ? "#000000" : "#1b120b",
            weight: major ? 1.8 : 1.2,
            opacity: major ? 0.78 : 0.52,
            interactive: false,
          },
        ).addTo(gridLayer)
        latCount += 1
      }

      let lngCount = 0
      for (let lng = startLng; lng <= east + step && lngCount < 500; lng += step) {
        const roundedLng = Number(lng.toFixed(6))
        const lineIndex = Math.round(roundedLng / step)
        const major = Math.abs(lineIndex % majorEvery) === 0
        L.polyline(
          [
            [south, roundedLng],
            [north, roundedLng],
          ],
          {
            pane: "gridPane",
            color: major ? "#000000" : "#1b120b",
            weight: major ? 1.8 : 1.2,
            opacity: major ? 0.78 : 0.52,
            interactive: false,
          },
        ).addTo(gridLayer)
        lngCount += 1
      }

      if (!map.hasLayer(gridLayer)) {
        gridLayer.addTo(map)
      }
    }

    renderGrid()
    map.on("moveend", renderGrid)
    map.on("zoomend", renderGrid)

    return () => {
      map.off("moveend", renderGrid)
      map.off("zoomend", renderGrid)
      if (!showGrid && map.hasLayer(gridLayer)) {
        map.removeLayer(gridLayer)
      }
    }
  }, [gridScale, showGrid])

  useEffect(() => {
    const map = mapRef.current
    if (!map) {
      return
    }

    if (!hexLayerRef.current) {
      hexLayerRef.current = L.layerGroup()
    }

    const hexLayer = hexLayerRef.current
    const originLat = MAP_CONFIG.worldBounds[0][0]
    const originLng = MAP_CONFIG.worldBounds[0][1]

    const buildHexagon = (
      centerLat: number,
      centerLng: number,
      radius: number,
    ): LatLngExpression[] => {
      const points: LatLngExpression[] = []
      for (let index = 0; index < 6; index += 1) {
        const angle = (Math.PI / 180) * (60 * index - 30)
        const dLng = radius * Math.cos(angle)
        const dLat = radius * Math.sin(angle)
        points.push([centerLat + dLat, centerLng + dLng])
      }
      return points
    }

    const renderHexGrid = () => {
      hexLayer.clearLayers()

      if (!showHexGrid) {
        if (map.hasLayer(hexLayer)) {
          map.removeLayer(hexLayer)
        }
        return
      }

      const bounds = map.getBounds()
      const zoom = map.getZoom()
      const radius = hexStepForZoom(zoom) * hexGridScale
      
      const xOffset = radius * Math.sqrt(3)
      const yOffset = radius * 1.5

      const south = Math.max(bounds.getSouth() - radius * 2, originLat)
      const north = Math.min(bounds.getNorth() + radius * 2, MAP_CONFIG.worldBounds[1][0])
      const west = Math.max(bounds.getWest() - radius * 2, originLng)
      const east = Math.min(bounds.getEast() + radius * 2, MAP_CONFIG.worldBounds[1][1])

      const startRow = Math.floor((south - originLat) / yOffset)
      const endRow = Math.ceil((north - originLat) / yOffset)
      const startCol = Math.floor((west - originLng) / xOffset)
      const endCol = Math.ceil((east - originLng) / xOffset)

      for (let row = startRow; row <= endRow; row += 1) {
        const centerLat = originLat + row * yOffset
        const rowOffset = Math.abs(row % 2) === 1 ? xOffset / 2 : 0

        for (let col = startCol; col <= endCol; col += 1) {
          const centerLng = originLng + col * xOffset + rowOffset

          hexLayer.addLayer(
            L.polygon(buildHexagon(centerLat, centerLng, radius), {
              pane: "hexPane",
              color: "#000000",
              weight: 1.4,
              opacity: 0.72,
              fillColor: "#6f4a1d",
              fillOpacity: 0.08,
              interactive: false,
            }),
          )
        }
      }

      if (!map.hasLayer(hexLayer)) {
        hexLayer.addTo(map)
      }
    }

    renderHexGrid()
    map.on("moveend", renderHexGrid)
    map.on("zoomend", renderHexGrid)

    return () => {
      map.off("moveend", renderHexGrid)
      map.off("zoomend", renderHexGrid)
      if (!showHexGrid && map.hasLayer(hexLayer)) {
        map.removeLayer(hexLayer)
      }
    }
  }, [hexGridScale, showHexGrid])

  useEffect(() => {
    const map = mapRef.current
    if (!map) {
      return
    }

    if (draftLineRef.current) {
      map.removeLayer(draftLineRef.current)
      draftLineRef.current = null
    }

    if (!zoneDrawEnabled || zoneDraftPoints.length < 2) {
      return
    }

    draftLineRef.current = L.polyline(zoneDraftPoints as LatLngExpression[], {
      color: "#efbe74",
      weight: 2,
      dashArray: "6 6",
    }).addTo(map)
  }, [zoneDraftPoints, zoneDrawEnabled])

  return <div id="map" ref={mapElementRef} className="map-canvas" />
}
