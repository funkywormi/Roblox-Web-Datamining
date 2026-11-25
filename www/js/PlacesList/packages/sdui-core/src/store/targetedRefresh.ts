import type {
  SduiApiResponse,
  SduiTargetedRefreshInput,
  SduiTargetedRefreshParamValue,
  SduiTargetedRefreshResult,
} from "../types";
import { mergeSduiResponse } from "./mergeSduiResponse";
import {
  findNestedIdentifierPath,
  resolveNestedIdentifierPath,
  setValueAtRawPath,
  TargetedRefreshError,
  type ResolvedTarget,
} from "./targetedRefreshPath";

export { TargetedRefreshError };

export interface TargetedRefreshPageEntryContract {
  identifier: string;
  robloxComponent: string;
  inputDataType: string;
}

export interface TargetedRefreshPageEntryState {
  pageEntry: TargetedRefreshPageEntryContract;
  inputData: Record<string, unknown>;
}

export interface TargetedRefreshPatchResult {
  patchedInputData: ReadonlyMap<string, Record<string, unknown>>;
  missingTargets: readonly SduiTargetedRefreshInput[];
  unexpectedPageEntryIdentifiers: readonly string[];
}

export interface ResolvedTargetedRefreshTarget {
  target: SduiTargetedRefreshInput;
  value: unknown;
}

export interface InvalidTargetedRefreshTarget {
  status: "invalid";
  target: SduiTargetedRefreshInput;
  reason: string;
}

export interface TargetedRefreshResolutionResult {
  pageEntries: ReadonlyMap<string, TargetedRefreshPageEntryState>;
  validTargets: readonly ResolvedTargetedRefreshTarget[];
  invalidTargets: readonly InvalidTargetedRefreshTarget[];
}

function indexResponsePageEntries(
  response: SduiApiResponse,
): ReadonlyMap<string, (typeof response.pageEntries)[number]> {
  const entries = new Map<string, (typeof response.pageEntries)[number]>();
  for (const pageEntry of response.pageEntries) {
    const { identifier } = pageEntry.pageEntry;
    if (entries.has(identifier)) {
      throw new TargetedRefreshError(
        `Targeted refresh response contains duplicate page entry "${identifier}"`,
      );
    }
    entries.set(identifier, pageEntry);
  }
  return entries;
}

function assertIdentifierPath(identifierPath: readonly string[]): void {
  if (
    !Array.isArray(identifierPath) ||
    identifierPath.length === 0 ||
    identifierPath.some(identifier => typeof identifier !== "string" || identifier === "")
  ) {
    throw new TargetedRefreshError(
      "Targeted refresh requires a non-empty identifierPath of non-empty strings",
    );
  }
}

function isRequestParamArray(
  value: SduiTargetedRefreshParamValue,
): value is readonly SduiTargetedRefreshParamValue[] {
  return Array.isArray(value);
}

function canonicalizeRequestParams(
  value: Readonly<Record<string, SduiTargetedRefreshParamValue>>,
): Readonly<Record<string, SduiTargetedRefreshParamValue>> {
  const canonicalizeValue = (
    child: SduiTargetedRefreshParamValue,
  ): SduiTargetedRefreshParamValue => {
    if (child === null || typeof child !== "object") return child;
    if (isRequestParamArray(child)) return child.map(canonicalizeValue);
    return canonicalizeRequestParams(child);
  };
  const sortedEntries = Object.entries(value).sort(([left], [right]) => {
    if (left < right) return -1;
    if (left > right) return 1;
    return 0;
  });
  return Object.fromEntries(sortedEntries.map(([key, child]) => [key, canonicalizeValue(child)]));
}

export function prepareTargetedRefreshInputs(inputs: readonly SduiTargetedRefreshInput[]): {
  inputs: readonly SduiTargetedRefreshInput[];
  requestIdentity: string;
} {
  if (inputs.length === 0) {
    throw new TargetedRefreshError("Targeted refresh requires at least one target");
  }

  const preparedInputs = inputs.map(input => {
    assertIdentifierPath(input.identifierPath);
    const requestParams =
      input.requestParams === undefined
        ? undefined
        : canonicalizeRequestParams(input.requestParams);
    return {
      identifierPath: [...input.identifierPath],
      ...(requestParams !== undefined ? { requestParams } : {}),
    };
  });
  return {
    inputs: preparedInputs,
    requestIdentity: JSON.stringify([
      "targetedBatch",
      preparedInputs
        .map(input => JSON.stringify([input.identifierPath, input.requestParams ?? null]))
        .sort(),
    ]),
  };
}

