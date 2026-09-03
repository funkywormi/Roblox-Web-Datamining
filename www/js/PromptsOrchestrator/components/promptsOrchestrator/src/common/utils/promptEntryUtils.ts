import { type CacheEntry } from "@rbx/sdui-core";
import { PromptEntry } from "../types/promptTypes";

export const mapPageEntriesToPromptEntries = (cacheEntry?: CacheEntry): PromptEntry[] => {
  const pageEntries = cacheEntry?.response?.pageEntries;
  if (!pageEntries) {
    return [];
  }

  const { configs } = cacheEntry;
  return pageEntries.map<PromptEntry>(({ pageEntry }) => {
    const entry = pageEntry;
    return {
      identifier: entry.identifier,
      robloxComponentType: entry.robloxComponent,
      title: entry.title,
      promptStyle: entry.category,
      config: configs.get(entry.identifier),
    };
  });
};
