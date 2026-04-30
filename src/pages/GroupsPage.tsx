import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ApiError,
  createGroup,
  deleteGroup,
  listGroups,
  patchGroup,
  type GroupRecord,
} from "../api/groups"

type GroupsPageProps = {
  groups: GroupRecord[]
  groupsLoaded: boolean
  onGroupsChange: (nextGroups: GroupRecord[]) => void
  activeGroupId: number | null
  onActiveGroupChange: (nextGroupId: number | null) => void
}

type GroupFormState = {
  name: string
  color: string
  lastSessionDate: string
  description: string
  notes: string
}

function emptyForm(): GroupFormState {
  return {
    name: "",
    color: "#4a90d9",
    lastSessionDate: "",
    description: "",
    notes: "",
  }
}

function formFromGroup(group: GroupRecord): GroupFormState {
  return {
    name: group.name ?? "",
    color: group.color ?? "#4a90d9",
    lastSessionDate: group.last_session_date ?? "",
    description: group.description ?? "",
    notes: group.notes ?? "",
  }
}

function toNonEmptyOrNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function toDateOrNull(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null
}

function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value.trim())
}

export function GroupsPage({
  groups,
  groupsLoaded,
  onGroupsChange,
  activeGroupId,
  onActiveGroupChange,
}: GroupsPageProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [form, setForm] = useState<GroupFormState>(() => emptyForm())

  const selectedGroup = useMemo(
    () => (selectedId ? groups.find((g) => g.id === selectedId) ?? null : null),
    [groups, selectedId],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await listGroups()
      onGroupsChange(data)
      setStatus(null)

      setSelectedId((previousSelectedId) => {
        if (previousSelectedId && !data.some((g) => g.id === previousSelectedId)) {
          setForm(emptyForm())
          return null
        }

        return previousSelectedId
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue."
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [onGroupsChange])

  useEffect(() => {
    if (!groupsLoaded) {
      void load()
    }
  }, [groupsLoaded, load])

  const startNew = useCallback(() => {
    setSelectedId(null)
    setForm(emptyForm())
    setError(null)
    setStatus(null)
  }, [])

  const selectGroup = useCallback(
    (groupId: number) => {
      const group = groups.find((g) => g.id === groupId)
      if (!group) {
        return
      }

      setSelectedId(groupId)
      setForm(formFromGroup(group))
      setError(null)
      setStatus(null)
    },
    [groups],
  )

  const validation = useMemo(() => {
    if (!form.name.trim()) {
      return { ok: false as const, message: "Le nom est requis." }
    }

    if (!isHexColor(form.color)) {
      return { ok: false as const, message: "La couleur doit être au format #RRGGBB." }
    }

    if (form.lastSessionDate.trim() && !toDateOrNull(form.lastSessionDate)) {
      return { ok: false as const, message: "La date doit être au format AAAA-MM-JJ." }
    }

    return { ok: true as const }
  }, [form.color, form.lastSessionDate, form.name])

  const submit = useCallback(async () => {
    if (!validation.ok) {
      setError(validation.message)
      return
    }

    setSaving(true)
    setError(null)
    setStatus(null)

    try {
      const payload = {
        name: form.name.trim(),
        color: form.color.trim(),
        last_session_date: toDateOrNull(form.lastSessionDate),
        description: toNonEmptyOrNull(form.description),
        notes: toNonEmptyOrNull(form.notes),
      }

      if (selectedId) {
        const updated = await patchGroup(selectedId, payload)
        onGroupsChange(groups.map((g) => (g.id === updated.id ? updated : g)))
        setForm(formFromGroup(updated))
        setStatus("Groupe mis à jour.")
      } else {
        const created = await createGroup(payload)
        onGroupsChange([created, ...groups])
        setSelectedId(created.id)
        setForm(formFromGroup(created))
        setStatus("Groupe créé.")
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
  }, [form, groups, onGroupsChange, selectedId, validation])

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

    const group = groups.find((g) => g.id === selectedId)
    const name = group?.name ?? "ce groupe"

    const confirmed = window.confirm(`Supprimer ${name} ?`)
    if (!confirmed) {
      return
    }

    setSaving(true)
    setError(null)
    setStatus(null)

    try {
      await deleteGroup(selectedId)
      const nextGroups = groups.filter((g) => g.id !== selectedId)
      onGroupsChange(nextGroups)

      if (activeGroupId === selectedId) {
        onActiveGroupChange(null)
      }

      setSelectedId(null)
      setForm(emptyForm())
      setStatus("Groupe supprimé.")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue."
      setError(message)
    } finally {
      setSaving(false)
    }
  }, [activeGroupId, groups, onActiveGroupChange, onGroupsChange, selectedId])

  const title = selectedId ? "Modifier un groupe" : "Créer un groupe"

  return (
    <div className="app-shell">
      <aside className="panel" aria-label="Liste: Groupes">
        <h1>Groupes</h1>
        <p className="muted">CRUD branché sur /api/groups. Le groupe actif sert de filtre global.</p>

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
            {loading && !groupsLoaded ? (
              <p className="muted">Chargement…</p>
            ) : groups.length === 0 ? (
              <p className="muted">Aucun groupe.</p>
            ) : (
              groups.map((group) => {
                const isActive = activeGroupId === group.id
                const metaParts = [isActive ? "Actif" : null, `Couleur: ${group.color}`].filter(Boolean)

                return (
                  <button
                    key={group.id}
                    type="button"
                    className={group.id === selectedId ? "locations-item active" : "locations-item"}
                    onClick={() => selectGroup(group.id)}
                    role="listitem"
                  >
                    <span className="locations-item-title">{group.name}</span>
                    <span className="locations-item-meta">{metaParts.join(" • ")}</span>
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
          {selectedGroup ? (
            <p className="content-meta">
              <span className="content-meta-item">Créé: {selectedGroup.created_at}</span>
              <span className="content-meta-item">ID: {selectedGroup.id}</span>
            </p>
          ) : (
            <p className="content-meta">
              <span className="content-meta-item">Le champ Name est requis.</span>
            </p>
          )}
        </div>

        {error ? <p className="form-error">{error}</p> : null}
        {status ? <p className="form-status">{status}</p> : null}

        <form className="form" onSubmit={onSubmitForm}>
          <div className="form-grid">
            <div>
              <label htmlFor="group-name">Nom *</label>
              <input
                id="group-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="group-color">Couleur (#RRGGBB)</label>
              <input
                id="group-color"
                value={form.color}
                onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                placeholder="#4a90d9"
              />
            </div>

            <div>
              <label htmlFor="group-last-session">Dernière session</label>
              <input
                id="group-last-session"
                type="date"
                value={form.lastSessionDate}
                onChange={(e) => setForm((prev) => ({ ...prev, lastSessionDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="group">
            <label htmlFor="group-description">Description</label>
            <textarea
              id="group-description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="group">
            <label htmlFor="group-notes">Notes (MJ)</label>
            <textarea
              id="group-notes"
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="group">
            {!validation.ok ? <p className="muted">{validation.message}</p> : null}
            <div className="form-actions">
              <button type="submit" className="btn" disabled={saving || !validation.ok}>
                {saving ? "En cours…" : selectedId ? "Enregistrer" : "Créer"}
              </button>

              <button type="button" className="btn btn-alt" onClick={onDelete} disabled={saving || !selectedId}>
                Supprimer
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  )
}
