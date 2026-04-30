import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { DatabaseSync } from "node:sqlite"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DEFAULT_DB_PATH = path.join(__dirname, "data", "wiki.db")

function resolveDbPath() {
  const raw = process.env.JDR_WIKI_DB_PATH
  if (raw && raw.trim()) {
    return path.isAbsolute(raw) ? raw : path.join(process.cwd(), raw)
  }

  return DEFAULT_DB_PATH
}

let singleton = null

export function openDb() {
  if (singleton) {
    return singleton
  }

  const dbPath = resolveDbPath()
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })

  const db = new DatabaseSync(dbPath)
  db.exec("PRAGMA foreign_keys = ON;")
  db.exec("PRAGMA journal_mode = WAL;")
  db.exec("PRAGMA busy_timeout = 5000;")

  const schemaPath = path.join(__dirname, "schema.sql")
  const schema = fs.readFileSync(schemaPath, "utf8")
  db.exec(schema)

  singleton = db
  return db
}
