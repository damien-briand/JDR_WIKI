import express from "express"
import cors from "cors"
import { openDb } from "./db.js"
import { slugify } from "./slugify.js"

const PORT = Number.parseInt(process.env.PORT ?? "", 10) || 5174

const LOCATION_TYPES = new Set([
  "region",
  "city",
  "village",
  "dungeon",
  "castle",
  "temple",
  "poi",
  "route",
])

const GROUP_LOCATION_STATUSES = new Set([
  "undiscovered",
  "discovered",
  "partially_explored",
  "fully_explored",
  "cleared",
])

const GROUP_NPC_STATUSES = new Set([
  "unknown",
  "known",
  "met",
  "ally",
  "neutral",
  "hostile",
  "dead",
])

const GROUP_MONSTER_STATUSES = new Set(["unknown", "known", "encountered", "defeated"])

function isHexColor(value) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value)
}

function toIntOrNull(value) {
  if (value === null || value === undefined || value === "") {
    return null
  }

  const numberValue =
    typeof value === "number" ? value : Number.parseInt(String(value), 10)

  return Number.isInteger(numberValue) ? numberValue : null
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") {
    return null
  }

  const numberValue = typeof value === "number" ? value : Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

function toBooleanInt(value) {
  return value ? 1 : 0
}

function requireNonEmptyString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

function parsePositiveInt(value) {
  const parsed = Number.parseInt(String(value), 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

function uniqueSlugFor(table, baseSlug, idToExclude = null) {
  const db = openDb()
  const safeBase = baseSlug || "item"
  const existsStmt =
    idToExclude === null
      ? db.prepare(`SELECT 1 FROM ${table} WHERE slug = ? LIMIT 1`)
      : db.prepare(`SELECT 1 FROM ${table} WHERE slug = ? AND id != ? LIMIT 1`)

  let candidate = safeBase
  let index = 2

  while (true) {
    const row =
      idToExclude === null
        ? existsStmt.get(candidate)
        : existsStmt.get(candidate, idToExclude)

    if (!row) {
      return candidate
    }

    candidate = `${safeBase}-${index}`
    index += 1

    if (index > 9999) {
      throw new Error("Impossible de generer un slug unique.")
    }
  }
}

function handleError(res, error) {
  const message = error instanceof Error ? error.message : "Erreur inconnue."
  res.status(500).json({ error: message })
}

const app = express()

app.use(express.json({ limit: "1mb" }))

if (process.env.NODE_ENV !== "production") {
  app.use(cors({ origin: true }))
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true })
})

app.get("/api/config", (_req, res) => {
  try {
    const db = openDb()
    const rows = db.prepare("SELECT key, value FROM wiki_config").all()
    const config = {}

    for (const row of rows) {
      config[row.key] = row.value
    }

    res.json(config)
  } catch (error) {
    handleError(res, error)
  }
})

app.get("/api/groups", (_req, res) => {
  try {
    const db = openDb()
    const groups = db
      .prepare(
        "SELECT id, name, color, description, created_at, last_session_date, notes FROM groups ORDER BY id DESC",
      )
      .all()

    res.json(groups)
  } catch (error) {
    handleError(res, error)
  }
})

app.post("/api/groups", (req, res) => {
  try {
    const db = openDb()
    const name = requireNonEmptyString(req.body?.name)
    if (!name) {
      res.status(400).json({ error: "Le champ name est requis." })
      return
    }

    const color = isHexColor(req.body?.color) ? req.body.color : "#4a90d9"
    const lastSessionDate =
      typeof req.body?.last_session_date === "string" ? req.body.last_session_date : null
    const description = typeof req.body?.description === "string" ? req.body.description : null
    const notes = typeof req.body?.notes === "string" ? req.body.notes : null

    const result = db
      .prepare(
        "INSERT INTO groups (name, color, description, last_session_date, notes) VALUES (?, ?, ?, ?, ?)",
      )
      .run(name, color, description, lastSessionDate, notes)

    const created = db
      .prepare(
        "SELECT id, name, color, description, created_at, last_session_date, notes FROM groups WHERE id = ?",
      )
      .get(result.lastInsertRowid)

    res.status(201).json(created)
  } catch (error) {
    handleError(res, error)
  }
})

