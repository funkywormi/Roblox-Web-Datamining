/**
 * Basically any JSON value + undefined.
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Iterates over a complete JSON object.
 * For each item in the tree, it calls `replacerFn` which can replace
 * the item.
 * It runs `replacerFn` on leaf/children first.
 */
export const transformJsonLeafFirst = (
  node: JsonValue,
  replacerFn: (node: JsonValue) => JsonValue | undefined,
): JsonValue | undefined => {
  if (Array.isArray(node)) {
    return replacerFn(node.map(item => transformJsonLeafFirst(item, replacerFn)));
  }

  if (typeof node === "object" && node !== null) {
    const resolved: Record<string, JsonValue> = {};
    for (const [key, item] of Object.entries(node)) {
      resolved[key] = transformJsonLeafFirst(item, replacerFn);
    }
    return replacerFn(resolved);
  }

  return replacerFn(node);
};
