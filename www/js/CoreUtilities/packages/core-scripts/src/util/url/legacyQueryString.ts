import type { ParsedQuery } from "query-string";
import { UrlSearchParams } from "@rbx/core-lib/url";

export type { ParsedQuery };

const normalizeSearchString = (searchString: string): string =>
  searchString.startsWith("?") ? searchString.slice(1) : searchString;

/** Matches legacy `query-string` null-prototype accumulator. */
const createParsedQuery = (): ParsedQuery => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Object.create(null) is intentionally untyped
  return Object.create(null) as ParsedQuery;
};

const toQueryValue = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return value.toString();
  }
  return undefined;
};

const toSearchParamEntries = (queryParams: Record<string, unknown>): [string, string][] => {
  const entries: [string, string][] = [];

  for (const [key, value] of Object.entries(queryParams)) {
    if (value == null) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        const queryValue = toQueryValue(item);
        if (queryValue !== undefined) {
          entries.push([key, queryValue]);
        }
      }
      continue;
    }
    const queryValue = toQueryValue(value);
    if (queryValue !== undefined) {
      entries.push([key, queryValue]);
    }
  }

  return entries;
};

/** Matches legacy `query-string` default (`sort: true`): keys are serialized alphabetically. */
export const composeQueryString = (queryParams: Record<string, unknown> = {}): string =>
  UrlSearchParams.new(toSearchParamEntries(queryParams), false).toSorted().toString();

export const parseQueryString = (searchString: string): ParsedQuery => {
  const params = UrlSearchParams.parse(normalizeSearchString(searchString));
  const result = createParsedQuery();

  for (const [key, value] of params.entries()) {
    const existing = result[key];
    if (existing == null) {
      result[key] = value;
      continue;
    }
    if (Array.isArray(existing)) {
      existing.push(value);
      continue;
    }
    result[key] = [existing, value];
  }

  return result;
};

export const getQueryParam = (
  paramName: string,
  searchString: string,
): ParsedQuery[string] | undefined => parseQueryString(searchString)[paramName];

export const getRelativeUrlWithQueries = (
  path: string,
  queryParams: Record<string, unknown>,
): string => {
  const query = composeQueryString(queryParams);
  return query === "" ? path : `${path}?${query}`;
};