app.get("/api/groups/:id", (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id)
    if (!id) {
      res.status(400).json({ error: "ID invalide." })
      return
    }

    const db = openDb()
    const group = db
      .prepare(
        "SELECT id, name, color, description, created_at, last_session_date, notes FROM groups WHERE id = ?",
      )
      .get(id)

    if (!group) {
      res.status(404).json({ error: "Groupe introuvable." })
      return
    }

    res.json(group)
  } catch (error) {
    handleError(res, error)
  }
})

app.patch("/api/groups/:id", (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id)
    if (!id) {
      res.status(400).json({ error: "ID invalide." })
      return
    }

    const db = openDb()
    const current = db
      .prepare(
        "SELECT id, name, color, description, created_at, last_session_date, notes FROM groups WHERE id = ?",
      )
      .get(id)

    if (!current) {
      res.status(404).json({ error: "Groupe introuvable." })
      return
    }

    const nextName =
      req.body?.name === undefined ? current.name : requireNonEmptyString(req.body?.name)
    if (!nextName) {
      res.status(400).json({ error: "Le champ name ne peut pas etre vide." })
      return
    }

    const nextColor =
      req.body?.color === undefined
        ? current.color
        : isHexColor(req.body?.color)
          ? req.body.color
          : null

    if (req.body?.color !== undefined && !nextColor) {
      res.status(400).json({ error: "Le champ color est invalide (#RRGGBB)." })
      return
    }

    const nextDescription =
      req.body?.description === undefined
        ? current.description
        : typeof req.body?.description === "string"
          ? req.body.description
          : null

    const nextNotes =
      req.body?.notes === undefined
        ? current.notes
        : typeof req.body?.notes === "string"
          ? req.body.notes
          : null

    const nextLastSessionDate =
      req.body?.last_session_date === undefined
        ? current.last_session_date
        : typeof req.body?.last_session_date === "string"
          ? req.body.last_session_date
          : null

    db.prepare(
      "UPDATE groups SET name = ?, color = ?, description = ?, last_session_date = ?, notes = ? WHERE id = ?",
    ).run(nextName, nextColor, nextDescription, nextLastSessionDate, nextNotes, id)

    const updated = db
      .prepare(
        "SELECT id, name, color, description, created_at, last_session_date, notes FROM groups WHERE id = ?",
      )
      .get(id)

    res.json(updated)
  } catch (error) {
    handleError(res, error)
  }
})

app.delete("/api/groups/:id", (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id)
    if (!id) {
      res.status(400).json({ error: "ID invalide." })
      return
    }

    const db = openDb()
    const result = db.prepare("DELETE FROM groups WHERE id = ?").run(id)

    if (result.changes === 0) {
      res.status(404).json({ error: "Groupe introuvable." })
      return
    }

    res.status(204).end()
  } catch (error) {
    handleError(res, error)
  }
})

app.get("/api/groups/:id/location-states", (req, res) => {
  try {
    const groupId = parsePositiveInt(req.params.id)
    if (!groupId) {
      res.status(400).json({ error: "ID invalide." })
      return
    }

    const db = openDb()

    const group = db.prepare("SELECT id FROM groups WHERE id = ?").get(groupId)
    if (!group) {
      res.status(404).json({ error: "Groupe introuvable." })
      return
    }

    const states = db
      .prepare(
        "SELECT group_id, location_id, status, notes, discovery_session_id FROM group_location_state WHERE group_id = ? ORDER BY location_id ASC",
      )
      .all(groupId)

    res.json(states)
  } catch (error) {
    handleError(res, error)
  }
})

app.put("/api/groups/:id/location-states/:locationId", (req, res) => {
  try {
    const groupId = parsePositiveInt(req.params.id)
    const locationId = parsePositiveInt(req.params.locationId)

    if (!groupId || !locationId) {
      res.status(400).json({ error: "ID invalide." })
      return
    }

    const status = requireNonEmptyString(req.body?.status)
    if (!status || !GROUP_LOCATION_STATUSES.has(status)) {
      res.status(400).json({
        error:
          "Le champ status est invalide (undiscovered/discovered/partially_explored/fully_explored/cleared).",
      })
      return
    }

    const notes = typeof req.body?.notes === "string" ? req.body.notes : null
    const discoverySessionId = toIntOrNull(req.body?.discovery_session_id)

    const db = openDb()

    const group = db.prepare("SELECT id FROM groups WHERE id = ?").get(groupId)
    if (!group) {
      res.status(404).json({ error: "Groupe introuvable." })
      return
    }

    const location = db.prepare("SELECT id FROM locations WHERE id = ?").get(locationId)
    if (!location) {
      res.status(404).json({ error: "Lieu introuvable." })
      return
    }

    db.prepare(
      "INSERT INTO group_location_state (group_id, location_id, status, notes, discovery_session_id) VALUES (?, ?, ?, ?, ?) ON CONFLICT(group_id, location_id) DO UPDATE SET status = excluded.status, notes = excluded.notes, discovery_session_id = excluded.discovery_session_id",
    ).run(groupId, locationId, status, notes, discoverySessionId)

    const updated = db
      .prepare(
        "SELECT group_id, location_id, status, notes, discovery_session_id FROM group_location_state WHERE group_id = ? AND location_id = ?",
      )
      .get(groupId, locationId)

    res.json(updated)
  } catch (error) {
    handleError(res, error)
  }
})

