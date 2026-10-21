import type { GameLauncher } from "./launcher";

// Set by the page host (NavLayout on Next.js); Play buttons read it when clicked.
let current: GameLauncher | null = null;

export const setGameLauncher = (launcher: GameLauncher | null): void => {
  current = launcher;
};

export const getGameLauncher = (): GameLauncher | null => current;
