/** Fraction of a tile that must be on screen before it can autoplay. Matches Lua `FIntLuaAppGameTileVideoVisiblePercent` (80). */
export const VIEWPORT_AUTOPLAY_VISIBLE_RATIO = 0.8;

/** How long a tile must stay the winner before its video starts. Matches Lua `videoDwellTimeInSec` (1). */
export const VIEWPORT_AUTOPLAY_DWELL_MS = 1000;

/** Quiet time after the last scroll event before winner elections resume. */
export const VIEWPORT_AUTOPLAY_SCROLL_SETTLE_MS = 150;