app.get("/api/groups/:id/npc-states", (req, res) => {
  try {
    const groupId = parsePositiveInt(req.params.id)
    if (!groupId) {
      res.status(400).json({ error: "ID invalide." })
      return
    }

    const db = openDb()

    const group = db.prepare("SELECT id FROM groups WHERE id = ?").get(groupId)
    if (!group) {
      res.status(404).json({ error: "Groupe introuvable." })
      return
    }

    const states = db
      .prepare(
        "SELECT group_id, npc_id, status, relationship_notes FROM group_npc_state WHERE group_id = ? ORDER BY npc_id ASC",
      )
      .all(groupId)

    res.json(states)
  } catch (error) {
    handleError(res, error)
  }
})

app.put("/api/groups/:id/npc-states/:npcId", (req, res) => {
  try {
    const groupId = parsePositiveInt(req.params.id)
    const npcId = parsePositiveInt(req.params.npcId)

    if (!groupId || !npcId) {
      res.status(400).json({ error: "ID invalide." })
      return
    }

    const status = requireNonEmptyString(req.body?.status)
    if (!status || !GROUP_NPC_STATUSES.has(status)) {
      res.status(400).json({
        error:
          "Le champ status est invalide (unknown/known/met/ally/neutral/hostile/dead).",
      })
      return
    }

    const relationshipNotes =
      typeof req.body?.relationship_notes === "string" ? req.body.relationship_notes : null

    const db = openDb()

    const group = db.prepare("SELECT id FROM groups WHERE id = ?").get(groupId)
    if (!group) {
      res.status(404).json({ error: "Groupe introuvable." })
      return
    }

    const npc = db.prepare("SELECT id FROM npcs WHERE id = ?").get(npcId)
    if (!npc) {
      res.status(404).json({ error: "PNJ introuvable." })
      return
    }

    db.prepare(
      "INSERT INTO group_npc_state (group_id, npc_id, status, relationship_notes) VALUES (?, ?, ?, ?) ON CONFLICT(group_id, npc_id) DO UPDATE SET status = excluded.status, relationship_notes = excluded.relationship_notes",
    ).run(groupId, npcId, status, relationshipNotes)

    const updated = db
      .prepare(
        "SELECT group_id, npc_id, status, relationship_notes FROM group_npc_state WHERE group_id = ? AND npc_id = ?",
      )
      .get(groupId, npcId)

    res.json(updated)
  } catch (error) {
    handleError(res, error)
  }
})

app.get("/api/groups/:id/monster-states", (req, res) => {
  try {
    const groupId = parsePositiveInt(req.params.id)
    if (!groupId) {
      res.status(400).json({ error: "ID invalide." })
      return
    }

    const db = openDb()

    const group = db.prepare("SELECT id FROM groups WHERE id = ?").get(groupId)
    if (!group) {
      res.status(404).json({ error: "Groupe introuvable." })
      return
    }

    const states = db
      .prepare(
        "SELECT group_id, monster_id, status, defeat_session_id, notes FROM group_monster_state WHERE group_id = ? ORDER BY monster_id ASC",
      )
      .all(groupId)

    res.json(states)
  } catch (error) {
    handleError(res, error)
  }
})

