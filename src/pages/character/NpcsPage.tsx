import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { ApiError, createNpc, deleteNpc, listNpcs, patchNpc, type NpcRecord } from "../../api/npcs"
import { listLocations, type LocationRecord } from "../../api/locations"
import {
  listGroupNpcStates,
  upsertGroupNpcState,
  type GroupNpcStateRecord,
  type GroupNpcStatus,
} from "../../api/groupNpcStates"

type NpcsPageProps = {
  activeGroupId: number | null
}

type NpcFormState = {
  name: string
  type: string
  locationId: string
  imageUrl: string
  isUnique: boolean
  defaultStatus: string
  description: string
  personality: string
  lore: string
  secrets: string
}

const GROUP_NPC_STATUS_LABELS: Record<GroupNpcStatus, string> = {
  unknown: "Inconnu",
  known: "Connu",
  met: "Rencontré",
  ally: "Allié",
  neutral: "Neutre",
  hostile: "Hostile",
  dead: "Mort",
}

const GROUP_NPC_STATUS_OPTIONS: GroupNpcStatus[] = [
  "unknown",
  "known",
  "met",
  "ally",
  "neutral",
  "hostile",
  "dead",
]

function emptyForm(): NpcFormState {
  return {
    name: "",
    type: "neutral",
    locationId: "",
    imageUrl: "",
    isUnique: false,
    defaultStatus: "alive",
    description: "",
    personality: "",
    lore: "",
    secrets: "",
  }
}

function toIntOrNullFromString(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  const parsed = Number.parseInt(trimmed, 10)
  return Number.isInteger(parsed) ? parsed : null
}

function toNonEmptyOrNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function formFromNpc(npc: NpcRecord): NpcFormState {
  return {
    name: npc.name ?? "",
    type: npc.type ?? "neutral",
    locationId: npc.location_id ? String(npc.location_id) : "",
    imageUrl: npc.image_url ?? "",
    isUnique: Boolean(npc.is_unique),
    defaultStatus: npc.default_status ?? "alive",
    description: npc.description ?? "",
    personality: npc.personality ?? "",
    lore: npc.lore ?? "",
    secrets: npc.secrets ?? "",
  }
}

function effectiveGroupNpcStatus(npcId: number, stateByNpcId: Map<number, GroupNpcStateRecord>): GroupNpcStatus {
  const state = stateByNpcId.get(npcId)
  if (state) {
    return state.status
  }

  return "unknown"
}