export function assertTargetedRefreshTarget(
  pageEntry: TargetedRefreshPageEntryContract | undefined,
  inputData: Record<string, unknown> | undefined,
  target: SduiTargetedRefreshInput,
): ResolvedTarget {
  assertIdentifierPath(target.identifierPath);
  const pageEntryIdentifier = target.identifierPath.at(0);
  if (!pageEntryIdentifier) {
    throw new TargetedRefreshError("Targeted refresh requires a page-entry identifier");
  }
  if (pageEntry?.identifier !== pageEntryIdentifier || !inputData) {
    throw new TargetedRefreshError(
      `Targeted refresh page entry is not cached: ${pageEntryIdentifier}`,
    );
  }
  return resolveNestedIdentifierPath(inputData, target.identifierPath);
}

export function resolveTargetedRefreshTargets(
  response: SduiApiResponse,
  targets: readonly SduiTargetedRefreshInput[],
  getInputData: (identifier: string) => Record<string, unknown> | undefined,
  expectedTargets: readonly ResolvedTargetedRefreshTarget[] = [],
): TargetedRefreshResolutionResult {
  const pageEntries = new Map<string, TargetedRefreshPageEntryState>();
  for (const [identifier, entry] of indexResponsePageEntries(response)) {
    const inputData = getInputData(identifier);
    if (inputData === undefined) continue;
    pageEntries.set(identifier, {
      pageEntry: {
        identifier,
        robloxComponent: entry.pageEntry.robloxComponent,
        inputDataType: entry.inputDataType,
      },
      inputData,
    });
  }

  const expectedValues = new Map(expectedTargets.map(({ target, value }) => [target, value]));
  const validTargets: ResolvedTargetedRefreshTarget[] = [];
  const invalidTargets: InvalidTargetedRefreshTarget[] = [];
  for (const target of targets) {
    const currentPageEntry = pageEntries.get(target.identifierPath.at(0) ?? "");
    try {
      const resolved = assertTargetedRefreshTarget(
        currentPageEntry?.pageEntry,
        currentPageEntry?.inputData,
        target,
      );
      if (expectedValues.has(target) && !Object.is(resolved.value, expectedValues.get(target))) {
        throw new TargetedRefreshError(
          `Targeted refresh path "${target.identifierPath.join(
            " > ",
          )}" changed while the request was in flight`,
        );
      }
      validTargets.push({ target, value: resolved.value });
    } catch (error) {
      if (!(error instanceof TargetedRefreshError)) throw error;
      invalidTargets.push({ status: "invalid", target, reason: error.message });
    }
  }

  return { pageEntries, validTargets, invalidTargets };
}

export function buildCompletedTargetedRefreshResult(
  targets: readonly SduiTargetedRefreshInput[],
  invalidTargets: readonly InvalidTargetedRefreshTarget[],
  missingTargets: readonly SduiTargetedRefreshInput[] = [],
  unexpectedPageEntryIdentifiers: readonly string[] = [],
): Extract<SduiTargetedRefreshResult, { status: "completed" }> {
  const invalid = new Map(invalidTargets.map(result => [result.target, result]));
  const missing = new Set(missingTargets);
  return {
    status: "completed",
    targetResults: targets.map(
      target =>
        invalid.get(target) ??
        (missing.has(target) ? { status: "missing", target } : { status: "updated", target }),
    ),
    unexpectedPageEntryIdentifiers,
  };
}

