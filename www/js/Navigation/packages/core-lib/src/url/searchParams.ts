/* eslint-disable no-restricted-globals */
import { downcast } from "../types";
import { Unique } from "./types";

const newURLSearchParams = (
  url: ConstructorParameters<typeof URLSearchParams>[0],
): Unique<URLSearchParams> => downcast(new URLSearchParams(url));

/** A search parameter value. Numbers and booleans are converted with {@link String}. */
export type SearchParamValue = string | number | boolean;

/**
 * How a search parameter key is matched by {@link UrlSearchParams} lookups. `caseSensitive` is the
 * `URLSearchParams` behavior. `caseInsensitive` also matches keys that differ only in case (for
 * example `get("keyword")` finds `?Keyword=x`), preferring an exact match.
 */
export type CaseSensitivity = "caseSensitive" | "caseInsensitive";

/** The various types that can be constructed into a {@link UrlSearchParams}. */
export type IntoSearchParams =
  | Readonly<Record<string, SearchParamValue>>
  | readonly (readonly [string, SearchParamValue])[]
  | UrlSearchParams;

const isArray = (
  params: IntoSearchParams,
): params is readonly (readonly [string, SearchParamValue])[] => Array.isArray(params);

const toSearchParamString = (value: SearchParamValue): string => String(value);

const normalizeIntoSearchParams = (
  params: Exclude<IntoSearchParams, UrlSearchParams>,
): [string, string][] => {
  const entries = isArray(params) ? params : Object.entries(params);
  return entries.map(([key, value]) => [key, toSearchParamString(value)]);
};

/** Possibly malicious search parameter keys and values that will be removed during sanitization. */
export const possiblyMaliciousParameters: readonly string[] = [
  "__proto__",
  "prototype",
  "constructor",
];

const sanitizeSearchParams = (searchParams: URLSearchParams) =>
  newURLSearchParams(
    [...searchParams.entries()].filter(
      ([key, value]) =>
        !possiblyMaliciousParameters.includes(key) && !possiblyMaliciousParameters.includes(value),
    ),
  );

/**
 * Immutable and sanitized URL search parameters. Exposes a subset of the {@link URLSearchParams} API.
 *
 * Create a `UrlSearchParams` using {@link new}, {@link parse}, or {@link fromURLSearchParams}.
 * By default, the latter two sanitize potentially malicious search parameter keys and values
 * according to {@link possiblyMaliciousParameters}.
 *
 * ```
 * const searchParams = UrlSearchParams.new({
 *   foo: "bar",
 *   baz: 42,
 *   qux: true,
 * });
 *
 * const url = someUrl.withSearchParams(searchParams);
 * ```
 */
export class UrlSearchParams {
  private constructor(private readonly searchParams: URLSearchParams) {}

  private static fromUnique(searchParams: Unique<URLSearchParams>): UrlSearchParams {
    return new UrlSearchParams(searchParams);
  }

  /** @deprecated This is an internal method. Please use {@link new} instead. */
  static internalFromUniqueURLSearchParams(searchParams: Unique<URLSearchParams>): UrlSearchParams {
    return UrlSearchParams.fromUnique(searchParams);
  }

  /** An empty {@link UrlSearchParams} with no entries. */
  static empty: UrlSearchParams = UrlSearchParams.fromUnique(newURLSearchParams(""));

  /**
   * Create a new {@link UrlSearchParams} from key-value pairs in the form of an array or record.
   *
   * Numbers and booleans are converted with {@link String}. URL encoding is automatically performed
   * where necessary.
   *
   * To perform sanitization, set {@link sanitize} to `true`. See {@link possiblyMaliciousParameters}.
   */
  static new(params: IntoSearchParams, sanitize = false): UrlSearchParams {
    if (params instanceof UrlSearchParams) {
      return params;
    }
    const searchParams = newURLSearchParams(normalizeIntoSearchParams(params));
    return UrlSearchParams.fromUnique(sanitize ? sanitizeSearchParams(searchParams) : searchParams);
  }