app.put("/api/groups/:id/monster-states/:monsterId", (req, res) => {
  try {
    const groupId = parsePositiveInt(req.params.id)
    const monsterId = parsePositiveInt(req.params.monsterId)

    if (!groupId || !monsterId) {
      res.status(400).json({ error: "ID invalide." })
      return
    }

    const status = requireNonEmptyString(req.body?.status)
    if (!status || !GROUP_MONSTER_STATUSES.has(status)) {
      res.status(400).json({
        error: "Le champ status est invalide (unknown/known/encountered/defeated).",
      })
      return
    }

    const notes = typeof req.body?.notes === "string" ? req.body.notes : null
    const defeatSessionId = toIntOrNull(req.body?.defeat_session_id)

    const db = openDb()

    const group = db.prepare("SELECT id FROM groups WHERE id = ?").get(groupId)
    if (!group) {
      res.status(404).json({ error: "Groupe introuvable." })
      return
    }

    const monster = db.prepare("SELECT id FROM monsters WHERE id = ?").get(monsterId)
    if (!monster) {
      res.status(404).json({ error: "Monstre introuvable." })
      return
    }

    db.prepare(
      "INSERT INTO group_monster_state (group_id, monster_id, status, defeat_session_id, notes) VALUES (?, ?, ?, ?, ?) ON CONFLICT(group_id, monster_id) DO UPDATE SET status = excluded.status, defeat_session_id = excluded.defeat_session_id, notes = excluded.notes",
    ).run(groupId, monsterId, status, defeatSessionId, notes)

    const updated = db
      .prepare(
        "SELECT group_id, monster_id, status, defeat_session_id, notes FROM group_monster_state WHERE group_id = ? AND monster_id = ?",
      )
      .get(groupId, monsterId)

    res.json(updated)
  } catch (error) {
    handleError(res, error)
  }
})

app.get("/api/locations", (_req, res) => {
  try {
    const db = openDb()
    const locations = db
      .prepare(
        "SELECT id, name, slug, type, parent_id, description, lore, atmosphere, secrets, map_x, map_y, image_url, is_discovered_default, created_at FROM locations ORDER BY id DESC",
      )
      .all()

    res.json(locations)
  } catch (error) {
    handleError(res, error)
  }
})

app.post("/api/locations", (req, res) => {
  try {
    const db = openDb()
    const name = requireNonEmptyString(req.body?.name)
    if (!name) {
      res.status(400).json({ error: "Le champ name est requis." })
      return
    }

    const type = requireNonEmptyString(req.body?.type)
    if (!type || !LOCATION_TYPES.has(type)) {
      res.status(400).json({
        error: "Le champ type est invalide (region/city/village/dungeon/castle/temple/poi/route).",
      })
      return
    }

    const rawSlug = typeof req.body?.slug === "string" ? req.body.slug : ""
    const baseSlug = slugify(rawSlug.trim() || name)
    if (!baseSlug) {
      res.status(400).json({ error: "Impossible de generer un slug." })
      return
    }

    const slug = uniqueSlugFor("locations", baseSlug)
    const parentId = toIntOrNull(req.body?.parent_id)

    const description = typeof req.body?.description === "string" ? req.body.description : null
    const lore = typeof req.body?.lore === "string" ? req.body.lore : null
    const atmosphere = typeof req.body?.atmosphere === "string" ? req.body.atmosphere : null
    const secrets = typeof req.body?.secrets === "string" ? req.body.secrets : null

    const mapX = toNumberOrNull(req.body?.map_x)
    const mapY = toNumberOrNull(req.body?.map_y)

    const imageUrl = typeof req.body?.image_url === "string" ? req.body.image_url : null
    const discoveredDefault = toBooleanInt(req.body?.is_discovered_default)

    const insert = db.prepare(
      "INSERT INTO locations (name, slug, type, parent_id, description, lore, atmosphere, secrets, map_x, map_y, image_url, is_discovered_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )

    const result = insert.run(
      name,
      slug,
      type,
      parentId,
      description,
      lore,
      atmosphere,
      secrets,
      mapX,
      mapY,
      imageUrl,
      discoveredDefault,
    )

    const created = db
      .prepare(
        "SELECT id, name, slug, type, parent_id, description, lore, atmosphere, secrets, map_x, map_y, image_url, is_discovered_default, created_at FROM locations WHERE id = ?",
      )
      .get(result.lastInsertRowid)

    res.status(201).json(created)
  } catch (error) {
    handleError(res, error)
  }
})

app.get("/api/locations/:id", (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id)
    if (!id) {
      res.status(400).json({ error: "ID invalide." })
      return
    }

    const db = openDb()
    const location = db
      .prepare(
        "SELECT id, name, slug, type, parent_id, description, lore, atmosphere, secrets, map_x, map_y, image_url, is_discovered_default, created_at FROM locations WHERE id = ?",
      )
      .get(id)

    if (!location) {
      res.status(404).json({ error: "Lieu introuvable." })
      return
    }

    res.json(location)
  } catch (error) {
    handleError(res, error)
  }
})