export function mergeTargetedResponse(
  cachedResponse: SduiApiResponse | undefined,
  response: SduiApiResponse,
  patchedInputData: ReadonlyMap<string, Record<string, unknown>>,
): SduiApiResponse {
  const incomingPageEntries = indexResponsePageEntries(response);
  const existingPageEntries = cachedResponse?.pageEntries ?? [];
  const pageEntries = [...existingPageEntries];
  for (const [identifier, inputData] of patchedInputData) {
    const incomingPageEntry = incomingPageEntries.get(identifier);
    if (!incomingPageEntry) {
      throw new TargetedRefreshError(
        `Targeted refresh response does not contain page entry "${identifier}"`,
      );
    }
    const targetIndex = existingPageEntries.findIndex(
      pageEntry => pageEntry.pageEntry.identifier === identifier,
    );
    const existingPageEntry = targetIndex >= 0 ? existingPageEntries[targetIndex] : undefined;
    if (!existingPageEntry) {
      throw new TargetedRefreshError(`Targeted refresh page entry is not cached: ${identifier}`);
    }
    pageEntries[targetIndex] = {
      ...existingPageEntry,
      ...incomingPageEntry,
      pageEntry: {
        ...existingPageEntry.pageEntry,
        ...incomingPageEntry.pageEntry,
        title: incomingPageEntry.pageEntry.title ?? existingPageEntry.pageEntry.title,
        category: incomingPageEntry.pageEntry.category ?? existingPageEntry.pageEntry.category,
      },
      inputData,
    };
  }

  return mergeSduiResponse(cachedResponse, response, pageEntries);
}

export function buildTargetedRefreshPatches(
  response: SduiApiResponse,
  currentPageEntries: ReadonlyMap<string, TargetedRefreshPageEntryState>,
  targets: readonly SduiTargetedRefreshInput[],
): TargetedRefreshPatchResult {
  if (targets.length === 0) {
    throw new TargetedRefreshError("Targeted refresh requires at least one target");
  }

  const requestedTargets = targets.map(target => {
    assertIdentifierPath(target.identifierPath);
    // first segment is the page-entry identifier
    const pageEntryIdentifier = target.identifierPath.at(0);
    if (!pageEntryIdentifier) {
      throw new TargetedRefreshError("Targeted refresh requires a page-entry identifier");
    }
    return { target, pageEntryIdentifier };
  });
  const requestedPageEntryIdentifiers = new Set(
    requestedTargets.map(({ pageEntryIdentifier }) => pageEntryIdentifier),
  );
  const incomingPageEntries = indexResponsePageEntries(response);

  const patchedInputData = new Map<string, Record<string, unknown>>();
  const missingTargets: SduiTargetedRefreshInput[] = [];
  for (const { target, pageEntryIdentifier } of requestedTargets) {
    const currentPageEntry = currentPageEntries.get(pageEntryIdentifier);
    if (!currentPageEntry) {
      throw new TargetedRefreshError(
        `Targeted refresh page entry is not cached: ${pageEntryIdentifier}`,
      );
    }
    const incomingPageEntry = incomingPageEntries.get(pageEntryIdentifier);
    if (!incomingPageEntry) {
      missingTargets.push(target);
      continue;
    }
    if (incomingPageEntry.inputDataType !== currentPageEntry.pageEntry.inputDataType) {
      throw new TargetedRefreshError(
        `Targeted refresh response changed inputDataType for "${pageEntryIdentifier}"`,
      );
    }

    const targetInCache = resolveNestedIdentifierPath(
      currentPageEntry.inputData,
      target.identifierPath,
    );
    const targetInResponse = findNestedIdentifierPath(
      incomingPageEntry.inputData,
      target.identifierPath,
    );
    if (!targetInResponse) {
      missingTargets.push(target);
      continue;
    }
    const previouslyPatchedInputData = patchedInputData.get(pageEntryIdentifier);
    const inputDataToPatch = previouslyPatchedInputData ?? currentPageEntry.inputData;
    const targetToReplace = previouslyPatchedInputData
      ? resolveNestedIdentifierPath(previouslyPatchedInputData, target.identifierPath)
      : targetInCache;
    // TODO: Add explicit per-target merge semantics for incremental targeted pagination.
    // Until then, the backend must return the complete target because this is an exact replacement.
    patchedInputData.set(
      pageEntryIdentifier,
      setValueAtRawPath(inputDataToPatch, targetToReplace.rawPath, targetInResponse.value),
    );
  }

  return {
    patchedInputData,
    missingTargets,
    unexpectedPageEntryIdentifiers: response.pageEntries
      .map(pageEntry => pageEntry.pageEntry.identifier)
      .filter(identifier => !requestedPageEntryIdentifiers.has(identifier)),
  };
}