  /**
   * Create a new {@link UrlSearchParams} from a {@link URLSearchParams}.
   *
   * Possibly malicious search parameters are removed unless {@link sanitize} is set to `false`.
   * See {@link possiblyMaliciousParameters}.
   */
  static fromURLSearchParams(searchParams: URLSearchParams, sanitize = true): UrlSearchParams {
    return UrlSearchParams.fromUnique(
      sanitize ? sanitizeSearchParams(searchParams) : newURLSearchParams(searchParams),
    );
  }

  /**
   * Parse an arbitrary query string into a {@link UrlSearchParams}.
   *
   * The leading `?`, if any, is removed.
   *
   * Where possible, use {@link new} instead of manually constructing query strings.
   *
   * Possibly malicious search parameters are removed unless {@link sanitize} is set to `false`.
   * See {@link possiblyMaliciousParameters}.
   */
  static parse(query: string, sanitize = true): UrlSearchParams {
    // Apparently parsing cannot fail in `new URLSearchParams`.
    const searchParams = newURLSearchParams(query);
    return UrlSearchParams.fromUnique(sanitize ? sanitizeSearchParams(searchParams) : searchParams);
  }

  /**
   * Resolves {@link name} to the key actually stored. When {@link caseSensitivity} is
   * `caseInsensitive` (the default): an exact match if present, otherwise the first key (in order) that matches
   * case-insensitively. Otherwise, and when nothing matches, {@link name} unchanged.
   */
  private resolveName(name: string, caseSensitivity: CaseSensitivity): string {
    if (caseSensitivity === "caseSensitive" || this.searchParams.has(name)) {
      return name;
    }
    const lowerName = name.toLowerCase();
    for (const key of this.searchParams.keys()) {
      if (key.toLowerCase() === lowerName) {
        return key;
      }
    }
    return name;
  }

  /** The total number of search parameter entries. */
  get size(): number {
    return this.searchParams.size;
  }

  /**
   * Returns the first search parameter value associated with {@link name}.
   *
   * By default (`caseInsensitive`) the key is matched ignoring case, preferring an exact match:
   * `get("keyword")` finds `?Keyword=x` unless `keyword` is also present. Pass `caseSensitive` for
   * the `URLSearchParams` behavior. Stored keys keep their original casing.
   */
  get(name: string, caseSensitivity: CaseSensitivity = "caseInsensitive"): string | null {
    return this.searchParams.get(this.resolveName(name, caseSensitivity));
  }

  /**
   * Returns all the search parameter values associated with {@link name}. By default
   * (`caseInsensitive`) this includes the values of every spelling of the key, in order.
   */
  getAll(name: string, caseSensitivity: CaseSensitivity = "caseInsensitive"): string[] {
    if (caseSensitivity === "caseSensitive") {
      return this.searchParams.getAll(name);
    }
    const lowerName = name.toLowerCase();
    return [...this.searchParams.entries()]
      .filter(([key]) => key.toLowerCase() === lowerName)
      .map(([, value]) => value);
  }

  /**
   * Returns whether {@link name} is present in the search parameters. If {@link value} is provided,
   * returns whether {@link name} with that particular {@link value} is present the search parameters.
   *
   * Key matching follows {@link caseSensitivity} like {@link get}. Numbers and booleans are
   * compared as their {@link String} form.
   */
  has(
    name: string,
    value?: SearchParamValue,
    caseSensitivity: CaseSensitivity = "caseInsensitive",
  ): boolean {
    return this.searchParams.has(
      this.resolveName(name, caseSensitivity),
      value === undefined ? undefined : toSearchParamString(value),
    );
  }

  /**
   * Makes a copy of this {@link UrlSearchParams} and appends {@link name}={@link value} as an
   * additional parameter.
   *
   * Numbers and booleans are converted with {@link String}.
   */
  copyAndAppend(name: string, value: SearchParamValue): UrlSearchParams {
    const searchParams = newURLSearchParams(this.searchParams);
    searchParams.append(name, toSearchParamString(value));
    return UrlSearchParams.fromUnique(searchParams);
  }

