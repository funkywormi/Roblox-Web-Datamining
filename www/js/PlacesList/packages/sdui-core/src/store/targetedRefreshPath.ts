import { isRecord } from "../utils/typeGuards";

export class TargetedRefreshError extends Error {}

type RawPathSegment = string | number;

export interface ResolvedTarget {
  rawPath: RawPathSegment[];
  value: unknown;
}

function collectIdentifierMatches(
  value: unknown,
  identifier: string,
  rawPath: RawPathSegment[],
  matches: ResolvedTarget[],
  ancestors: WeakSet<object>,
  includeCurrent: boolean,
): void {
  if (!isRecord(value) && !Array.isArray(value)) return;
  if (ancestors.has(value)) return;
  ancestors.add(value);

  try {
    if (includeCurrent && isRecord(value) && value.identifier === identifier) {
      matches.push({ rawPath, value });
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        collectIdentifierMatches(item, identifier, [...rawPath, index], matches, ancestors, true);
      });
      return;
    }

    for (const [key, child] of Object.entries(value)) {
      const childPath = [...rawPath, key];
      const isComponentRecord = isRecord(child);
      const childIdentifier = isComponentRecord ? child.identifier : undefined;
      const isKeyedComponent =
        key === identifier &&
        isComponentRecord &&
        (childIdentifier === identifier ||
          ((childIdentifier === undefined || childIdentifier === "") &&
            typeof child.robloxComponent === "string"));
      if (isKeyedComponent) {
        if (!ancestors.has(child)) {
          matches.push({ rawPath: childPath, value: child });
        }
        continue;
      }
      collectIdentifierMatches(child, identifier, childPath, matches, ancestors, true);
    }
  } finally {
    ancestors.delete(value);
  }
}

export function findNestedIdentifierPath(
  inputData: Record<string, unknown>,
  identifierPath: readonly string[],
): ResolvedTarget | undefined {
  let resolved: ResolvedTarget = { rawPath: [], value: inputData };
  let includeResolvedRoot = true;

  for (const identifier of identifierPath.slice(1)) {
    const scopedMatches: ResolvedTarget[] = [];
    collectIdentifierMatches(
      resolved.value,
      identifier,
      [],
      scopedMatches,
      new WeakSet(),
      includeResolvedRoot,
    );
    if (scopedMatches.length === 0) return undefined;
    if (scopedMatches.length > 1) {
      throw new TargetedRefreshError(
        `Targeted refresh path segment "${identifier}" is ambiguous under "${identifierPath.join(
          " > ",
        )}"`,
      );
    }
    const match = scopedMatches[0];
    if (!match) {
      throw new TargetedRefreshError(`Targeted refresh path segment "${identifier}" was not found`);
    }
    resolved = {
      rawPath: [...resolved.rawPath, ...match.rawPath],
      value: match.value,
    };
    includeResolvedRoot = false;
  }

  return resolved;
}

export function resolveNestedIdentifierPath(
  inputData: Record<string, unknown>,
  identifierPath: readonly string[],
): ResolvedTarget {
  const resolved = findNestedIdentifierPath(inputData, identifierPath);
  if (!resolved) {
    throw new TargetedRefreshError(
      `Targeted refresh path "${identifierPath.join(" > ")}" was not found`,
    );
  }
  return resolved;
}

export function setValueAtRawPath(
  inputData: Record<string, unknown>,
  rawPath: readonly RawPathSegment[],
  value: unknown,
): Record<string, unknown> {
  if (rawPath.length === 0) {
    if (!isRecord(value)) {
      throw new TargetedRefreshError("A page-entry input-data replacement must be an object");
    }
    return value;
  }

  const update = (current: unknown, index: number): unknown => {
    if (index === rawPath.length) return value;
    const segment = rawPath[index];
    if (segment === undefined) return value;
    if (typeof segment === "number") {
      if (!Array.isArray(current)) {
        throw new TargetedRefreshError("Targeted refresh path no longer resolves through an array");
      }
      const next = current.map((item: unknown) => item);
      next[segment] = update(current[segment], index + 1);
      return next;
    }
    if (!isRecord(current)) {
      throw new TargetedRefreshError("Targeted refresh path no longer resolves through an object");
    }
    return {
      ...current,
      [segment]: update(current[segment], index + 1),
    };
  };

  const updated = update(inputData, 0);
  if (!isRecord(updated)) {
    throw new TargetedRefreshError("Targeted refresh produced invalid page-entry input data");
  }
  return updated;
}
