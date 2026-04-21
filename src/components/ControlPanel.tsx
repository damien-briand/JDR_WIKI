import type { ChangeEvent } from "react"
import {
  MARKER_SPRITE,
  MARKER_TOTAL,
  spriteBackgroundPosition,
  spriteBackgroundSize,
} from "../constants/markers"
import type { ZoneData } from "../types/map"

type ControlPanelProps = {
  markerTitle: string
  markerNote: string
  markerSpriteIndex: number
  zoneName: string
  zones: ZoneData[]
  editEnabled: boolean
  zoneDrawEnabled: boolean
  showGrid: boolean
  gridScale: number
  showHexGrid: boolean
  hexGridScale: number
  showProgressMasks: boolean
  status: string
  onMarkerTitleChange: (value: string) => void
  onMarkerNoteChange: (value: string) => void
  onMarkerSpriteChange: (value: number) => void
  onZoneNameChange: (value: string) => void
  onToggleEdit: () => void
  onToggleZoneDraw: () => void
  onToggleGrid: () => void
  onGridScaleChange: (value: number) => void
  onToggleHexGrid: () => void
  onHexGridScaleChange: (value: number) => void
  onToggleProgressMasks: () => void
  onFinishZone: () => void
  onClearZones: () => void
  onToggleZoneDiscovery: (zoneId: string) => void
  onDeleteZone: (zoneId: string) => void
  onExportJson: () => void
  onImportFile: (file: File) => void
  onSaveLocal: () => void
  onClearMarkers: () => void
}