app.patch("/api/locations/:id", (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id)
    if (!id) {
      res.status(400).json({ error: "ID invalide." })
      return
    }

    const db = openDb()
    const current = db
      .prepare(
        "SELECT id, name, slug, type, parent_id, description, lore, atmosphere, secrets, map_x, map_y, image_url, is_discovered_default, created_at FROM locations WHERE id = ?",
      )
      .get(id)

    if (!current) {
      res.status(404).json({ error: "Lieu introuvable." })
      return
    }

    const nextName =
      req.body?.name === undefined ? current.name : requireNonEmptyString(req.body?.name)
    if (!nextName) {
      res.status(400).json({ error: "Le champ name ne peut pas etre vide." })
      return
    }

    const nextType =
      req.body?.type === undefined ? current.type : requireNonEmptyString(req.body?.type)
    if (!nextType || !LOCATION_TYPES.has(nextType)) {
      res.status(400).json({
        error: "Le champ type est invalide (region/city/village/dungeon/castle/temple/poi/route).",
      })
      return
    }

    const nextParentId =
      req.body?.parent_id === undefined ? current.parent_id : toIntOrNull(req.body?.parent_id)

    const nextDescription =
      req.body?.description === undefined
        ? current.description
        : typeof req.body?.description === "string"
          ? req.body.description
          : null

    const nextLore =
      req.body?.lore === undefined
        ? current.lore
        : typeof req.body?.lore === "string"
          ? req.body.lore
          : null

    const nextAtmosphere =
      req.body?.atmosphere === undefined
        ? current.atmosphere
        : typeof req.body?.atmosphere === "string"
          ? req.body.atmosphere
          : null

    const nextSecrets =
      req.body?.secrets === undefined
        ? current.secrets
        : typeof req.body?.secrets === "string"
          ? req.body.secrets
          : null

    const nextMapX = req.body?.map_x === undefined ? current.map_x : toNumberOrNull(req.body?.map_x)
    const nextMapY = req.body?.map_y === undefined ? current.map_y : toNumberOrNull(req.body?.map_y)

    const nextImageUrl =
      req.body?.image_url === undefined
        ? current.image_url
        : typeof req.body?.image_url === "string"
          ? req.body.image_url
          : null

    const nextDiscoveredDefault =
      req.body?.is_discovered_default === undefined
        ? current.is_discovered_default
        : toBooleanInt(req.body?.is_discovered_default)

    const rawSlug =
      req.body?.slug === undefined ? current.slug : typeof req.body?.slug === "string" ? req.body.slug : ""

    const baseSlug = slugify(rawSlug.trim() || nextName)
    if (!baseSlug) {
      res.status(400).json({ error: "Impossible de generer un slug." })
      return
    }

    const nextSlug = uniqueSlugFor("locations", baseSlug, id)

    db.prepare(
      "UPDATE locations SET name = ?, slug = ?, type = ?, parent_id = ?, description = ?, lore = ?, atmosphere = ?, secrets = ?, map_x = ?, map_y = ?, image_url = ?, is_discovered_default = ? WHERE id = ?",
    ).run(
      nextName,
      nextSlug,
      nextType,
      nextParentId,
      nextDescription,
      nextLore,
      nextAtmosphere,
      nextSecrets,
      nextMapX,
      nextMapY,
      nextImageUrl,
      nextDiscoveredDefault,
      id,
    )

    const updated = db
      .prepare(
        "SELECT id, name, slug, type, parent_id, description, lore, atmosphere, secrets, map_x, map_y, image_url, is_discovered_default, created_at FROM locations WHERE id = ?",
      )
      .get(id)

    res.json(updated)
  } catch (error) {
    handleError(res, error)
  }
})

app.delete("/api/locations/:id", (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id)
    if (!id) {
      res.status(400).json({ error: "ID invalide." })
      return
    }

    const db = openDb()
    const result = db.prepare("DELETE FROM locations WHERE id = ?").run(id)

    if (result.changes === 0) {
      res.status(404).json({ error: "Lieu introuvable." })
      return
    }

    res.status(204).end()
  } catch (error) {
    handleError(res, error)
  }
})

