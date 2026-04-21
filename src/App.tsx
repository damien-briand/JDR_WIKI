import { useCallback, useMemo, useState } from "react"
import { MAP_CONFIG } from "./constants/map"
import { clampMarkerSpriteIndex } from "./constants/markers"
import { ControlPanel } from "./components/ControlPanel"
import { MapView } from "./components/MapView"
import { buildPayload, loadLocal, normalizePayload, saveLocal } from "./utils/storage"
import type { MarkerData, ZoneData } from "./types/map"
import "./App.css"

function App() {
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
  const [status, setStatus] = useState(() =>
    initialData ? "Sauvegarde locale chargee." : "Pret. Active le mode edition pour poser des pings.",
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

      <main className="map-wrap" aria-label={`Carte ${MAP_CONFIG.mapId}`}>
        <MapView
          markers={markers}
          zones={zones}
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
      </main>
    </div>
  )
}

export default App
