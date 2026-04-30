import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import {
  ApiError,
  createMonster,
  deleteMonster,
  listMonsters,
  patchMonster,
  type MonsterRecord,
} from "../../api/monsters"
import {
  listGroupMonsterStates,
  upsertGroupMonsterState,
  type GroupMonsterStateRecord,
  type GroupMonsterStatus,
} from "../../api/groupMonsterStates"

type MonstersPageProps = {
  activeGroupId: number | null
}

type MonsterFormState = {
  name: string
  tier: string
  category: string
  difficulty: string
  imageUrl: string
  isBoss: boolean
  description: string
  lore: string
  secrets: string
}

const GROUP_MONSTER_STATUS_LABELS: Record<GroupMonsterStatus, string> = {
  unknown: "Inconnu",
  known: "Connu",
  encountered: "Affronté",
  defeated: "Vaincu",
}

const GROUP_MONSTER_STATUS_OPTIONS: GroupMonsterStatus[] = ["unknown", "known", "encountered", "defeated"]

function emptyForm(): MonsterFormState {
  return {
    name: "",
    tier: "1",
    category: "",
    difficulty: "12",
    imageUrl: "",
    isBoss: false,
    description: "",
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

function formFromMonster(monster: MonsterRecord): MonsterFormState {
  return {
    name: monster.name ?? "",
    tier: String(monster.tier ?? 1),
    category: monster.category ?? "",
    difficulty: String(monster.difficulty ?? 12),
    imageUrl: monster.image_url ?? "",
    isBoss: Boolean(monster.is_boss),
    description: monster.description ?? "",
    lore: monster.lore ?? "",
    secrets: monster.secrets ?? "",
  }
}

function effectiveGroupMonsterStatus(
  monsterId: number,
  stateByMonsterId: Map<number, GroupMonsterStateRecord>,
): GroupMonsterStatus {
  const state = stateByMonsterId.get(monsterId)
  if (state) {
    return state.status
  }

  return "unknown"
}

export function MonstersPage({ activeGroupId }: MonstersPageProps) {
  const [searchParams] = useSearchParams()

  const [monsters, setMonsters] = useState<MonsterRecord[]>([])
  const [groupMonsterStatesStore, setGroupMonsterStatesStore] = useState<
    | {
        groupId: number
        states: GroupMonsterStateRecord[]
      }
    | null
  >(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingGroupState, setSavingGroupState] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [form, setForm] = useState<MonsterFormState>(() => emptyForm())
  const [lastAppliedSelectId, setLastAppliedSelectId] = useState<number | null>(null)

  const [groupStatus, setGroupStatus] = useState<GroupMonsterStatus>("unknown")
  const [groupNotes, setGroupNotes] = useState("")
  const [defeatSessionId, setDefeatSessionId] = useState("")

  const requestedSelectId = useMemo(() => {
    const raw = searchParams.get("select")
    if (!raw) {
      return null
    }

    const parsed = Number.parseInt(raw, 10)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null
  }, [searchParams])

  const groupMonsterStates = useMemo(() => {
    if (!activeGroupId || !groupMonsterStatesStore) {
      return []
    }

    if (groupMonsterStatesStore.groupId !== activeGroupId) {
      return []
    }

    return groupMonsterStatesStore.states
  }, [activeGroupId, groupMonsterStatesStore])

  const groupStateByMonsterId = useMemo(() => {
    return new Map(groupMonsterStates.map((entry) => [entry.monster_id, entry]))
  }, [groupMonsterStates])

  const selectedMonster = useMemo(
    () => (selectedId ? monsters.find((m) => m.id === selectedId) ?? null : null),
    [monsters, selectedId],
  )

  const visibleMonsters = useMemo(() => {
    const applyGroupFilter = Boolean(activeGroupId)
    if (!applyGroupFilter) {
      return monsters
    }

    const filtered = monsters.filter(
      (monster) => effectiveGroupMonsterStatus(monster.id, groupStateByMonsterId) !== "unknown",
    )

    if (!selectedId) {
      return filtered
    }

    const selected = monsters.find((m) => m.id === selectedId)
    if (!selected) {
      return filtered
    }

    if (filtered.some((m) => m.id === selectedId)) {
      return filtered
    }

    return [selected, ...filtered]
  }, [activeGroupId, groupStateByMonsterId, monsters, selectedId])

  const loadMonsters = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await listMonsters()
      setMonsters(data)
      setStatus(null)

      if (selectedId) {
        const stillExists = data.some((m) => m.id === selectedId)
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
    void loadMonsters()
  }, [loadMonsters])

  useEffect(() => {
    let cancelled = false

    if (!activeGroupId) {
      return () => {
        cancelled = true
      }
    }

    listGroupMonsterStates(activeGroupId)
      .then((data) => {
        if (!cancelled) {
          setGroupMonsterStatesStore({ groupId: activeGroupId, states: data })
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

    const candidate = monsters.find((m) => m.id === requestedSelectId)
    if (!candidate) {
      return
    }

    setSelectedId(candidate.id)
    setForm(formFromMonster(candidate))
    setError(null)
    setStatus(null)
    setLastAppliedSelectId(requestedSelectId)
  }, [lastAppliedSelectId, monsters, requestedSelectId])

  const selectMonster = useCallback(
    (monsterId: number) => {
      const monster = monsters.find((entry) => entry.id === monsterId)
      if (!monster) {
        return
      }

      setSelectedId(monsterId)
      setForm(formFromMonster(monster))
      setError(null)
      setStatus(null)
    },
    [monsters],
  )

  useEffect(() => {
    if (!activeGroupId || !selectedMonster) {
      return
    }

    const existing = groupStateByMonsterId.get(selectedMonster.id)
    if (existing) {
      setGroupStatus(existing.status)
      setGroupNotes(existing.notes ?? "")
      setDefeatSessionId(existing.defeat_session_id ? String(existing.defeat_session_id) : "")
      return
    }

    setGroupStatus("unknown")
    setGroupNotes("")
    setDefeatSessionId("")
  }, [activeGroupId, groupStateByMonsterId, selectedMonster])

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

    const tier = toIntOrNullFromString(form.tier)
    if (form.tier.trim() && tier === null) {
      return { ok: false as const, message: "tier doit être un entier." }
    }

    const difficulty = toIntOrNullFromString(form.difficulty)
    if (form.difficulty.trim() && difficulty === null) {
      return { ok: false as const, message: "difficulty doit être un entier." }
    }

    const defeatId = toIntOrNullFromString(defeatSessionId)
    if (defeatSessionId.trim() && defeatId === null) {
      return { ok: false as const, message: "defeat_session_id doit être un entier." }
    }

    return { ok: true as const }
  }, [defeatSessionId, form.difficulty, form.name, form.tier])

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
        tier: toIntOrNullFromString(form.tier) ?? 1,
        category: toNonEmptyOrNull(form.category),
        description: toNonEmptyOrNull(form.description),
        lore: toNonEmptyOrNull(form.lore),
        secrets: toNonEmptyOrNull(form.secrets),
        difficulty: toIntOrNullFromString(form.difficulty) ?? 12,
        image_url: toNonEmptyOrNull(form.imageUrl),
        is_boss: form.isBoss,
      }

      if (selectedId) {
        const updated = await patchMonster(selectedId, payloadBase)
        setMonsters((previous) => previous.map((m) => (m.id === updated.id ? updated : m)))
        setForm(formFromMonster(updated))
        setStatus("Monstre mis à jour.")
      } else {
        const created = await createMonster(payloadBase)
        setMonsters((previous) => [created, ...previous])
        setSelectedId(created.id)
        setForm(formFromMonster(created))
        setStatus("Monstre créé.")
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

    const monster = monsters.find((entry) => entry.id === selectedId)
    const name = monster?.name ?? "ce monstre"

    const confirmed = window.confirm(`Supprimer ${name} ?`)
    if (!confirmed) {
      return
    }

    setSaving(true)
    setError(null)
    setStatus(null)

    try {
      await deleteMonster(selectedId)
      setMonsters((previous) => previous.filter((entry) => entry.id !== selectedId))
      setSelectedId(null)
      setForm(emptyForm())
      setStatus("Monstre supprimé.")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue."
      setError(message)
    } finally {
      setSaving(false)
    }
  }, [monsters, selectedId])

  const canEditGroupState = Boolean(activeGroupId) && Boolean(selectedMonster)

  const saveGroupState = useCallback(async () => {
    if (!activeGroupId || !selectedMonster) {
      return
    }

    if (!validation.ok) {
      setError(validation.message)
      return
    }

    setSavingGroupState(true)
    setError(null)
    setStatus(null)

    try {
      const updated = await upsertGroupMonsterState(activeGroupId, selectedMonster.id, {
        status: groupStatus,
        notes: toNonEmptyOrNull(groupNotes),
        defeat_session_id: toIntOrNullFromString(defeatSessionId),
      })

      setGroupMonsterStatesStore((previous) => {
        const baseStates = previous && previous.groupId === activeGroupId ? previous.states : []
        const nextStates = baseStates.some((entry) => entry.monster_id === updated.monster_id)
          ? baseStates.map((entry) => (entry.monster_id === updated.monster_id ? updated : entry))
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
  }, [activeGroupId, defeatSessionId, groupNotes, groupStatus, selectedMonster, validation])

  const title = selectedId ? "Modifier un monstre" : "Créer un monstre"

  return (
    <div className="app-shell">
      <aside className="panel" aria-label="Liste: Monstres">
        <h1>Monstres</h1>
        <p className="muted">
          {activeGroupId ? "Liste + visibilité (groupe actif)." : "CRUD branché sur /api/monsters."}
        </p>

        <div className="group">
          <div className="group-row">
            <button type="button" className="btn" onClick={startNew} disabled={saving}>
              Nouveau
            </button>
            <button type="button" className="btn btn-alt" onClick={loadMonsters} disabled={saving || loading}>
              Actualiser
            </button>
          </div>
        </div>

        <div className="group">
          <div className="locations-list" role="list">
            {loading ? (
              <p className="muted">Chargement…</p>
            ) : visibleMonsters.length === 0 ? (
              <p className="muted">Aucun élément.</p>
            ) : (
              visibleMonsters.map((monster) => {
                const groupMonsterStatus = activeGroupId
                  ? effectiveGroupMonsterStatus(monster.id, groupStateByMonsterId)
                  : null

                const metaParts = [`Tier ${monster.tier}`]
                if (monster.is_boss) {
                  metaParts.push("Boss")
                }
                if (groupMonsterStatus) {
                  metaParts.push(GROUP_MONSTER_STATUS_LABELS[groupMonsterStatus])
                }

                return (
                  <button
                    key={monster.id}
                    type="button"
                    className={monster.id === selectedId ? "locations-item active" : "locations-item"}
                    onClick={() => selectMonster(monster.id)}
                    role="listitem"
                  >
                    <span className="locations-item-title">{monster.name}</span>
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
          {selectedMonster ? (
            <p className="content-meta">
              <span className="content-meta-item">Slug: {selectedMonster.slug}</span>
              <span className="content-meta-item">Créé: {selectedMonster.created_at}</span>
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
              <label htmlFor="monster-name">Nom *</label>
              <input
                id="monster-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="monster-tier">Tier</label>
              <input
                id="monster-tier"
                value={form.tier}
                onChange={(e) => setForm((prev) => ({ ...prev, tier: e.target.value }))}
                placeholder="1"
              />
            </div>

            <div>
              <label htmlFor="monster-category">Catégorie</label>
              <input
                id="monster-category"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="monster-difficulty">Difficulté</label>
              <input
                id="monster-difficulty"
                value={form.difficulty}
                onChange={(e) => setForm((prev) => ({ ...prev, difficulty: e.target.value }))}
                placeholder="12"
              />
            </div>

            <div>
              <label htmlFor="monster-image">Image URL</label>
              <input
                id="monster-image"
                value={form.imageUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="form-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={form.isBoss}
                  onChange={(e) => setForm((prev) => ({ ...prev, isBoss: e.target.checked }))}
                />
                Boss
              </label>
            </div>
          </div>

          <div className="group">
            <label htmlFor="monster-description">Description</label>
            <textarea
              id="monster-description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="group">
            <label htmlFor="monster-lore">Lore</label>
            <textarea
              id="monster-lore"
              value={form.lore}
              onChange={(e) => setForm((prev) => ({ ...prev, lore: e.target.value }))}
            />
          </div>

          <div className="group">
            <label htmlFor="monster-secrets">Secrets (MJ)</label>
            <textarea
              id="monster-secrets"
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

              {!selectedMonster ? (
                <p className="muted">Sélectionne un monstre pour définir sa visibilité/état.</p>
              ) : (
                <>
                  <div className="form-grid">
                    <div>
                      <label htmlFor="group-monster-status">Statut</label>
                      <select
                        id="group-monster-status"
                        value={groupStatus}
                        onChange={(e) => setGroupStatus(e.target.value as GroupMonsterStatus)}
                        disabled={savingGroupState || saving}
                      >
                        {GROUP_MONSTER_STATUS_OPTIONS.map((entry) => (
                          <option key={entry} value={entry}>
                            {GROUP_MONSTER_STATUS_LABELS[entry]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="group-monster-defeat-session">ID Session (défaite)</label>
                      <input
                        id="group-monster-defeat-session"
                        value={defeatSessionId}
                        onChange={(e) => setDefeatSessionId(e.target.value)}
                        placeholder="ex: 12"
                        disabled={savingGroupState || saving}
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label htmlFor="group-monster-notes">Notes (pour ce groupe)</label>
                    <textarea
                      id="group-monster-notes"
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