app.get("/api/npcs", (_req, res) => {
  try {
    const db = openDb()
    const npcs = db
      .prepare(
        "SELECT id, name, slug, type, location_id, description, lore, personality, secrets, image_url, is_unique, default_status, created_at FROM npcs ORDER BY id DESC",
      )
      .all()

    res.json(npcs)
  } catch (error) {
    handleError(res, error)
  }
})

app.post("/api/npcs", (req, res) => {
  try {
    const db = openDb()
    const name = requireNonEmptyString(req.body?.name)
    if (!name) {
      res.status(400).json({ error: "Le champ name est requis." })
      return
    }

    const rawSlug = typeof req.body?.slug === "string" ? req.body.slug : ""
    const baseSlug = slugify(rawSlug.trim() || name)
    if (!baseSlug) {
      res.status(400).json({ error: "Impossible de generer un slug." })
      return
    }

    const slug = uniqueSlugFor("npcs", baseSlug)
    const type = requireNonEmptyString(req.body?.type) ?? "neutral"
    const locationId = toIntOrNull(req.body?.location_id)

    const description = typeof req.body?.description === "string" ? req.body.description : null
    const lore = typeof req.body?.lore === "string" ? req.body.lore : null
    const personality = typeof req.body?.personality === "string" ? req.body.personality : null
    const secrets = typeof req.body?.secrets === "string" ? req.body.secrets : null
    const imageUrl = typeof req.body?.image_url === "string" ? req.body.image_url : null
    const isUnique = toBooleanInt(req.body?.is_unique)
    const defaultStatus = requireNonEmptyString(req.body?.default_status) ?? "alive"

    const result = db
      .prepare(
        "INSERT INTO npcs (name, slug, type, location_id, description, lore, personality, secrets, image_url, is_unique, default_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        name,
        slug,
        type,
        locationId,
        description,
        lore,
        personality,
        secrets,
        imageUrl,
        isUnique,
        defaultStatus,
      )

    const created = db
      .prepare(
        "SELECT id, name, slug, type, location_id, description, lore, personality, secrets, image_url, is_unique, default_status, created_at FROM npcs WHERE id = ?",
      )
      .get(result.lastInsertRowid)

    res.status(201).json(created)
  } catch (error) {
    handleError(res, error)
  }
})

app.get("/api/npcs/:id", (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id)
    if (!id) {
      res.status(400).json({ error: "ID invalide." })
      return
    }

    const db = openDb()
    const npc = db
      .prepare(
        "SELECT id, name, slug, type, location_id, description, lore, personality, secrets, image_url, is_unique, default_status, created_at FROM npcs WHERE id = ?",
      )
      .get(id)

    if (!npc) {
      res.status(404).json({ error: "PNJ introuvable." })
      return
    }

    res.json(npc)
  } catch (error) {
    handleError(res, error)
  }
})

