PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#4a90d9',
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_session_date DATE,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER REFERENCES groups(id),
  session_number INTEGER NOT NULL,
  session_date DATE,
  title TEXT,
  summary TEXT,
  notes_gm TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER REFERENCES groups(id),
  player_name TEXT,
  character_name TEXT NOT NULL,
  heritage TEXT,
  pronouns TEXT,
  class TEXT NOT NULL,
  subclass TEXT,
  level INTEGER DEFAULT 1,
  proficiency INTEGER DEFAULT 1,
  agility INTEGER DEFAULT 0,
  strength INTEGER DEFAULT 0,
  finesse INTEGER DEFAULT 0,
  instinct INTEGER DEFAULT 0,
  presence INTEGER DEFAULT 0,
  knowledge INTEGER DEFAULT 0,
  hp_slots INTEGER DEFAULT 3,
  hp_marks INTEGER DEFAULT 0,
  stress_slots INTEGER DEFAULT 6,
  stress_marks INTEGER DEFAULT 0,
  evasion INTEGER DEFAULT 10,
  armor_score INTEGER DEFAULT 0,
  armor_threshold_minor INTEGER DEFAULT 0,
  armor_threshold_major INTEGER DEFAULT 0,
  armor_slots INTEGER DEFAULT 0,
  armor_slots_marked INTEGER DEFAULT 0,
  hope_current INTEGER DEFAULT 0,
  hope_start INTEGER DEFAULT 10,
  background_text TEXT,
  description TEXT,
  notes TEXT,
  image_url TEXT,
  active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS character_experiences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER REFERENCES players(id),
  name TEXT NOT NULL,
  bonus INTEGER DEFAULT 2,
  is_companion_exp BOOLEAN DEFAULT 0
);

CREATE TABLE IF NOT EXISTS equipment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT CHECK(category IN ('weapon','armor','consumable','artifact','general','domain_card')),
  description TEXT,
  lore TEXT,
  weapon_trait TEXT,
  weapon_range TEXT,
  weapon_damage_dice TEXT,
  weapon_damage_type TEXT,
  weapon_hands INTEGER DEFAULT 1,
  weapon_feature TEXT,
  armor_threshold_base_minor INTEGER,
  armor_threshold_base_major INTEGER,
  armor_score_base INTEGER,
  armor_feature TEXT,
  domain TEXT,
  domain_level INTEGER,
  domain_effect TEXT,
  rarity TEXT DEFAULT 'common',
  value_handfuls INTEGER DEFAULT 0,
  value_bags INTEGER DEFAULT 0,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS character_weapons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER REFERENCES players(id),
  slot TEXT CHECK(slot IN ('primary','secondary','inventory1','inventory2')),
  weapon_id INTEGER REFERENCES equipment(id),
  is_active BOOLEAN DEFAULT 1
);

CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT CHECK(type IN ('region','city','village','dungeon','castle','temple','poi','route')),
  parent_id INTEGER REFERENCES locations(id),
  description TEXT,
  lore TEXT,
  atmosphere TEXT,
  secrets TEXT,
  map_x REAL,
  map_y REAL,
  image_url TEXT,
  is_discovered_default BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS npcs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'neutral',
  location_id INTEGER REFERENCES locations(id),
  description TEXT,
  lore TEXT,
  personality TEXT,
  secrets TEXT,
  image_url TEXT,
  is_unique BOOLEAN DEFAULT 0,
  default_status TEXT DEFAULT 'alive',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS monsters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tier INTEGER DEFAULT 1,
  category TEXT,
  description TEXT,
  lore TEXT,
  hp_threshold_minor INTEGER,
  hp_threshold_major INTEGER,
  hp_threshold_severe INTEGER,
  evasion INTEGER DEFAULT 10,
  armor_score INTEGER DEFAULT 0,
  attack_name TEXT,
  attack_trait TEXT,
  attack_range TEXT,
  attack_damage_dice TEXT,
  attack_damage_type TEXT CHECK(attack_damage_type IN ('phy','mag')),
  attack_feature TEXT,
  special_abilities TEXT,
  resistances TEXT,
  vulnerabilities TEXT,
  difficulty INTEGER DEFAULT 12,
  image_url TEXT,
  is_boss BOOLEAN DEFAULT 0,
  secrets TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lore_articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT,
  content TEXT,
  visibility TEXT DEFAULT 'public',
  visible_to_group INTEGER REFERENCES groups(id),
  tags TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS location_connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  location_from INTEGER REFERENCES locations(id),
  location_to INTEGER REFERENCES locations(id),
  travel_description TEXT,
  UNIQUE(location_from, location_to)
);