export function NpcsPage({ activeGroupId }: NpcsPageProps) {
  const [searchParams] = useSearchParams()

  const [npcs, setNpcs] = useState<NpcRecord[]>([])
  const [locations, setLocations] = useState<LocationRecord[]>([])
  const [groupNpcStatesStore, setGroupNpcStatesStore] = useState<
    | {
        groupId: number
        states: GroupNpcStateRecord[]
      }
    | null
  >(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingGroupState, setSavingGroupState] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [form, setForm] = useState<NpcFormState>(() => emptyForm())
  const [lastAppliedSelectId, setLastAppliedSelectId] = useState<number | null>(null)

  const [groupStatus, setGroupStatus] = useState<GroupNpcStatus>("unknown")
  const [relationshipNotes, setRelationshipNotes] = useState("")

  const requestedSelectId = useMemo(() => {
    const raw = searchParams.get("select")
    if (!raw) {
      return null
    }

    const parsed = Number.parseInt(raw, 10)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null
  }, [searchParams])

  const groupNpcStates = useMemo(() => {
    if (!activeGroupId || !groupNpcStatesStore) {
      return []
    }

    if (groupNpcStatesStore.groupId !== activeGroupId) {
      return []
    }

    return groupNpcStatesStore.states
  }, [activeGroupId, groupNpcStatesStore])

  const groupStateByNpcId = useMemo(() => {
    return new Map(groupNpcStates.map((entry) => [entry.npc_id, entry]))
  }, [groupNpcStates])

  const selectedNpc = useMemo(
    () => (selectedId ? npcs.find((npc) => npc.id === selectedId) ?? null : null),
    [npcs, selectedId],
  )

  const locationById = useMemo(() => {
    return new Map(locations.map((loc) => [loc.id, loc]))
  }, [locations])

  const visibleNpcs = useMemo(() => {
    const applyGroupFilter = Boolean(activeGroupId)
    if (!applyGroupFilter) {
      return npcs
    }

    const filtered = npcs.filter((npc) => effectiveGroupNpcStatus(npc.id, groupStateByNpcId) !== "unknown")

    if (!selectedId) {
      return filtered
    }

    const selected = npcs.find((npc) => npc.id === selectedId)
    if (!selected) {
      return filtered
    }

    if (filtered.some((npc) => npc.id === selectedId)) {
      return filtered
    }

    return [selected, ...filtered]
  }, [activeGroupId, groupStateByNpcId, npcs, selectedId])

  const loadNpcs = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await listNpcs()
      setNpcs(data)
      setStatus(null)

      if (selectedId) {
        const stillExists = data.some((npc) => npc.id === selectedId)
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
    void loadNpcs()
  }, [loadNpcs])

  useEffect(() => {
    let cancelled = false

    listLocations()
      .then((data) => {
        if (!cancelled) {
          setLocations(data)
        }
      })
      .catch(() => {
        // Backend optionnel (dev) : le select reste vide.
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

    listGroupNpcStates(activeGroupId)
      .then((data) => {
        if (!cancelled) {
          setGroupNpcStatesStore({ groupId: activeGroupId, states: data })
        }
      })
      .catch(() => {
        // Backend optionnel (dev) : on ne filtre pas.
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

    const candidate = npcs.find((npc) => npc.id === requestedSelectId)
    if (!candidate) {
      return
    }

    setSelectedId(candidate.id)
    setForm(formFromNpc(candidate))
    setError(null)
    setStatus(null)
    setLastAppliedSelectId(requestedSelectId)
  }, [lastAppliedSelectId, npcs, requestedSelectId])

  const selectNpc = useCallback(
    (npcId: number) => {
      const npc = npcs.find((entry) => entry.id === npcId)
      if (!npc) {
        return
      }

      setSelectedId(npcId)
      setForm(formFromNpc(npc))
      setError(null)
      setStatus(null)
    },
    [npcs],
  )

  useEffect(() => {
    if (!activeGroupId || !selectedNpc) {
      return
    }

    const existing = groupStateByNpcId.get(selectedNpc.id)
    if (existing) {
      setGroupStatus(existing.status)
      setRelationshipNotes(existing.relationship_notes ?? "")
      return
    }

    setGroupStatus("unknown")
    setRelationshipNotes("")
  }, [activeGroupId, groupStateByNpcId, selectedNpc])

  const startNew = useCallback(() => {
    setSelectedId(null)
    setForm(emptyForm())
    setError(null)
    setStatus(null)
  }, [])

  const validation = useMemo(() => {
    if (!form.name.trim()) {
      return { ok: false as const, message: "Le nom est requis." }
    }

    if (!form.type.trim()) {
      return { ok: false as const, message: "Le type est requis." }
    }

    if (!form.defaultStatus.trim()) {
      return { ok: false as const, message: "Le statut par défaut est requis." }
    }

    const locationId = form.locationId.trim() ? toIntOrNullFromString(form.locationId) : 0
    if (form.locationId.trim() && locationId === null) {
      return { ok: false as const, message: "location_id doit être un entier." }
    }

    return { ok: true as const }
  }, [form.defaultStatus, form.locationId, form.name, form.type])

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
        type: form.type.trim(),
        location_id: toIntOrNullFromString(form.locationId),
        description: toNonEmptyOrNull(form.description),
        personality: toNonEmptyOrNull(form.personality),
        lore: toNonEmptyOrNull(form.lore),
        secrets: toNonEmptyOrNull(form.secrets),
        image_url: toNonEmptyOrNull(form.imageUrl),
        is_unique: form.isUnique,
        default_status: form.defaultStatus.trim(),
      }

      if (selectedId) {
        const updated = await patchNpc(selectedId, payloadBase)
        setNpcs((previous) => previous.map((npc) => (npc.id === updated.id ? updated : npc)))
        setForm(formFromNpc(updated))
        setStatus("PNJ mis à jour.")
      } else {
        const created = await createNpc(payloadBase)
        setNpcs((previous) => [created, ...previous])
        setSelectedId(created.id)
        setForm(formFromNpc(created))
        setStatus("PNJ créé.")
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

    const npc = npcs.find((entry) => entry.id === selectedId)
    const name = npc?.name ?? "ce PNJ"

    const confirmed = window.confirm(`Supprimer ${name} ?`)
    if (!confirmed) {
      return
    }

    setSaving(true)
    setError(null)
    setStatus(null)

    try {
      await deleteNpc(selectedId)
      setNpcs((previous) => previous.filter((entry) => entry.id !== selectedId))
      setSelectedId(null)
      setForm(emptyForm())
      setStatus("PNJ supprimé.")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue."
      setError(message)
    } finally {
      setSaving(false)
    }
  }, [npcs, selectedId])

  const canEditGroupState = Boolean(activeGroupId) && Boolean(selectedNpc)

  const saveGroupState = useCallback(async () => {
    if (!activeGroupId || !selectedNpc) {
      return
    }

    setSavingGroupState(true)
    setError(null)
    setStatus(null)

    try {
      const updated = await upsertGroupNpcState(activeGroupId, selectedNpc.id, {
        status: groupStatus,
        relationship_notes: toNonEmptyOrNull(relationshipNotes),
      })

      setGroupNpcStatesStore((previous) => {
        const baseStates = previous && previous.groupId === activeGroupId ? previous.states : []
        const nextStates = baseStates.some((entry) => entry.npc_id === updated.npc_id)
          ? baseStates.map((entry) => (entry.npc_id === updated.npc_id ? updated : entry))
          : [...baseStates, updated]

        return { groupId: activeGroupId, states: nextStates }
      })

      setStatus("État (groupe actif) mis à jour.")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue."
      setError(message)
    } finally {
      setSavingGroupState(false)
    }
  }, [activeGroupId, groupStatus, relationshipNotes, selectedNpc])

  const title = selectedId ? "Modifier un PNJ" : "Créer un PNJ"

  return (
    <div className="app-shell">
      <aside className="panel" aria-label="Liste: PNJ">
        <h1>PNJ</h1>
        <p className="muted">{activeGroupId ? "Liste + visibilité (groupe actif)." : "CRUD branché sur /api/npcs."}</p>

        <div className="group">
          <div className="group-row">
            <button type="button" className="btn" onClick={startNew} disabled={saving}>
              Nouveau
            </button>
            <button type="button" className="btn btn-alt" onClick={loadNpcs} disabled={saving || loading}>
              Actualiser
            </button>
          </div>
        </div>

        <div className="group">
          <div className="locations-list" role="list">
            {loading ? (
              <p className="muted">Chargement…</p>
            ) : visibleNpcs.length === 0 ? (
              <p className="muted">Aucun élément.</p>
            ) : (
              visibleNpcs.map((npc) => {
                const locationName = npc.location_id ? locationById.get(npc.location_id)?.name ?? null : null
                const groupNpcStatus = activeGroupId ? effectiveGroupNpcStatus(npc.id, groupStateByNpcId) : null

                const metaParts = [npc.type]
                if (locationName) {
                  metaParts.push(locationName)
                }
                if (groupNpcStatus) {
                  metaParts.push(GROUP_NPC_STATUS_LABELS[groupNpcStatus])
                }

                return (
                  <button
                    key={npc.id}
                    type="button"
                    className={npc.id === selectedId ? "locations-item active" : "locations-item"}
                    onClick={() => selectNpc(npc.id)}
                    role="listitem"
                  >
                    <span className="locations-item-title">{npc.name}</span>
                    <span className="locations-item-meta">{metaParts.filter(Boolean).join(" • ")}</span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      </aside>

      <section className="content-wrap" aria-label={title}>
        <div className="content-header">
          <h2 className="content-title">{title}</h2>
          {selectedNpc ? (
            <p className="content-meta">
              <span className="content-meta-item">Slug: {selectedNpc.slug}</span>
              <span className="content-meta-item">Créé: {selectedNpc.created_at}</span>
            </p>
          ) : (
            <p className="content-meta">
              <span className="content-meta-item">Le champ Nom est requis.</span>
            </p>
          )}
        </div>

        {error ? <p className="form-error">{error}</p> : null}
        {status ? <p className="form-status">{status}</p> : null}

        <form className="form" onSubmit={onSubmitForm}>
          <div className="form-grid">
            <div>
              <label htmlFor="npc-name">Nom *</label>
              <input
                id="npc-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="npc-type">Type *</label>
              <input
                id="npc-type"
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                placeholder="neutral"
              />
            </div>

            <div>
              <label htmlFor="npc-location">Lieu</label>
              <select
                id="npc-location"
                value={form.locationId}
                onChange={(e) => setForm((prev) => ({ ...prev, locationId: e.target.value }))}
              >
                <option value="">Aucun</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={String(loc.id)}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="npc-image">Image URL</label>
              <input
                id="npc-image"
                value={form.imageUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="form-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={form.isUnique}
                  onChange={(e) => setForm((prev) => ({ ...prev, isUnique: e.target.checked }))}
                />
                Unique
              </label>
            </div>

            <div>
              <label htmlFor="npc-default-status">Statut par défaut *</label>
              <input
                id="npc-default-status"
                value={form.defaultStatus}
                onChange={(e) => setForm((prev) => ({ ...prev, defaultStatus: e.target.value }))}
                placeholder="alive"
              />
            </div>
          </div>

          <div className="group">
            <label htmlFor="npc-description">Description</label>
            <textarea
              id="npc-description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="group">
            <label htmlFor="npc-personality">Personnalité</label>
            <textarea
              id="npc-personality"
              value={form.personality}
              onChange={(e) => setForm((prev) => ({ ...prev, personality: e.target.value }))}
            />
          </div>

          <div className="group">
            <label htmlFor="npc-lore">Lore</label>
            <textarea
              id="npc-lore"
              value={form.lore}
              onChange={(e) => setForm((prev) => ({ ...prev, lore: e.target.value }))}
            />
          </div>

          <div className="group">
            <label htmlFor="npc-secrets">Secrets (MJ)</label>
            <textarea
              id="npc-secrets"
              value={form.secrets}
              onChange={(e) => setForm((prev) => ({ ...prev, secrets: e.target.value }))}
            />
          </div>

          <div className="group">
            {!validation.ok ? <p className="muted">{validation.message}</p> : null}
            <div className="form-actions">
              <button type="submit" className="btn" disabled={saving || savingGroupState || !validation.ok}>
                {saving ? "En cours…" : selectedId ? "Enregistrer" : "Créer"}
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

              {!selectedNpc ? (
                <p className="muted">Sélectionne un PNJ pour définir sa visibilité/état.</p>
              ) : (
                <>
                  <div className="form-grid">
                    <div>
                      <label htmlFor="group-npc-status">Statut</label>
                      <select
                        id="group-npc-status"
                        value={groupStatus}
                        onChange={(e) => setGroupStatus(e.target.value as GroupNpcStatus)}
                        disabled={savingGroupState || saving}
                      >
                        {GROUP_NPC_STATUS_OPTIONS.map((entry) => (
                          <option key={entry} value={entry}>
                            {GROUP_NPC_STATUS_LABELS[entry]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="group">
                    <label htmlFor="group-npc-relationship-notes">Notes relationnelles (pour ce groupe)</label>
                    <textarea
                      id="group-npc-relationship-notes"
                      value={relationshipNotes}
                      onChange={(e) => setRelationshipNotes(e.target.value)}
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