app.patch("/api/npcs/:id", (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id)
    if (!id) {
      res.status(400).json({ error: "ID invalide." })
      return
    }

    const db = openDb()
    const current = db
      .prepare(
        "SELECT id, name, slug, type, location_id, description, lore, personality, secrets, image_url, is_unique, default_status, created_at FROM npcs WHERE id = ?",
      )
      .get(id)

    if (!current) {
      res.status(404).json({ error: "PNJ introuvable." })
      return
    }

    const nextName = req.body?.name === undefined ? current.name : requireNonEmptyString(req.body?.name)
    if (!nextName) {
      res.status(400).json({ error: "Le champ name ne peut pas etre vide." })
      return
    }

    const nextType =
      req.body?.type === undefined ? current.type : requireNonEmptyString(req.body?.type)
    if (!nextType) {
      res.status(400).json({ error: "Le champ type ne peut pas etre vide." })
      return
    }

    const nextLocationId =
      req.body?.location_id === undefined ? current.location_id : toIntOrNull(req.body?.location_id)

    const nextDescription =
      req.body?.description === undefined
        ? current.description
        : typeof req.body?.description === "string"
          ? req.body.description
          : null

    const nextLore =
      req.body?.lore === undefined
        ? current.lore
        : typeof req.body?.lore === "string"
          ? req.body.lore
          : null

    const nextPersonality =
      req.body?.personality === undefined
        ? current.personality
        : typeof req.body?.personality === "string"
          ? req.body.personality
          : null

    const nextSecrets =
      req.body?.secrets === undefined
        ? current.secrets
        : typeof req.body?.secrets === "string"
          ? req.body.secrets
          : null

    const nextImageUrl =
      req.body?.image_url === undefined
        ? current.image_url
        : typeof req.body?.image_url === "string"
          ? req.body.image_url
          : null

    const nextIsUnique =
      req.body?.is_unique === undefined ? current.is_unique : toBooleanInt(req.body?.is_unique)

    const nextDefaultStatus =
      req.body?.default_status === undefined
        ? current.default_status
        : requireNonEmptyString(req.body?.default_status)
    if (req.body?.default_status !== undefined && !nextDefaultStatus) {
      res.status(400).json({ error: "Le champ default_status ne peut pas etre vide." })
      return
    }

    const rawSlug =
      req.body?.slug === undefined
        ? current.slug
        : typeof req.body?.slug === "string"
          ? req.body.slug
          : ""

    const baseSlug = slugify(rawSlug.trim() || nextName)
    if (!baseSlug) {
      res.status(400).json({ error: "Impossible de generer un slug." })
      return
    }

    const nextSlug = uniqueSlugFor("npcs", baseSlug, id)

    db.prepare(
      "UPDATE npcs SET name = ?, slug = ?, type = ?, location_id = ?, description = ?, lore = ?, personality = ?, secrets = ?, image_url = ?, is_unique = ?, default_status = ? WHERE id = ?",
    ).run(
      nextName,
      nextSlug,
      nextType,
      nextLocationId,
      nextDescription,
      nextLore,
      nextPersonality,
      nextSecrets,
      nextImageUrl,
      nextIsUnique,
      nextDefaultStatus,
      id,
    )

    const updated = db
      .prepare(
        "SELECT id, name, slug, type, location_id, description, lore, personality, secrets, image_url, is_unique, default_status, created_at FROM npcs WHERE id = ?",
      )
      .get(id)

    res.json(updated)
  } catch (error) {
    handleError(res, error)
  }
})

app.delete("/api/npcs/:id", (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id)
    if (!id) {
      res.status(400).json({ error: "ID invalide." })
      return
    }

    const db = openDb()
    const result = db.prepare("DELETE FROM npcs WHERE id = ?").run(id)

    if (result.changes === 0) {
      res.status(404).json({ error: "PNJ introuvable." })
      return
    }

    res.status(204).end()
  } catch (error) {
    handleError(res, error)
  }
})

app.get("/api/monsters", (_req, res) => {
  try {
    const db = openDb()
    const monsters = db
      .prepare(
        "SELECT id, name, slug, tier, category, description, lore, difficulty, image_url, is_boss, secrets, created_at FROM monsters ORDER BY id DESC",
      )
      .all()

    res.json(monsters)
  } catch (error) {
    handleError(res, error)
  }
})

app.post("/api/monsters", (req, res) => {
  try {
    const db = openDb()
    const name = requireNonEmptyString(req.body?.name)
    if (!name) {
      res.status(400).json({ error: "Le champ name est requis." })
      return
    }

    const rawSlug = typeof req.body?.slug === "string" ? req.body.slug : ""
    const baseSlug = slugify(rawSlug.trim() || name)
    if (!baseSlug) {
      res.status(400).json({ error: "Impossible de generer un slug." })
      return
    }

    const slug = uniqueSlugFor("monsters", baseSlug)

    const tier = toIntOrNull(req.body?.tier) ?? 1
    const category = typeof req.body?.category === "string" ? req.body.category : null
    const description = typeof req.body?.description === "string" ? req.body.description : null
    const lore = typeof req.body?.lore === "string" ? req.body.lore : null
    const secrets = typeof req.body?.secrets === "string" ? req.body.secrets : null
    const difficulty = toIntOrNull(req.body?.difficulty) ?? 12
    const imageUrl = typeof req.body?.image_url === "string" ? req.body.image_url : null
    const isBoss = toBooleanInt(req.body?.is_boss)

    const result = db
      .prepare(
        "INSERT INTO monsters (name, slug, tier, category, description, lore, difficulty, image_url, is_boss, secrets) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(name, slug, tier, category, description, lore, difficulty, imageUrl, isBoss, secrets)

    const created = db
      .prepare(
        "SELECT id, name, slug, tier, category, description, lore, difficulty, image_url, is_boss, secrets, created_at FROM monsters WHERE id = ?",
      )
      .get(result.lastInsertRowid)

    res.status(201).json(created)
  } catch (error) {
    handleError(res, error)
  }
})

app.get("/api/monsters/:id", (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id)
    if (!id) {
      res.status(400).json({ error: "ID invalide." })
      return
    }

    const db = openDb()
    const monster = db
      .prepare(
        "SELECT id, name, slug, tier, category, description, lore, difficulty, image_url, is_boss, secrets, created_at FROM monsters WHERE id = ?",
      )
      .get(id)

    if (!monster) {
      res.status(404).json({ error: "Monstre introuvable." })
      return
    }

    res.json(monster)
  } catch (error) {
    handleError(res, error)
  }
})

