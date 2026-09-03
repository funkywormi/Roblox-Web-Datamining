import type {
  SduiApiResponse,
  SduiInputDataMergeStrategyResolver,
  UniversalPageEntry,
} from "../types";
import { mergeInputData } from "../utils/apiStoreHelper";

export function mergeSduiResponse(
  cachedResponse: SduiApiResponse | undefined,
  response: SduiApiResponse,
  pageEntries: UniversalPageEntry[],
): SduiApiResponse {
  const hydrationData = { ...(cachedResponse?.hydrationData ?? {}) };
  for (const [contentType, entities] of Object.entries(response.hydrationData)) {
    hydrationData[contentType] = {
      ...(hydrationData[contentType] ?? {}),
      ...entities,
    };
  }

  return {
    ...(cachedResponse ?? response),
    ...response,
    pageEntries,
    templates: {
      ...(cachedResponse?.templates ?? {}),
      ...response.templates,
    },
    hydrationData,
    localizedLiterals: {
      ...(cachedResponse?.localizedLiterals ?? {}),
      ...(response.localizedLiterals ?? {}),
    },
  };
}

export function mergePaginatedSduiResponse(
  cachedResponse: SduiApiResponse | undefined,
  response: SduiApiResponse,
  strategyResolver?: SduiInputDataMergeStrategyResolver,
): SduiApiResponse {
  if (!cachedResponse) return response;

  // Preserve cached ordering by replacing matching entries in place and appending new entries.
  const pageEntries = [...cachedResponse.pageEntries];
  const pageEntriesByIdentifier = new Map(
    pageEntries.map((pageEntry, index) => [pageEntry.pageEntry.identifier, { pageEntry, index }]),
  );
  for (const pageEntry of response.pageEntries) {
    const existingEntry = pageEntriesByIdentifier.get(pageEntry.pageEntry.identifier);
    if (existingEntry === undefined) {
      pageEntriesByIdentifier.set(pageEntry.pageEntry.identifier, {
        pageEntry,
        index: pageEntries.length,
      });
      pageEntries.push(pageEntry);
    } else {
      const mergedPageEntry = {
        ...pageEntry,
        pageEntry: {
          ...existingEntry.pageEntry.pageEntry,
          ...pageEntry.pageEntry,
          title: pageEntry.pageEntry.title ?? existingEntry.pageEntry.pageEntry.title,
          category: pageEntry.pageEntry.category ?? existingEntry.pageEntry.pageEntry.category,
        },
        inputData: mergeInputData(
          existingEntry.pageEntry.inputData,
          pageEntry.inputData,
          strategyResolver,
        ),
      };
      pageEntries[existingEntry.index] = mergedPageEntry;
      pageEntriesByIdentifier.set(pageEntry.pageEntry.identifier, {
        pageEntry: mergedPageEntry,
        index: existingEntry.index,
      });
    }
  }

  return mergeSduiResponse(cachedResponse, response, pageEntries);
}