CREATE TABLE IF NOT EXISTS wiki_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_type TEXT NOT NULL,
  source_id INTEGER NOT NULL,
  target_type TEXT NOT NULL,
  target_id INTEGER NOT NULL,
  link_label TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(source_type, source_id, target_type, target_id)
);

CREATE TABLE IF NOT EXISTS location_npcs (
  location_id INTEGER REFERENCES locations(id),
  npc_id INTEGER REFERENCES npcs(id),
  notes TEXT,
  PRIMARY KEY(location_id, npc_id)
);

CREATE TABLE IF NOT EXISTS location_monsters (
  location_id INTEGER REFERENCES locations(id),
  monster_id INTEGER REFERENCES monsters(id),
  quantity TEXT DEFAULT 'plusieurs',
  notes TEXT,
  PRIMARY KEY(location_id, monster_id)
);

CREATE TABLE IF NOT EXISTS location_equipment (
  location_id INTEGER REFERENCES locations(id),
  equipment_id INTEGER REFERENCES equipment(id),
  acquisition_method TEXT,
  notes TEXT,
  PRIMARY KEY(location_id, equipment_id)
);

CREATE TABLE IF NOT EXISTS monster_drops (
  monster_id INTEGER REFERENCES monsters(id),
  equipment_id INTEGER REFERENCES equipment(id),
  drop_rate TEXT DEFAULT 'commun',
  notes TEXT,
  PRIMARY KEY(monster_id, equipment_id)
);

CREATE TABLE IF NOT EXISTS group_location_state (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER REFERENCES groups(id),
  location_id INTEGER REFERENCES locations(id),
  status TEXT DEFAULT 'undiscovered',
  notes TEXT,
  discovery_session_id INTEGER REFERENCES sessions(id),
  UNIQUE(group_id, location_id)
);

CREATE TABLE IF NOT EXISTS group_npc_state (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER REFERENCES groups(id),
  npc_id INTEGER REFERENCES npcs(id),
  status TEXT DEFAULT 'unknown',
  relationship_notes TEXT,
  UNIQUE(group_id, npc_id)
);

CREATE TABLE IF NOT EXISTS group_monster_state (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER REFERENCES groups(id),
  monster_id INTEGER REFERENCES monsters(id),
  status TEXT DEFAULT 'unknown',
  defeat_session_id INTEGER REFERENCES sessions(id),
  notes TEXT,
  UNIQUE(group_id, monster_id)
);

CREATE TABLE IF NOT EXISTS world_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER REFERENCES groups(id),
  session_id INTEGER REFERENCES sessions(id),
  event_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT,
  related_location_id INTEGER REFERENCES locations(id),
  related_npc_id INTEGER REFERENCES npcs(id),
  related_monster_id INTEGER REFERENCES monsters(id),
  is_world_changing BOOLEAN DEFAULT 0
);

CREATE TABLE IF NOT EXISTS wiki_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  description TEXT
);

INSERT OR IGNORE INTO wiki_config(key, value, description) VALUES
  ('world_name', 'Mon Monde', 'Nom du monde de jeu'),
  ('gm_name', 'MJ', 'Nom du Maître du Jeu'),
  ('game_system', 'Daggerheart', 'Système de règles utilisé'),
  ('theme_color', '#1a1a2e', 'Couleur principale du thème');

CREATE INDEX IF NOT EXISTS idx_players_group ON players(group_id);
CREATE INDEX IF NOT EXISTS idx_npcs_location ON npcs(location_id);
CREATE INDEX IF NOT EXISTS idx_wiki_links_source ON wiki_links(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_wiki_links_target ON wiki_links(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_group_location ON group_location_state(group_id);
CREATE INDEX IF NOT EXISTS idx_world_events_group ON world_events(group_id);
CREATE INDEX IF NOT EXISTS idx_locations_parent ON locations(parent_id);
