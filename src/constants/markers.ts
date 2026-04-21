export const MARKER_SPRITE = {
  url: "/markers.png",
  sheetWidth: 726,
  sheetHeight: 792,
  columns: 11,
  rows: 9,
} as const

export const MARKER_CELL_WIDTH = MARKER_SPRITE.sheetWidth / MARKER_SPRITE.columns
export const MARKER_CELL_HEIGHT = MARKER_SPRITE.sheetHeight / MARKER_SPRITE.rows
export const MARKER_TOTAL = MARKER_SPRITE.columns * MARKER_SPRITE.rows

export function clampMarkerSpriteIndex(index: number): number {
  if (!Number.isFinite(index)) {
    return 0
  }

  return Math.max(0, Math.min(MARKER_TOTAL - 1, Math.round(index)))
}

export function spriteCell(index: number): { row: number; col: number } {
  const safe = clampMarkerSpriteIndex(index)
  return {
    row: Math.floor(safe / MARKER_SPRITE.columns),
    col: safe % MARKER_SPRITE.columns,
  }
}

export function spriteBackgroundPosition(index: number, cellWidth: number, cellHeight: number): string {
  const { row, col } = spriteCell(index)
  return `${-col * cellWidth}px ${-row * cellHeight}px`
}

export function spriteBackgroundSize(cellWidth: number, cellHeight: number): string {
  return `${cellWidth * MARKER_SPRITE.columns}px ${cellHeight * MARKER_SPRITE.rows}px`
}
