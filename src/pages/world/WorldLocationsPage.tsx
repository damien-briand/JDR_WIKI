import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  type LocationRecord,
  type LocationType,
  ApiError,
  createLocation,
  deleteLocation,
  listLocations,
  patchLocation,
} from "../../api/locations"
import {
  listGroupLocationStates,
  upsertGroupLocationState,
  type GroupLocationStateRecord,
  type GroupLocationStatus,
} from "../../api/groupLocationStates"

type WorldLocationsPageProps = {
  sectionTitle?: string
  allowedTypes?: readonly LocationType[]
  defaultType?: LocationType
  activeGroupId?: number | null
}

type LocationFormState = {
  name: string
  type: LocationType | ""
  parentId: string
  imageUrl: string
  mapX: string
  mapY: string
  discoveredByDefault: boolean
  description: string
  atmosphere: string
  lore: string
  secrets: string
}

const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  region: "Région",
  city: "Ville",
  village: "Village",
  dungeon: "Donjon",
  castle: "Château",
  temple: "Temple",
  poi: "Point d'intérêt",
  route: "Route",
}

const ALL_LOCATION_TYPES: LocationType[] = [
  "region",
  "city",
  "village",
  "dungeon",
  "castle",
  "temple",
  "poi",
  "route",
]

const GROUP_LOCATION_STATUS_LABELS: Record<GroupLocationStatus, string> = {
  undiscovered: "Non découvert",
  discovered: "Découvert",
  partially_explored: "Exploration partielle",
  fully_explored: "Exploré",
  cleared: "Nettoyé",
}

const GROUP_LOCATION_STATUS_OPTIONS: GroupLocationStatus[] = [
  "undiscovered",
  "discovered",
  "partially_explored",
  "fully_explored",
  "cleared",
]

function emptyForm(): LocationFormState {
  return {
    name: "",
    type: "",
    parentId: "",
    imageUrl: "",
    mapX: "",
    mapY: "",
    discoveredByDefault: false,
    description: "",
    atmosphere: "",
    lore: "",
    secrets: "",
  }
}

