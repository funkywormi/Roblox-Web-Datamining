export const GameDetailsTabs = {
  About: "tab-about",
  Store: "tab-store",
  GameInstances: "tab-game-instances",
} as const;

export type GameDetailsTab = (typeof GameDetailsTabs)[keyof typeof GameDetailsTabs];

export const gameDetailTabs = Object.values(GameDetailsTabs);

export const gameDetailHashesToTabs: Record<string, GameDetailsTab> = {
  "#!/about": GameDetailsTabs.About,
  "#!/store": GameDetailsTabs.Store,
  "#!/game-instances": GameDetailsTabs.GameInstances,
};
