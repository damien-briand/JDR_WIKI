import { Link, NavLink, useLocation } from "react-router-dom"
import type { GroupRecord } from "../api/groups"

type TopNavProps = {
  worldName: string
  groups: GroupRecord[]
  activeGroupId: number | null
  onActiveGroupChange: (nextGroupId: number | null) => void
}

export function TopNav({ worldName, groups, activeGroupId, onActiveGroupChange }: TopNavProps) {
  const location = useLocation()
  const characterActive = location.pathname.startsWith("/character")
  const equipmentActive = location.pathname.startsWith("/equipment")
  const groupsActive = location.pathname.startsWith("/groups")
  const worldActive = location.pathname.startsWith("/world")

  const activeGroupMissing =
    activeGroupId !== null && !groups.some((group) => group.id === activeGroupId)

  const onGroupChange = (value: string) => {
    if (!value) {
      onActiveGroupChange(null)
      return
    }

    const parsed = Number.parseInt(value, 10)
    onActiveGroupChange(Number.isInteger(parsed) && parsed > 0 ? parsed : null)
  }

  return (
    <header className="top-nav" role="banner">
      <div className="top-nav-inner">
        <Link to="/news" className="nav-brand">
          {worldName}
        </Link>

        <nav className="nav-links" aria-label="Navigation principale">
          <NavLink
            to="/news"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            end
          >
            NEWS
          </NavLink>

          <NavLink
            to="/general"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            GÉNÉRAL
          </NavLink>

          <NavLink
            to="/groups"
            className={({ isActive }) => (isActive || groupsActive ? "nav-link active" : "nav-link")}
          >
            GROUPES
          </NavLink>

          <div className="nav-dropdown">
            <Link to="/character/players" className={characterActive ? "nav-link active" : "nav-link"}>
              CHARACTER <span aria-hidden="true">▾</span>
            </Link>
            <div className="nav-dropdown-menu" aria-label="Character">
              <NavLink
                to="/character/players"
                className={({ isActive }) => (isActive ? "nav-dropdown-item active" : "nav-dropdown-item")}
              >
                Joueurs
              </NavLink>
              <NavLink
                to="/character/npcs"
                className={({ isActive }) => (isActive ? "nav-dropdown-item active" : "nav-dropdown-item")}
              >
                PNJ
              </NavLink>
              <NavLink
                to="/character/monsters"
                className={({ isActive }) => (isActive ? "nav-dropdown-item active" : "nav-dropdown-item")}
              >
                Monstres
              </NavLink>
              <NavLink
                to="/character/bosses"
                className={({ isActive }) => (isActive ? "nav-dropdown-item active" : "nav-dropdown-item")}
              >
                Boss
              </NavLink>
              <NavLink
                to="/character/create"
                className={({ isActive }) => (isActive ? "nav-dropdown-item active" : "nav-dropdown-item")}
              >
                Créer un personnage
              </NavLink>
            </div>
          </div>

          <div className="nav-dropdown">
            <Link to="/equipment/weapons" className={equipmentActive ? "nav-link active" : "nav-link"}>
              EQUIPMENT <span aria-hidden="true">▾</span>
            </Link>
            <div className="nav-dropdown-menu" aria-label="Equipment">
              <NavLink
                to="/equipment/weapons"
                className={({ isActive }) => (isActive ? "nav-dropdown-item active" : "nav-dropdown-item")}
              >
                Armes
              </NavLink>
              <NavLink
                to="/equipment/armors"
                className={({ isActive }) => (isActive ? "nav-dropdown-item active" : "nav-dropdown-item")}
              >
                Armures
              </NavLink>
              <NavLink
                to="/equipment/consumables"
                className={({ isActive }) => (isActive ? "nav-dropdown-item active" : "nav-dropdown-item")}
              >
                Objets & Consommables
              </NavLink>
              <NavLink
                to="/equipment/artifacts"
                className={({ isActive }) => (isActive ? "nav-dropdown-item active" : "nav-dropdown-item")}
              >
                Artefacts & Objets Magiques
              </NavLink>
              <NavLink
                to="/equipment/gold"
                className={({ isActive }) => (isActive ? "nav-dropdown-item active" : "nav-dropdown-item")}
              >
                Or & Monnaie
              </NavLink>
              <NavLink
                to="/equipment/create"
                className={({ isActive }) => (isActive ? "nav-dropdown-item active" : "nav-dropdown-item")}
              >
                Créer un équipement
              </NavLink>
            </div>
          </div>

          <div className="nav-dropdown">
            <Link to="/world/map" className={worldActive ? "nav-link active" : "nav-link"}>
              WORLD <span aria-hidden="true">▾</span>
            </Link>
            <div className="nav-dropdown-menu" aria-label="World">
              <NavLink
                to="/world/map"
                className={({ isActive }) => (isActive ? "nav-dropdown-item active" : "nav-dropdown-item")}
              >
                Carte Interactive
              </NavLink>
              <NavLink
                to="/world/regions"
                className={({ isActive }) => (isActive ? "nav-dropdown-item active" : "nav-dropdown-item")}
              >
                Régions
              </NavLink>
              <NavLink
                to="/world/dungeons"
                className={({ isActive }) => (isActive ? "nav-dropdown-item active" : "nav-dropdown-item")}
              >
                Donjons & Zones
              </NavLink>
              <NavLink
                to="/world/settlements"
                className={({ isActive }) => (isActive ? "nav-dropdown-item active" : "nav-dropdown-item")}
              >
                Villes & Villages
              </NavLink>
              <NavLink
                to="/world/poi"
                className={({ isActive }) => (isActive ? "nav-dropdown-item active" : "nav-dropdown-item")}
              >
                Points d'intérêt
              </NavLink>
              <NavLink
                to="/world/create"
                className={({ isActive }) => (isActive ? "nav-dropdown-item active" : "nav-dropdown-item")}
              >
                Créer un lieu
              </NavLink>
            </div>
          </div>
        </nav>

        <div className="nav-tools">
          <div className="nav-group">
            <label htmlFor="active-group" className="sr-only">
              Groupe actif
            </label>
            <select
              id="active-group"
              value={activeGroupId ? String(activeGroupId) : ""}
              onChange={(e) => onGroupChange(e.target.value)}
            >
              <option value="">Tous les groupes</option>
              {activeGroupMissing && activeGroupId ? (
                <option value={String(activeGroupId)}>{`Groupe #${activeGroupId}`}</option>
              ) : null}
              {groups.map((group) => (
                <option key={group.id} value={String(group.id)}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className="nav-search">
            <label htmlFor="global-search" className="sr-only">
              Recherche
            </label>
            <input id="global-search" type="search" placeholder="Recherche (bientôt)" disabled />
          </div>
        </div>
      </div>
    </header>
  )
}