function toNumberOrNull(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function toNonEmptyOrNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function formFromLocation(location: LocationRecord): LocationFormState {
  return {
    name: location.name ?? "",
    type: location.type ?? "",
    parentId: location.parent_id ? String(location.parent_id) : "",
    imageUrl: location.image_url ?? "",
    mapX: location.map_x === null || location.map_x === undefined ? "" : String(location.map_x),
    mapY: location.map_y === null || location.map_y === undefined ? "" : String(location.map_y),
    discoveredByDefault: Boolean(location.is_discovered_default),
    description: location.description ?? "",
    atmosphere: location.atmosphere ?? "",
    lore: location.lore ?? "",
    secrets: location.secrets ?? "",
  }
}

export function WorldLocationsPage({ sectionTitle, allowedTypes, defaultType, activeGroupId }: WorldLocationsPageProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const panelTitle = sectionTitle ?? "Lieux"
  const allowedTypesSet = useMemo(
    () => (allowedTypes && allowedTypes.length > 0 ? new Set(allowedTypes) : null),
    [allowedTypes],
  )
  const typeOptions = useMemo(
    () => (allowedTypes && allowedTypes.length > 0 ? [...allowedTypes] : ALL_LOCATION_TYPES),
    [allowedTypes],
  )

  const [locations, setLocations] = useState<LocationRecord[]>([])
  const [groupLocationStatesStore, setGroupLocationStatesStore] = useState<
    | {
        groupId: number
        states: GroupLocationStateRecord[]
      }
    | null
  >(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingGroupState, setSavingGroupState] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [form, setForm] = useState<LocationFormState>(() => emptyForm())
  const [lastAppliedSelectId, setLastAppliedSelectId] = useState<number | null>(null)
  const [groupStatus, setGroupStatus] = useState<GroupLocationStatus>("undiscovered")
  const [groupNotes, setGroupNotes] = useState("")

  const requestedSelectId = useMemo(() => {
    const raw = searchParams.get("select")
    if (!raw) {
      return null
    }

    const parsed = Number.parseInt(raw, 10)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null
  }, [searchParams])

  const selectedLocation = useMemo(
    () => (selectedId ? locations.find((loc) => loc.id === selectedId) ?? null : null),
    [locations, selectedId],
  )

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

  const effectiveGroupStatusForLocation = useCallback(
    (location: LocationRecord): GroupLocationStatus => {
      const state = groupStateByLocationId.get(location.id)
      if (state) {
        return state.status
      }

      return location.is_discovered_default ? "discovered" : "undiscovered"
    },
    [groupStateByLocationId],
  )

  const regions = useMemo(() => locations.filter((loc) => loc.type === "region"), [locations])
  const visibleLocations = useMemo(() => {
    const typed = allowedTypesSet ? locations.filter((loc) => allowedTypesSet.has(loc.type)) : locations
    const applyGroupFilter = Boolean(allowedTypesSet) && Boolean(activeGroupId)

    if (!applyGroupFilter) {
      return typed
    }

    const filtered = typed.filter((loc) => effectiveGroupStatusForLocation(loc) !== "undiscovered")

    if (!selectedId) {
      return filtered
    }

    const selected = typed.find((loc) => loc.id === selectedId)
    if (!selected) {
      return filtered
    }

    if (filtered.some((loc) => loc.id === selectedId)) {
      return filtered
    }

    return [selected, ...filtered]
  }, [activeGroupId, allowedTypesSet, effectiveGroupStatusForLocation, locations, selectedId])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await listLocations()
      setLocations(data)
      setStatus(null)

      if (selectedId) {
        const stillExists = data.some((loc) => loc.id === selectedId)
        if (!stillExists) {
          setSelectedId(null)
          setForm(emptyForm())
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue."
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [selectedId])

  useEffect(() => {
    void load()
  }, [load])

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
        // Backend optionnel (dev) : on laisse les états vides.
      })

    return () => {
      cancelled = true
    }
  }, [activeGroupId])

  useEffect(() => {
    if (!requestedSelectId) {
      if (lastAppliedSelectId !== null) {
        setLastAppliedSelectId(null)
      }
      return
    }

    if (lastAppliedSelectId === requestedSelectId) {
      return
    }

    const candidate = locations.find((loc) => loc.id === requestedSelectId)
    if (!candidate) {
      return
    }

    if (allowedTypesSet && !allowedTypesSet.has(candidate.type)) {
      return
    }

    setSelectedId(candidate.id)
    setForm(formFromLocation(candidate))
    setError(null)
    setStatus(null)
    setLastAppliedSelectId(requestedSelectId)
  }, [allowedTypesSet, lastAppliedSelectId, locations, requestedSelectId])

  const selectLocation = useCallback(
    (locationId: number) => {
      const location = locations.find((loc) => loc.id === locationId)
      if (!location) {
        return
      }

      setSelectedId(locationId)
      setForm(formFromLocation(location))
      setError(null)
      setStatus(null)
    },
    [locations],
  )

  useEffect(() => {
    if (!activeGroupId || !selectedLocation) {
      return
    }

    const state = groupStateByLocationId.get(selectedLocation.id)
    if (state) {
      setGroupStatus(state.status)
      setGroupNotes(state.notes ?? "")
      return
    }

    setGroupStatus(selectedLocation.is_discovered_default ? "discovered" : "undiscovered")
    setGroupNotes("")
  }, [activeGroupId, groupStateByLocationId, selectedLocation])

  const startNew = useCallback(() => {
    const nextForm = emptyForm()
    const preferredType = defaultType ?? (allowedTypes?.length === 1 ? allowedTypes[0] : null)
    if (preferredType) {
      nextForm.type = preferredType
    }

    setSelectedId(null)
    setForm(nextForm)
    setError(null)
    setStatus(null)
  }, [allowedTypes, defaultType])

  const validation = useMemo(() => {
    if (!form.name.trim()) {
      return { ok: false as const, message: "Le nom est requis." }
    }

    if (!form.type) {
      return { ok: false as const, message: "Le type est requis." }
    }

    const mapX = toNumberOrNull(form.mapX)
    if (form.mapX.trim() && mapX === null) {
      return { ok: false as const, message: "map_x doit être un nombre." }
    }

    const mapY = toNumberOrNull(form.mapY)
    if (form.mapY.trim() && mapY === null) {
      return { ok: false as const, message: "map_y doit être un nombre." }
    }

    return { ok: true as const }
  }, [form.mapX, form.mapY, form.name, form.type])

  const submit = useCallback(async () => {
    if (!validation.ok) {
      setError(validation.message)
      return
    }

    setSaving(true)
    setError(null)
    setStatus(null)

    try {
      const payloadBase = {
        name: form.name.trim(),
        type: form.type as LocationType,
        parent_id: form.parentId ? Number.parseInt(form.parentId, 10) : null,
        description: toNonEmptyOrNull(form.description),
        atmosphere: toNonEmptyOrNull(form.atmosphere),
        lore: toNonEmptyOrNull(form.lore),
        secrets: toNonEmptyOrNull(form.secrets),
        map_x: toNumberOrNull(form.mapX),
        map_y: toNumberOrNull(form.mapY),
        image_url: toNonEmptyOrNull(form.imageUrl),
        is_discovered_default: form.discoveredByDefault,
      }

      if (selectedId) {
        const updated = await patchLocation(selectedId, payloadBase)
        setLocations((previous) => previous.map((loc) => (loc.id === updated.id ? updated : loc)))
        setForm(formFromLocation(updated))
        setStatus("Lieu mis à jour.")
      } else {
        const created = await createLocation(payloadBase)
        setLocations((previous) => [created, ...previous])
        setSelectedId(created.id)
        setForm(formFromLocation(created))
        setStatus("Lieu créé.")
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        const message = err instanceof Error ? err.message : "Erreur inconnue."
        setError(message)
      }
    } finally {
      setSaving(false)
    }
  }, [form, selectedId, validation])

  const onSubmitForm = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault()
      void submit()
    },
    [submit],
  )

  const onDelete = useCallback(async () => {
    if (!selectedId) {
      return
    }

    const location = locations.find((loc) => loc.id === selectedId)
    const name = location?.name ?? "ce lieu"

    const confirmed = window.confirm(`Supprimer ${name} ?`)
    if (!confirmed) {
      return
    }

    setSaving(true)
    setError(null)
    setStatus(null)

    try {
      await deleteLocation(selectedId)
      setLocations((previous) => previous.filter((loc) => loc.id !== selectedId))
      setSelectedId(null)
      setForm(emptyForm())
      setStatus("Lieu supprimé.")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue."
      setError(message)
    } finally {
      setSaving(false)
    }
  }, [locations, selectedId])

  const canSeeOnMap = useMemo(() => {
    if (!selectedLocation) {
      return false
    }
    return typeof selectedLocation.map_x === "number" && typeof selectedLocation.map_y === "number"
  }, [selectedLocation])

  const onSeeOnMap = useCallback(() => {
    if (!selectedLocation) {
      return
    }

    if (typeof selectedLocation.map_x !== "number" || typeof selectedLocation.map_y !== "number") {
      setError("Ce lieu n'a pas de coordonnées map_x/map_y.")
      return
    }

    navigate(`/world/map?loc=${selectedLocation.id}`)
  }, [navigate, selectedLocation])

  const canEditGroupState = Boolean(activeGroupId) && Boolean(selectedLocation)

  const saveGroupState = useCallback(async () => {
    if (!activeGroupId || !selectedLocation) {
      return
    }

    setSavingGroupState(true)
    setError(null)
    setStatus(null)

    try {
      const updated = await upsertGroupLocationState(activeGroupId, selectedLocation.id, {
        status: groupStatus,
        notes: toNonEmptyOrNull(groupNotes),
      })

      setGroupLocationStatesStore((previous) => {
        const baseStates = previous && previous.groupId === activeGroupId ? previous.states : []
        const index = baseStates.findIndex((entry) => entry.location_id === updated.location_id)
        const nextStates =
          index === -1
            ? [...baseStates, updated]
            : baseStates.map((entry) => (entry.location_id === updated.location_id ? updated : entry))

        return { groupId: activeGroupId, states: nextStates }
      })

      setStatus("État (groupe actif) mis à jour.")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue."
      setError(message)
    } finally {
      setSavingGroupState(false)
    }
  }, [activeGroupId, groupNotes, groupStatus, selectedLocation])

  const title =
    sectionTitle && sectionTitle.trim()
      ? selectedId
        ? `Modifier — ${sectionTitle.trim()}`
        : `Créer — ${sectionTitle.trim()}`
      : selectedId
        ? "Modifier un lieu"
        : "Créer un lieu"

  return (
    <div className="app-shell">
      <aside className="panel" aria-label={`Liste: ${panelTitle}`}>
        <h1>{panelTitle}</h1>
        <p className="muted">
          {allowedTypesSet
            ? activeGroupId
              ? "Liste filtrée + visibilité (groupe actif)."
              : "Liste filtrée (source: /api/locations)."
            : "CRUD branché sur /api/locations."}
        </p>

        <div className="group">
          <div className="group-row">
            <button type="button" className="btn" onClick={startNew} disabled={saving}>
              Nouveau
            </button>
            <button type="button" className="btn btn-alt" onClick={load} disabled={saving || loading}>
              Actualiser
            </button>
          </div>
        </div>

        <div className="group">
          <div className="locations-list" role="list">
            {loading ? (
              <p className="muted">Chargement…</p>
            ) : visibleLocations.length === 0 ? (
              <p className="muted">Aucun élément.</p>
            ) : (
              visibleLocations.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  className={loc.id === selectedId ? "locations-item active" : "locations-item"}
                  onClick={() => selectLocation(loc.id)}
                  role="listitem"
                >
                  <span className="locations-item-title">{loc.name}</span>
                  <span className="locations-item-meta">
                    {LOCATION_TYPE_LABELS[loc.type]}
                    {activeGroupId && allowedTypesSet
                      ? ` • ${GROUP_LOCATION_STATUS_LABELS[effectiveGroupStatusForLocation(loc)]}`
                      : ""}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      <section className="content-wrap" aria-label={title}>
        <div className="content-header">
          <h2 className="content-title">{title}</h2>
          {selectedLocation ? (
            <p className="content-meta">
              <span className="content-meta-item">Slug: {selectedLocation.slug}</span>
              <span className="content-meta-item">Créé: {selectedLocation.created_at}</span>
            </p>
          ) : (
            <p className="content-meta">
              <span className="content-meta-item">Les champs Name + Type sont requis.</span>
            </p>
          )}
        </div>

        {error ? <p className="form-error">{error}</p> : null}
        {status ? <p className="form-status">{status}</p> : null}

        <form className="form" onSubmit={onSubmitForm}>
          <div className="form-grid">
            <div>
              <label htmlFor="location-name">Nom *</label>
              <input
                id="location-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="location-type">Type *</label>
              <select
                id="location-type"
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as LocationType | "" }))}
              >
                <option value="">—</option>
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {LOCATION_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="location-parent">Région parente</label>
              <select
                id="location-parent"
                value={form.parentId}
                onChange={(e) => setForm((prev) => ({ ...prev, parentId: e.target.value }))}
              >
                <option value="">Aucune</option>
                {regions.map((region) => (
                  <option key={region.id} value={String(region.id)}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="location-image">Image URL</label>
              <input
                id="location-image"
                value={form.imageUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div>
              <label htmlFor="location-map-x">map_x</label>
              <input
                id="location-map-x"
                value={form.mapX}
                onChange={(e) => setForm((prev) => ({ ...prev, mapX: e.target.value }))}
                placeholder="ex: 2.345"
              />
            </div>

            <div>
              <label htmlFor="location-map-y">map_y</label>
              <input
                id="location-map-y"
                value={form.mapY}
                onChange={(e) => setForm((prev) => ({ ...prev, mapY: e.target.value }))}
                placeholder="ex: 48.856"
              />
            </div>

            <div className="form-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={form.discoveredByDefault}
                  onChange={(e) => setForm((prev) => ({ ...prev, discoveredByDefault: e.target.checked }))}
                />
                Découvert par défaut
              </label>
            </div>
          </div>

          <div className="group">
            <label htmlFor="location-description">Description</label>
            <textarea
              id="location-description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="group">
            <label htmlFor="location-atmosphere">Atmosphère</label>
            <textarea
              id="location-atmosphere"
              value={form.atmosphere}
              onChange={(e) => setForm((prev) => ({ ...prev, atmosphere: e.target.value }))}
            />
          </div>

          <div className="group">
            <label htmlFor="location-lore">Lore</label>
            <textarea
              id="location-lore"
              value={form.lore}
              onChange={(e) => setForm((prev) => ({ ...prev, lore: e.target.value }))}
            />
          </div>

          <div className="group">
            <label htmlFor="location-secrets">Secrets (MJ)</label>
            <textarea
              id="location-secrets"
              value={form.secrets}
              onChange={(e) => setForm((prev) => ({ ...prev, secrets: e.target.value }))}
            />
          </div>

          <div className="group">
            {!validation.ok ? <p className="muted">{validation.message}</p> : null}
            <div className="form-actions">
              <button type="submit" className="btn" disabled={saving || !validation.ok}>
                {saving ? "En cours…" : selectedId ? "Enregistrer" : "Créer"}
              </button>

              <button
                type="button"
                className="btn btn-alt"
                onClick={onSeeOnMap}
                disabled={saving || savingGroupState || !selectedId || !canSeeOnMap}
              >
                Voir sur la carte
              </button>

              <button
                type="button"
                className="btn btn-alt"
                onClick={onDelete}
                disabled={saving || savingGroupState || !selectedId}
              >
                Supprimer
              </button>
            </div>
          </div>

          {activeGroupId ? (
            <div className="group">
              <h3 className="content-title">État (groupe actif)</h3>

              {!selectedLocation ? (
                <p className="muted">Sélectionne un lieu pour définir sa visibilité/état.</p>
              ) : (
                <>
                  <div className="form-grid">
                    <div>
                      <label htmlFor="group-location-status">Statut</label>
                      <select
                        id="group-location-status"
                        value={groupStatus}
                        onChange={(e) => setGroupStatus(e.target.value as GroupLocationStatus)}
                        disabled={savingGroupState || saving}
                      >
                        {GROUP_LOCATION_STATUS_OPTIONS.map((entry) => (
                          <option key={entry} value={entry}>
                            {GROUP_LOCATION_STATUS_LABELS[entry]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="group">
                    <label htmlFor="group-location-notes">Notes (pour ce groupe)</label>
                    <textarea
                      id="group-location-notes"
                      value={groupNotes}
                      onChange={(e) => setGroupNotes(e.target.value)}
                      disabled={savingGroupState || saving}
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-alt"
                      onClick={() => void saveGroupState()}
                      disabled={!canEditGroupState || savingGroupState || saving}
                    >
                      {savingGroupState ? "En cours…" : "Enregistrer état"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </form>
      </section>
    </div>
  )
}
