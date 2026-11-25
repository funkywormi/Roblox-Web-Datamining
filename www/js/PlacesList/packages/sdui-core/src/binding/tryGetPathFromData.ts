import { snakeToCamel } from "../utils/caseConversion";

/**
 * Traverse a nested value by `pathSegments`, returning the resolved leaf or
 * `undefined` if any segment is missing or hits a non-object.
 *
 * Each segment is tried as-is then as its camelCase form, since binding paths
 * are authored in `snake_case` but `protobuf-es` decodes fields as camelCase.
 *
 * `startIndex` skips leading segments without re-slicing
 */
export function tryGetPathFromData(
  data: unknown,
  pathSegments: readonly string[],
  startIndex = 0,
): unknown {
  let current: unknown = data;

  for (let i = startIndex; i < pathSegments.length; i += 1) {
    if (current === null || typeof current !== "object") return undefined;

    const segment = pathSegments[i];
    if (segment === undefined) return undefined;

    if (Object.hasOwn(current, segment)) {
      current = Reflect.get(current, segment);
      continue;
    }

    const camelSegment = snakeToCamel(segment);
    if (camelSegment !== segment && Object.hasOwn(current, camelSegment)) {
      current = Reflect.get(current, camelSegment);
      continue;
    }

    return undefined;
  }

  return current;
}
