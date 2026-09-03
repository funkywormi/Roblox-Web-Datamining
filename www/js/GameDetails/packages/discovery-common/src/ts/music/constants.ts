/**
 * This object contains temporary overrides for the top songs in game carousel to look the same as the recommended games carousel.
 * Once the game carousel starts using SDUI, we can remove this object and use the default values instead.
 */

export const TOP_SONGS_IN_GAME_OVERRIDES = {
  columnGap: 11, // This is consistent with the recommended games carousel spacing. (ref - https://github.rbx.com/Roblox/web-frontend/blob/afeb4e751d59e2e6964df23c4b0b5d7ec09efd36/workspace/packages/discovery-common/src/css/common/_gameCarousel.scss#L189)
  enableScrolling: false,
  topSongsInGameLimit: 6, // The game carousel can only display at most 6 items. We want the songs carousel to be consistent with that.
};
