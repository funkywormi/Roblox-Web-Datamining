import type { ClientAttributes } from "../types/promptTypes";

/**
 * Serializes client attributes to a string that can be used in a URL. Sorts the
 * keys to ensure consistent ordering when the result is used as a dependency
 * for memoization. If the object is empty, returns undefined.
 *
 * @example { groupId: "917107494" } -> "{'groupId':'917107494'}"
 */
export const serializeClientAttributes = (clientAttributes?: ClientAttributes) => {
  if (!clientAttributes) {
    return undefined;
  }

  const entries = Object.entries(clientAttributes);

  if (entries.length === 0) {
    return undefined;
  }

  const sortedClientAttributes: ClientAttributes = Object.fromEntries(
    entries.sort(([keyA], [keyB]) => keyA.localeCompare(keyB)),
  );

  return JSON.stringify(sortedClientAttributes);
};
