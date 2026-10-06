/* eslint-disable no-restricted-globals */
import { downcast } from "../types";
import { Unique } from "./types";

const newURLSearchParams = (
  url: ConstructorParameters<typeof URLSearchParams>[0],
): Unique<URLSearchParams> => downcast(new URLSearchParams(url));

/** A search parameter value. Numbers and booleans are converted with {@link String}. */
export type SearchParamValue = string | number | boolean;

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

  /** The total number of search parameter entries. */
  get size(): number {
    return this.searchParams.size;
  }

  /** Returns the first search parameter value associated with {@link name}. */
  get(name: string): string | null {
    return this.searchParams.get(name);
  }

  /** Returns all the search parameter values associated with {@link name}. */
  getAll(name: string): string[] {
    return this.searchParams.getAll(name);
  }

  /**
   * Returns whether {@link name} is present in the search parameters. If {@link value} is provided,
   * returns whether {@link name} with that particular {@link value} is present the search parameters.
   *
   * Numbers and booleans are compared as their {@link String} form.
   */
  has(name: string, value?: SearchParamValue): boolean {
    return this.searchParams.has(
      name,
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
   * removed/replaced with a single {@link name}={@link value} parameter.
   *
   * Numbers and booleans are converted with {@link String}.
   */
  copyAndSet(name: string, value: SearchParamValue): UrlSearchParams {
    const searchParams = newURLSearchParams(this.searchParams);
    searchParams.set(name, toSearchParamString(value));
    return UrlSearchParams.fromUnique(searchParams);
  }

  /**
   * Makes a copy of this {@link UrlSearchParams} and deletes all parameters with the key {@link name}.
   * If {@link value} is provided, then only parameters also matching that value are removed.
   *
   * Numbers and booleans are compared as their {@link String} form.
   */
  copyAndDelete(name: string, value?: SearchParamValue): UrlSearchParams {
    const stringValue = value === undefined ? undefined : toSearchParamString(value);
    if (this.searchParams.has(name, stringValue)) {
      const searchParams = newURLSearchParams(this.searchParams);
      searchParams.delete(name, stringValue);
      return UrlSearchParams.fromUnique(searchParams);
    }
    return this;
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