export function ControlPanel({
  markerTitle,
  markerNote,
  markerSpriteIndex,
  zoneName,
  zones,
  editEnabled,
  zoneDrawEnabled,
  showGrid,
  gridScale,
  showHexGrid,
  hexGridScale,
  showProgressMasks,
  status,
  onMarkerTitleChange,
  onMarkerNoteChange,
  onMarkerSpriteChange,
  onZoneNameChange,
  onToggleEdit,
  onToggleZoneDraw,
  onToggleGrid,
  onGridScaleChange,
  onToggleHexGrid,
  onHexGridScaleChange,
  onToggleProgressMasks,
  onFinishZone,
  onClearZones,
  onToggleZoneDiscovery,
  onDeleteZone,
  onExportJson,
  onImportFile,
  onSaveLocal,
  onClearMarkers,
}: ControlPanelProps) {
  const thumbWidth = 24
  const thumbHeight = 32
  const thumbBackgroundSize = spriteBackgroundSize(thumbWidth, thumbHeight)

  const handleImportChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    onImportFile(file)
    event.target.value = ""
  }

  return (
    <aside className="panel">
      <h1>Carte JDR Penumbra</h1>
      <p className="muted">Fond The Lands Between sans pings IGN.</p>

      <div className="group">
        <label htmlFor="edit-mode">Mode edition des marqueurs</label>
        <button id="edit-mode" type="button" className="btn btn-alt" onClick={onToggleEdit}>
          {editEnabled ? "Desactiver l'ajout par clic" : "Activer l'ajout par clic"}
        </button>
      </div>

      <div className="group">
        <label htmlFor="grid-toggle">Quadrillage de reference</label>
        <button id="grid-toggle" type="button" className="btn btn-alt" onClick={onToggleGrid}>
          {showGrid ? "Masquer la grille" : "Afficher la grille"}
        </button>
        <div className="grid-scale-row">
          <label htmlFor="grid-scale" className="grid-scale-label">Taille de la grille</label>
          <input
            id="grid-scale"
            type="range"
            min={0.1}
            max={3}
            step={0.05}
            value={gridScale}
            onChange={(event) => onGridScaleChange(Number(event.target.value))}
          />
          <p className="muted">x{gridScale.toFixed(2)} ({gridScale < 1 ? "plus fine" : gridScale > 1 ? "plus large" : "normale"})</p>
        </div>
      </div>

      <div className="group">
        <label htmlFor="hex-grid-toggle">Hexagones de reference</label>
        <button id="hex-grid-toggle" type="button" className="btn btn-alt" onClick={onToggleHexGrid}>
          {showHexGrid ? "Masquer les hexagones" : "Afficher les hexagones"}
        </button>
        <div className="grid-scale-row">
          <label htmlFor="hex-grid-scale" className="grid-scale-label">Taille des hexagones</label>
          <input
            id="hex-grid-scale"
            type="range"
            min={0.1}
            max={3}
            step={0.05}
            value={hexGridScale}
            onChange={(event) => onHexGridScaleChange(Number(event.target.value))}
          />
          <p className="muted">x{hexGridScale.toFixed(2)} ({hexGridScale < 1 ? "plus fins" : hexGridScale > 1 ? "plus grands" : "normaux"})</p>
        </div>
      </div>

      <div className="group">
        <label htmlFor="progress-mask-toggle">Masques de progression</label>
        <button
          id="progress-mask-toggle"
          type="button"
          className="btn btn-alt"
          onClick={onToggleProgressMasks}
        >
          {showProgressMasks ? "Masquer les masques" : "Afficher les masques"}
        </button>
      </div>

      <div className="group">
        <label>Type de ping</label>
        <div className="marker-picker" role="listbox" aria-label="Choix du ping">
          {Array.from({ length: MARKER_TOTAL }, (_, index) => {
            const selected = index === markerSpriteIndex
            return (
              <button
                key={index}
                type="button"
                role="option"
                aria-selected={selected}
                className={selected ? "marker-option active" : "marker-option"}
                onClick={() => onMarkerSpriteChange(index)}
                title={`Ping ${index + 1}`}
              >
                <span
                  className="marker-thumb"
                  style={{
                    width: `${thumbWidth}px`,
                    height: `${thumbHeight}px`,
                    backgroundImage: `url(${MARKER_SPRITE.url})`,
                    backgroundSize: thumbBackgroundSize,
                    backgroundPosition: spriteBackgroundPosition(index, thumbWidth, thumbHeight),
                  }}
                />
              </button>
            )
          })}
        </div>
        <p className="muted">Ping selectionne: #{markerSpriteIndex + 1}</p>
      </div>

      <div className="group">
        <label htmlFor="marker-title">Nom du prochain marqueur</label>
        <input
          id="marker-title"
          value={markerTitle}
          onChange={(event) => onMarkerTitleChange(event.target.value)}
          placeholder="Ex: Village de Brume"
        />
      </div>

      <div className="group">
        <label htmlFor="marker-note">Note associee</label>
        <textarea
          id="marker-note"
          value={markerNote}
          onChange={(event) => onMarkerNoteChange(event.target.value)}
          placeholder="PNJ important, quete secondaire, danger..."
        />
      </div>

      <div className="group">
        <label htmlFor="zone-name">Nom de la prochaine zone</label>
        <input
          id="zone-name"
          value={zoneName}
          onChange={(event) => onZoneNameChange(event.target.value)}
          placeholder="Ex: Limgrave Ouest"
        />
      </div>

      <div className="group group-row">
        <button type="button" className="btn btn-alt" onClick={onToggleZoneDraw}>
          {zoneDrawEnabled ? "Annuler dessin" : "Dessiner une zone"}
        </button>
        <button type="button" className="btn btn-alt" onClick={onFinishZone} disabled={!zoneDrawEnabled}>
          Terminer polygone
        </button>
      </div>

      <div className="group">
        <button type="button" className="btn btn-alt" onClick={onClearZones}>
          Supprimer toutes les zones
        </button>
      </div>

      <div className="group">
        <label>Zones et progression</label>
        <div className="zones-list">
          {zones.length === 0 ? <p className="muted">Aucune zone definie.</p> : null}
          {zones.map((zone) => (
            <div className="zone-item" key={zone.id}>
              <div className="zone-item-title">
                {zone.name} - {zone.discovered ? "revelee" : "cachee"}
              </div>
              <div className="zone-item-actions">
                <button
                  type="button"
                  className={zone.discovered ? "btn btn-alt" : "btn"}
                  onClick={() => onToggleZoneDiscovery(zone.id)}
                >
                  {zone.discovered ? "Cacher" : "Reveler"}
                </button>
                <button
                  type="button"
                  className="btn btn-alt"
                  onClick={() => onDeleteZone(zone.id)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="group group-row">
        <button type="button" className="btn" onClick={onExportJson}>
          Exporter JSON
        </button>
        <label className="btn btn-alt import-label" htmlFor="import-json">
          Importer JSON
        </label>
        <input id="import-json" type="file" hidden accept="application/json" onChange={handleImportChange} />
      </div>

      <div className="group group-row">
        <button type="button" className="btn btn-alt" onClick={onSaveLocal}>
          Sauvegarder local
        </button>
        <button type="button" className="btn btn-alt" onClick={onClearMarkers}>
          Supprimer marqueurs
        </button>
      </div>

      <p className="status">{status}</p>
      <p className="muted">Astuce: clic sur un marqueur pour le modifier/supprimer.</p>
      <p className="muted">
        En mode zone, clique sur la carte pour poser des points, puis termine le polygone.
      </p>
    </aside>
  )
}