  /**
   * Makes a copy of this {@link UrlSearchParams} and appends all the other provided search parameters.
   *
   * Numbers and booleans are converted with {@link String}.
   */
  copyAndAppendAll(params: IntoSearchParams): UrlSearchParams {
    const others =
      params instanceof URLSearchParams || params instanceof UrlSearchParams || isArray(params)
        ? params
        : Object.entries(params);
    return UrlSearchParams.new([...this.searchParams, ...others]);
  }

  /**
   * Makes a copy of this {@link UrlSearchParams} and sets {@link name}={@link value} as a parameter.
   *
   * If multiple search parameters already exist with the key {@link name}, then they are all
   * removed/replaced with a single {@link name}={@link value} parameter. By default
   * (`caseInsensitive`) every spelling of the key is replaced, in the position of the first one.
   *
   * Numbers and booleans are converted with {@link String}.
   */
  copyAndSet(
    name: string,
    value: SearchParamValue,
    caseSensitivity: CaseSensitivity = "caseInsensitive",
  ): UrlSearchParams {
    if (caseSensitivity === "caseSensitive") {
      const searchParams = newURLSearchParams(this.searchParams);
      searchParams.set(name, toSearchParamString(value));
      return UrlSearchParams.fromUnique(searchParams);
    }
    const lowerName = name.toLowerCase();
    const entries: [string, string][] = [];
    let isSet = false;
    for (const [key, val] of this.searchParams.entries()) {
      if (key.toLowerCase() !== lowerName) {
        entries.push([key, val]);
      } else if (!isSet) {
        entries.push([name, toSearchParamString(value)]);
        isSet = true;
      }
    }
    if (!isSet) {
      entries.push([name, toSearchParamString(value)]);
    }
    return UrlSearchParams.fromUnique(newURLSearchParams(entries));
  }

  /**
   * Makes a copy of this {@link UrlSearchParams} and deletes all parameters with the key {@link name}.
   * By default (`caseInsensitive`), every spelling of the key is removed. Pass `caseSensitive` to
   * remove only the exact key.
   * If {@link value} is provided, then only parameters also matching that value are removed.
   *
   * Numbers and booleans are compared as their {@link String} form.
   */
  copyAndDelete(
    name: string,
    value?: SearchParamValue,
    caseSensitivity: CaseSensitivity = "caseInsensitive",
  ): UrlSearchParams {
    const lowerName = name.toLowerCase();
    const stringValue = value === undefined ? undefined : toSearchParamString(value);
    const isDeleted = ([key, val]: [string, string]) =>
      (caseSensitivity === "caseSensitive" ? key === name : key.toLowerCase() === lowerName) &&
      (stringValue === undefined || val === stringValue);
    const entries = [...this.searchParams.entries()];
    if (!entries.some(isDeleted)) {
      return this;
    }
    return UrlSearchParams.fromUnique(newURLSearchParams(entries.filter(e => !isDeleted(e))));
  }

  /** Makes a copy of this {@link UrlSearchParams} and stably sorts parameters by their keys. */
  toSorted(): UrlSearchParams {
    const searchParams = newURLSearchParams(this.searchParams);
    searchParams.sort();
    return UrlSearchParams.fromUnique(searchParams);
  }

  /** Converts this immutable {@link UrlSearchParams} to a mutable {@link URLSearchParams}. */
  toMutable(): URLSearchParams {
    return new URLSearchParams(this.searchParams);
  }

  toString(): string {
    return this.searchParams.toString();
  }

  [Symbol.iterator](): URLSearchParamsIterator<[string, string]> {
    return this.searchParams[Symbol.iterator]();
  }

  entries(): URLSearchParamsIterator<[string, string]> {
    return this.searchParams.entries();
  }

  keys(): URLSearchParamsIterator<string> {
    return this.searchParams.keys();
  }

  values(): URLSearchParamsIterator<string> {
    return this.searchParams.values();
  }
}
