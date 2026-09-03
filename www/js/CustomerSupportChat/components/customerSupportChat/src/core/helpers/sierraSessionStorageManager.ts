import { sierraSessionStorageKey } from "../constants/sierra";
import { SierraConversation } from "../types/sierra";
import { isProd } from "./supportEnvironment";

export const clearSierraChatSession = (): void => {
  try {
    window.sierra?.cleanup();
    sessionStorage.removeItem(sierraSessionStorageKey);
  } catch (e) {
    if (!isProd) console.error("Error closing chat modal", e);
  }
};

export const getSierraChatSessionStorage = (): string | null =>
  sessionStorage.getItem(sierraSessionStorageKey);

export const getSierraSessionConversation = (): SierraConversation | null => {
  const item = getSierraChatSessionStorage();
  if (!item) return null;

  try {
    return JSON.parse(item) as SierraConversation;
  } catch (e) {
    if (!isProd) console.error("Error parsing SierraConversation JSON", e);
    return null;
  }
};
