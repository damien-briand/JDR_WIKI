# JDR_WIKI

Application locale de gestion JDR (wiki multi-groupes) + outil de carte interactive.

## Demarrer

### 1) Installer

```bash
npm install
```

### 2) Lancer l'API (Express + SQLite)

```bash
npm run dev:api
```

Par defaut, la base SQLite est creee ici: `backend/data/wiki.db`.

Pour changer l'emplacement:

```bash
JDR_WIKI_DB_PATH=/chemin/vers/wiki.db npm run dev:api
```

### 3) Lancer le front (Vite)

```bash
npm run dev
```

Le front proxifie `/api` vers `http://localhost:5174` en dev.

## Endpoints disponibles (MVP)

- `GET /api/health`
- `GET /api/config`
- `GET /api/groups` / `POST /api/groups`
- `GET /api/groups/:id` / `PATCH /api/groups/:id` / `DELETE /api/groups/:id`
- `GET /api/locations` / `POST /api/locations`
- `GET /api/locations/:id` / `PATCH /api/locations/:id` / `DELETE /api/locations/:id`
