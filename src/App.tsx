import { useCallback, useEffect, useState } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { listGroups, type GroupRecord } from "./api/groups"
import { TopNav } from "./layout/TopNav"
import { GroupsPage } from "./pages/GroupsPage"
import { GeneralPage } from "./pages/GeneralPage"
import { NewsPage } from "./pages/NewsPage"
import { PlaceholderPage } from "./pages/PlaceholderPage"
import { MonstersPage } from "./pages/character/MonstersPage"
import { NpcsPage } from "./pages/character/NpcsPage"
import { WorldMapPage } from "./pages/world/WorldMapPage"
import { WorldLocationsPage } from "./pages/world/WorldLocationsPage"
import { loadActiveGroupId, saveActiveGroupId } from "./utils/activeGroup"
import "./App.css"

function App() {
  const [worldName, setWorldName] = useState("JDR Wiki")
  const [groups, setGroups] = useState<GroupRecord[]>([])
  const [groupsLoaded, setGroupsLoaded] = useState(false)
  const [activeGroupId, setActiveGroupId] = useState<number | null>(() => loadActiveGroupId())

  const applyGroups = useCallback((nextGroups: GroupRecord[]) => {
    setGroups(nextGroups)
    setGroupsLoaded(true)
    setActiveGroupId((previous) =>
      previous && nextGroups.some((group) => group.id === previous) ? previous : null,
    )
  }, [])

  useEffect(() => {
    let cancelled = false

    fetch("/api/config")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        return (await res.json()) as Record<string, string>
      })
      .then((config) => {
        const nextWorldName =
          typeof config.world_name === "string" && config.world_name.trim() ? config.world_name.trim() : null

        if (!cancelled && nextWorldName) {
          setWorldName(nextWorldName)
        }
      })
      .catch(() => {
        // Le backend peut ne pas tourner (dev); on garde le fallback.
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    listGroups()
      .then((data) => {
        if (!cancelled) {
          applyGroups(data)
        }
      })
      .catch(() => {
        // Le backend peut ne pas tourner (dev); le select reste utilisable en mode "Tous".
      })

    return () => {
      cancelled = true
    }
  }, [applyGroups])

  useEffect(() => {
    saveActiveGroupId(activeGroupId)
  }, [activeGroupId])

  return (
    <div className="app-frame">
      <TopNav
        worldName={worldName}
        groups={groups}
        activeGroupId={activeGroupId}
        onActiveGroupChange={setActiveGroupId}
      />

      <main className="route-area" role="main">
        <Routes>
          <Route path="/" element={<Navigate to="/news" replace />} />

          <Route path="/news" element={<NewsPage />} />
          <Route path="/general" element={<GeneralPage />} />
          <Route
            path="/groups"
            element={
              <GroupsPage
                groups={groups}
                groupsLoaded={groupsLoaded}
                onGroupsChange={applyGroups}
                activeGroupId={activeGroupId}
                onActiveGroupChange={setActiveGroupId}
              />
            }
          />

          <Route path="/character/players" element={<PlaceholderPage title="Joueurs" />} />
          <Route path="/character/npcs" element={<NpcsPage activeGroupId={activeGroupId} />} />
          <Route path="/character/monsters" element={<MonstersPage activeGroupId={activeGroupId} />} />
          <Route path="/character/bosses" element={<PlaceholderPage title="Boss" />} />
          <Route path="/character/create" element={<PlaceholderPage title="Créer un personnage" />} />

          <Route path="/equipment/weapons" element={<PlaceholderPage title="Armes" />} />
          <Route path="/equipment/armors" element={<PlaceholderPage title="Armures" />} />
          <Route path="/equipment/consumables" element={<PlaceholderPage title="Objets & Consommables" />} />
          <Route path="/equipment/artifacts" element={<PlaceholderPage title="Artefacts & Objets Magiques" />} />
          <Route path="/equipment/gold" element={<PlaceholderPage title="Or & Monnaie" />} />
          <Route path="/equipment/create" element={<PlaceholderPage title="Créer un équipement" />} />

          <Route path="/world/map" element={<WorldMapPage activeGroupId={activeGroupId} />} />
          <Route
            path="/world/regions"
            element={
              <WorldLocationsPage
                sectionTitle="Régions"
                allowedTypes={["region"]}
                defaultType="region"
                activeGroupId={activeGroupId}
              />
            }
          />
          <Route
            path="/world/dungeons"
            element={
              <WorldLocationsPage
                sectionTitle="Donjons & Zones"
                allowedTypes={["dungeon", "castle", "temple"]}
                defaultType="dungeon"
                activeGroupId={activeGroupId}
              />
            }
          />
          <Route
            path="/world/settlements"
            element={
              <WorldLocationsPage
                sectionTitle="Villes & Villages"
                allowedTypes={["city", "village"]}
                defaultType="city"
                activeGroupId={activeGroupId}
              />
            }
          />
          <Route
            path="/world/poi"
            element={
              <WorldLocationsPage
                sectionTitle="Points d'intérêt"
                allowedTypes={["poi", "route"]}
                defaultType="poi"
                activeGroupId={activeGroupId}
              />
            }
          />
          <Route path="/world/create" element={<WorldLocationsPage activeGroupId={activeGroupId} />} />

          <Route
            path="*"
            element={<PlaceholderPage title="Page introuvable" description="Cette page n'existe pas." />}
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