app.patch("/api/monsters/:id", (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id)
    if (!id) {
      res.status(400).json({ error: "ID invalide." })
      return
    }

    const db = openDb()
    const current = db
      .prepare(
        "SELECT id, name, slug, tier, category, description, lore, difficulty, image_url, is_boss, secrets, created_at FROM monsters WHERE id = ?",
      )
      .get(id)

    if (!current) {
      res.status(404).json({ error: "Monstre introuvable." })
      return
    }

    const nextName = req.body?.name === undefined ? current.name : requireNonEmptyString(req.body?.name)
    if (!nextName) {
      res.status(400).json({ error: "Le champ name ne peut pas etre vide." })
      return
    }

    const nextTier = req.body?.tier === undefined ? current.tier : toIntOrNull(req.body?.tier)
    if (req.body?.tier !== undefined && nextTier === null) {
      res.status(400).json({ error: "Le champ tier doit etre un entier." })
      return
    }

    const nextCategory =
      req.body?.category === undefined
        ? current.category
        : typeof req.body?.category === "string"
          ? req.body.category
          : null

    const nextDescription =
      req.body?.description === undefined
        ? current.description
        : typeof req.body?.description === "string"
          ? req.body.description
          : null

    const nextLore =
      req.body?.lore === undefined
        ? current.lore
        : typeof req.body?.lore === "string"
          ? req.body.lore
          : null

    const nextSecrets =
      req.body?.secrets === undefined
        ? current.secrets
        : typeof req.body?.secrets === "string"
          ? req.body.secrets
          : null

    const nextDifficulty =
      req.body?.difficulty === undefined ? current.difficulty : toIntOrNull(req.body?.difficulty)
    if (req.body?.difficulty !== undefined && nextDifficulty === null) {
      res.status(400).json({ error: "Le champ difficulty doit etre un entier." })
      return
    }

    const nextImageUrl =
      req.body?.image_url === undefined
        ? current.image_url
        : typeof req.body?.image_url === "string"
          ? req.body.image_url
          : null

    const nextIsBoss = req.body?.is_boss === undefined ? current.is_boss : toBooleanInt(req.body?.is_boss)

    const rawSlug =
      req.body?.slug === undefined
        ? current.slug
        : typeof req.body?.slug === "string"
          ? req.body.slug
          : ""

    const baseSlug = slugify(rawSlug.trim() || nextName)
    if (!baseSlug) {
      res.status(400).json({ error: "Impossible de generer un slug." })
      return
    }

    const nextSlug = uniqueSlugFor("monsters", baseSlug, id)

    db.prepare(
      "UPDATE monsters SET name = ?, slug = ?, tier = ?, category = ?, description = ?, lore = ?, difficulty = ?, image_url = ?, is_boss = ?, secrets = ? WHERE id = ?",
    ).run(
      nextName,
      nextSlug,
      nextTier,
      nextCategory,
      nextDescription,
      nextLore,
      nextDifficulty,
      nextImageUrl,
      nextIsBoss,
      nextSecrets,
      id,
    )

    const updated = db
      .prepare(
        "SELECT id, name, slug, tier, category, description, lore, difficulty, image_url, is_boss, secrets, created_at FROM monsters WHERE id = ?",
      )
      .get(id)

    res.json(updated)
  } catch (error) {
    handleError(res, error)
  }
})

app.delete("/api/monsters/:id", (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id)
    if (!id) {
      res.status(400).json({ error: "ID invalide." })
      return
    }

    const db = openDb()
    const result = db.prepare("DELETE FROM monsters WHERE id = ?").run(id)

    if (result.changes === 0) {
      res.status(404).json({ error: "Monstre introuvable." })
      return
    }

    res.status(204).end()
  } catch (error) {
    handleError(res, error)
  }
})

app.listen(PORT, () => {
  console.log(`API JDR Wiki prete sur http://localhost:${PORT}`)
})
