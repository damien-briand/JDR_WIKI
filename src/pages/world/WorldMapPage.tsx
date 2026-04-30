import { MapTool } from "../../features/map/MapTool"

type WorldMapPageProps = {
  activeGroupId: number | null
}

export function WorldMapPage({ activeGroupId }: WorldMapPageProps) {
  return <MapTool activeGroupId={activeGroupId} />
}
