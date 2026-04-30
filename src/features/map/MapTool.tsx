import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { MAP_CONFIG } from "../../constants/map"
import { clampMarkerSpriteIndex } from "../../constants/markers"
import { ControlPanel } from "../../components/ControlPanel"
import { MapView } from "../../components/MapView"
import { listLocations, type LocationRecord } from "../../api/locations"
import { listGroupLocationStates, type GroupLocationStatus, type GroupLocationStateRecord } from "../../api/groupLocationStates"
import { buildPayload, loadLocal, normalizePayload, saveLocal } from "../../utils/storage"
import type { MarkerData, ZoneData } from "../../types/map"

type MapToolProps = {
  activeGroupId: number | null
}

function effectiveGroupStatus(
  location: LocationRecord,
  stateByLocationId: Map<number, GroupLocationStateRecord>,
): GroupLocationStatus {
  const state = stateByLocationId.get(location.id)
  if (state) {
    return state.status
  }

  return location.is_discovered_default ? "discovered" : "undiscovered"
}

export function MapTool({ activeGroupId }: MapToolProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [initialData] = useState(() => loadLocal())
  const [markerTitle, setMarkerTitle] = useState("")
  const [markerNote, setMarkerNote] = useState("")
  const [markerSpriteIndex, setMarkerSpriteIndex] = useState(0)
  const [zoneName, setZoneName] = useState("")
  const [editEnabled, setEditEnabled] = useState(false)
  const [zoneDrawEnabled, setZoneDrawEnabled] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [gridScale, setGridScale] = useState(1)
  const [showHexGrid, setShowHexGrid] = useState(false)
  const [hexGridScale, setHexGridScale] = useState(1)
  const [showProgressMasks, setShowProgressMasks] = useState(true)
  const [zoneDraftPoints, setZoneDraftPoints] = useState<Array<[number, number]>>([])
  const [markers, setMarkers] = useState<MarkerData[]>(() => initialData?.markers ?? [])
  const [zones, setZones] = useState<ZoneData[]>(() => initialData?.zones ?? [])
  const [locations, setLocations] = useState<LocationRecord[]>([])
  const [groupLocationStatesStore, setGroupLocationStatesStore] = useState<
    | {
        groupId: number
        states: GroupLocationStateRecord[]
      }
    | null
  >(null)
  const [status, setStatus] = useState(() =>
    initialData ? "Sauvegarde locale chargee." : "Pret. Active le mode edition pour poser des pings.",
  )

  useEffect(() => {
    let cancelled = false

    listLocations()
      .then((data) => {
        if (!cancelled) {
          setLocations(data)
        }
      })
      .catch(() => {
        // Backend optionnel (dev) : la carte reste utilisable.
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    if (!activeGroupId) {
      return () => {
        cancelled = true
      }
    }

    listGroupLocationStates(activeGroupId)
      .then((data) => {
        if (!cancelled) {
          setGroupLocationStatesStore({ groupId: activeGroupId, states: data })
        }
      })
      .catch(() => {
        // Backend optionnel (dev) : si l'endpoint n'est pas dispo, on n'applique pas d'overrides.
      })

    return () => {
      cancelled = true
    }
  }, [activeGroupId])

  const groupLocationStates = useMemo(() => {
    if (!activeGroupId || !groupLocationStatesStore) {
      return []
    }

    if (groupLocationStatesStore.groupId !== activeGroupId) {
      return []
    }

    return groupLocationStatesStore.states
  }, [activeGroupId, groupLocationStatesStore])

  const groupStateByLocationId = useMemo(() => {
    return new Map(groupLocationStates.map((entry) => [entry.location_id, entry]))
  }, [groupLocationStates])

  const focusLocationId = useMemo(() => {
    const raw = searchParams.get("loc")
    if (!raw) {
      return null
    }

    const parsed = Number.parseInt(raw, 10)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null
  }, [searchParams])

  const focusedLocation = useMemo(() => {
    if (!focusLocationId) {
      return null
    }
    return locations.find((loc) => loc.id === focusLocationId) ?? null
  }, [focusLocationId, locations])

  const focusLatLng = useMemo(() => {
    if (!focusedLocation) {
      return null
    }

    if (typeof focusedLocation.map_x !== "number" || typeof focusedLocation.map_y !== "number") {
      return null
    }

    return [focusedLocation.map_y, focusedLocation.map_x] as [number, number]
  }, [focusedLocation])

  const locationPoints = useMemo(() => {
    const focusId = focusLocationId
    const hasActiveGroup = Boolean(activeGroupId)

    return locations
      .filter((loc) => typeof loc.map_x === "number" && typeof loc.map_y === "number")
      .filter((loc) => {
        if (!hasActiveGroup) {
          return true
        }

        if (focusId && loc.id === focusId) {
          return true
        }

        return effectiveGroupStatus(loc, groupStateByLocationId) !== "undiscovered"
      })
      .map((loc) => ({
        id: loc.id,
        name: loc.name,
        lat: loc.map_y as number,
        lng: loc.map_x as number,
      }))
  }, [activeGroupId, focusLocationId, groupStateByLocationId, locations])

  const openLocation = useCallback(
    (locationId: number) => {
      navigate(`/world/create?select=${locationId}`)
    },
    [navigate],
  )

  const addMarker = useCallback(
    (lat: number, lng: number) => {
      setMarkers((previous) => {
        const next: MarkerData[] = [
          ...previous,
          {
            id: crypto.randomUUID(),
            lat,
            lng,
            title: markerTitle.trim(),
            note: markerNote.trim(),
            spriteIndex: markerSpriteIndex,
          },
        ]
        return next
      })
      setStatus("Marqueur ajoute.")
    },
    [markerNote, markerSpriteIndex, markerTitle],
  )

  const updateMarkerSpriteIndex = useCallback((nextIndex: number) => {
    setMarkerSpriteIndex(clampMarkerSpriteIndex(nextIndex))
  }, [])

  const addZonePoint = useCallback((lat: number, lng: number) => {
    setZoneDraftPoints((previous) => [...previous, [lat, lng]])
  }, [])

  const finishZone = useCallback(() => {
    if (!zoneDrawEnabled) {
      return
    }

    if (zoneDraftPoints.length < 3) {
      setStatus("Il faut au moins 3 points pour creer un polygone.")
      return
    }

    const nextName = zoneName.trim() || `Zone ${zones.length + 1}`

    setZones((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        name: nextName,
        discovered: false,
        points: zoneDraftPoints,
      },
    ])

    setZoneDrawEnabled(false)
    setZoneDraftPoints([])
    setStatus(`Zone ajoutee: ${nextName}. Clique sur Reveler quand les joueurs obtiennent la carte.`)
  }, [zoneDrawEnabled, zoneDraftPoints, zoneName, zones.length])

  const clearZones = useCallback(() => {
    setZones([])
    setZoneDraftPoints([])
    setZoneDrawEnabled(false)
    setStatus("Toutes les zones ont ete supprimees.")
  }, [])

  const clearMarkers = useCallback(() => {
    setMarkers([])
    setStatus("Tous les marqueurs ont ete supprimes.")
  }, [])

  const toggleEdit = useCallback(() => {
    setEditEnabled((previous) => {
      const next = !previous
      setStatus(next ? "Mode edition actif." : "Mode edition desactive.")
      return next
    })

    setZoneDrawEnabled(false)
    setZoneDraftPoints([])
  }, [])

  const toggleZoneDraw = useCallback(() => {
    setZoneDrawEnabled((previous) => {
      const next = !previous
      setStatus(
        next
          ? "Dessin de zone actif: clique sur la carte pour poser les points."
          : "Dessin de zone annule.",
      )
      return next
    })

    setEditEnabled(false)
    setZoneDraftPoints([])
  }, [])

  const toggleGrid = useCallback(() => {
    setShowGrid((previous) => {
      const next = !previous
      setStatus(next ? "Grille activee." : "Grille masquee.")
      return next
    })
  }, [])

  const toggleProgressMasks = useCallback(() => {
    setShowProgressMasks((previous) => {
      const next = !previous
      setStatus(next ? "Masques de progression affiches." : "Masques de progression masques.")
      return next
    })
  }, [])

  const updateGridScale = useCallback((value: number) => {
    const clamped = Math.max(0.1, Math.min(3, value))
    setGridScale(clamped)
    setStatus(`Taille de grille: x${clamped.toFixed(2)}.`)
  }, [])

  const toggleHexGrid = useCallback(() => {
    setShowHexGrid((previous) => {
      const next = !previous
      setStatus(next ? "Hexagones activees." : "Hexagones masquees.")
      return next
    })
  }, [])

  const updateHexGridScale = useCallback((value: number) => {
    const clamped = Math.max(0.1, Math.min(3, value))
    setHexGridScale(clamped)
    setStatus(`Taille des hexagones: x${clamped.toFixed(2)}.`)
  }, [])

  const toggleZoneDiscovery = useCallback((zoneId: string) => {
    setZones((previous) => {
      const next = previous.map((zone) =>
        zone.id === zoneId ? { ...zone, discovered: !zone.discovered } : zone,
      )
      const changed = next.find((zone) => zone.id === zoneId)
      if (changed) {
        setStatus(changed.discovered ? `Zone revelee: ${changed.name}.` : `Zone cachee: ${changed.name}.`)
      }
      return next
    })
  }, [])

  const deleteZone = useCallback((zoneId: string) => {
    setZones((previous) => previous.filter((zone) => zone.id !== zoneId))
    setStatus("Zone supprimee.")
  }, [])

  const editMarker = useCallback((markerId: string, title: string, note: string) => {
    setMarkers((previous) =>
      previous.map((marker) =>
        marker.id === markerId ? { ...marker, title, note } : marker,
      ),
    )
    setStatus("Marqueur modifie.")
  }, [])

  const deleteMarker = useCallback((markerId: string) => {
    setMarkers((previous) => previous.filter((marker) => marker.id !== markerId))
    setStatus("Marqueur supprime.")
  }, [])

  const payload = useMemo(() => buildPayload(markers, zones), [markers, zones])

  const exportJson = useCallback(() => {
    const json = JSON.stringify(payload, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "penumbra-jdr-map.json"
    anchor.click()
    URL.revokeObjectURL(url)
    setStatus("Export JSON termine.")
  }, [payload])

  const importFile = useCallback((file: File) => {
    const reader = new FileReader()

    reader.onload = () => {
      try {
        const content = String(reader.result ?? "{}")
        const parsed = JSON.parse(content)
        const normalized = normalizePayload(parsed)
        setMarkers(normalized.markers)
        setZones(normalized.zones)
        setZoneDraftPoints([])
        setZoneDrawEnabled(false)
        setEditEnabled(false)
        setStatus("Import JSON termine.")
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erreur inconnue."
        setStatus(`Erreur import JSON: ${message}`)
      }
    }

    reader.readAsText(file)
  }, [])

  const saveCurrentState = useCallback(() => {
    saveLocal(payload)
    setStatus("Sauvegarde locale effectuee.")
  }, [payload])

  return (
    <div className="app-shell">
      <ControlPanel
        markerTitle={markerTitle}
        markerNote={markerNote}
        markerSpriteIndex={markerSpriteIndex}
        zoneName={zoneName}
        zones={zones}
        editEnabled={editEnabled}
        zoneDrawEnabled={zoneDrawEnabled}
        showGrid={showGrid}
        gridScale={gridScale}
        showHexGrid={showHexGrid}
        hexGridScale={hexGridScale}
        showProgressMasks={showProgressMasks}
        status={status}
        onMarkerTitleChange={setMarkerTitle}
        onMarkerNoteChange={setMarkerNote}
        onMarkerSpriteChange={updateMarkerSpriteIndex}
        onZoneNameChange={setZoneName}
        onToggleEdit={toggleEdit}
        onToggleZoneDraw={toggleZoneDraw}
        onToggleGrid={toggleGrid}
        onGridScaleChange={updateGridScale}
        onToggleHexGrid={toggleHexGrid}
        onHexGridScaleChange={updateHexGridScale}
        onToggleProgressMasks={toggleProgressMasks}
        onFinishZone={finishZone}
        onClearZones={clearZones}
        onToggleZoneDiscovery={toggleZoneDiscovery}
        onDeleteZone={deleteZone}
        onExportJson={exportJson}
        onImportFile={importFile}
        onSaveLocal={saveCurrentState}
        onClearMarkers={clearMarkers}
      />

      <div className="map-wrap" role="region" aria-label={`Carte ${MAP_CONFIG.mapId}`}>
        <MapView
          markers={markers}
          zones={zones}
          locationPoints={locationPoints}
          focusedLocationId={focusLocationId}
          focusLatLng={focusLatLng}
          onOpenLocation={openLocation}
          editEnabled={editEnabled}
          zoneDrawEnabled={zoneDrawEnabled}
          showGrid={showGrid}
          gridScale={gridScale}
          showHexGrid={showHexGrid}
          hexGridScale={hexGridScale}
          showProgressMasks={showProgressMasks}
          zoneDraftPoints={zoneDraftPoints}
          onMapAddMarker={addMarker}
          onMapAddZonePoint={addZonePoint}
          onDeleteMarker={deleteMarker}
          onEditMarker={editMarker}
        />
      </div>
    </div>
  )
}
