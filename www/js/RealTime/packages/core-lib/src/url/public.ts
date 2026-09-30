import { Result } from "../result";
import { BaseUrl } from "./base";
import { IntoSearchParams, UrlSearchParams } from "./searchParams";
import {
  BaseUrlOptions,
  cloneURL,
  CreateUrlError,
  fromURLWithRequiredOptions,
  ParseUrlError,
  parseWithRequiredOptions,
} from "./shared";
import { Unique } from "./types";

/** Options to use when parsing or creating a {@link Url}. */
export type UrlOptions = {
  /**
   * The set of allowed domains. Entries starting with a `.` will allow any subdomain.
   * Otherwise, only an exact match is allowed.
   *
   * E.g., `".roblox.com"` allows both `www.roblox.com` and `create.roblox.com`. Whereas,
   * `"roblox.qq.com"` allows only a host matching exactly that string.
   */
  readonly domainAllowlist?: readonly string[];
  /**
   * Remove possibly malicious search parameters.
   *
   * Currently just removes keys or values matching entries in {@link possiblyMaliciousParameters}.
   */
  readonly sanitize?: boolean;
};

const schemeAllowlist = ["https:"] as const;

type UrlScheme = (typeof schemeAllowlist)[number];

const defaultBaseUrlOptions: Required<BaseUrlOptions> = {
  schemeAllowlist,
  domainAllowlist: [
    ".roblox.com",
    ".robloxlabs.com",
    ".robloxapp.vnggames.com",
    "roblox.qq.com",
    "localhost",
  ],
  sanitize: true,
};

/** The default {@link UrlOptions} options used when creating or parsing a {@link Url}. */
export const defaultUrlOptions: Required<UrlOptions> = defaultBaseUrlOptions;

/**
 * An immutable and validated URL. Exposes a subset of the {@link URL} API.
 *
 * A {@link Url} is guaranteed to:
 * - Have a host in the default allowlist (or a custom adhoc allowlist). See {@link defaultUrlOptions}.
 * - Have a scheme of `https`.
 * - Have no port, username, or password.
 *
 * ```
 * const url = Url.parse("https://www.roblox.com").getOrThrow();
 * const url2 = url.withSearchParams({ foo: "bar" });
 * const url3 = url.withPath("my/account").withFragment("!/info");
 * ```
 */
export class Url extends BaseUrl {
  private constructor(url: Unique<URL>, searchParams: UrlSearchParams) {
    super(url, searchParams);
  }

  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  private static new(this: void, url: Unique<URL>, searchParams: UrlSearchParams): Url {
    // eslint-disable-next-line no-param-reassign
    url.port = "";
    return new Url(url, searchParams);
  }

  /**
   * Create an immutable {@link Url} from a mutable {@link URL}.
   *
   * Rather than using the {@link defaultUrlOptions}, this method uses the provided {@link UrlOptions}.
   *
   * @see {@link CreateUrlError} for the possible error cases.
   */
  static fromURLWithOptions(url: URL, options: UrlOptions): Result<Url, CreateUrlError> {
    return fromURLWithRequiredOptions(
      url,
      { ...defaultBaseUrlOptions, ...options, schemeAllowlist },
      Url.new,
    );
  }

  /**
   * Create an immutable {@link Url} from a mutable {@link URL}.
   *
   * @see {@link CreateUrlError} for the possible error cases.
   */
  static fromURL(url: URL): Result<Url, CreateUrlError> {
    return fromURLWithRequiredOptions(url, defaultBaseUrlOptions, Url.new);
  }

  /**
   * Parse a string into a {@link Url}.
   *
   * Rather than using the {@link defaultUrlOptions}, this method uses the provided {@link UrlOptions}.
   *
   * @see {@link ParseUrlError} for the possible error cases.
   */
  static parseWithOptions(url: string, options: UrlOptions): Result<Url, ParseUrlError> {
    return parseWithRequiredOptions(
      url,
      { ...defaultBaseUrlOptions, ...options, schemeAllowlist },
      Url.new,
    );
  }

  /**
   * Parse a string into a {@link Url}.
   *
   * @see {@link ParseUrlError} for the possible error cases.
   */
  static parse(url: string): Result<Url, ParseUrlError> {
    return parseWithRequiredOptions(url, defaultBaseUrlOptions, Url.new);
  }

  /** @deprecated A {@link Url} is guaranteed to have a scheme of `https`. */
  override get scheme(): UrlScheme {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return super.scheme as UrlScheme;
  }

  /** @deprecated A {@link Url} is guaranteed to not have a port. */
  override get port(): string {
    return super.port;
  }

  /**
   * Makes a copy of this {@link Url} and replaces the specified parts of the URL with new values.
   *
   * See also {@link withPath}, {@link withSearchParams}, and {@link withFragment}.
   */
  with({
    path,
    searchParams,
    fragment,
  }: {
    readonly path?: string;
    readonly searchParams?: IntoSearchParams;
    readonly fragment?: string;
  }): Url {
    if (path == null && searchParams == null && fragment == null) {
      return this;
    }
    const url = cloneURL(this.url);
    if (path != null) {
      url.pathname = path;
    }
    if (fragment != null) {
      url.hash = fragment;
    }
    if (searchParams != null) {
      const params = UrlSearchParams.new(searchParams);
      url.search = params.toString();
      return new Url(url, params);
    }
    return new Url(url, this.searchParams);
  }

  /** Makes a copy of this {@link Url} and replaces the path. */
  withPath(path: string): Url {
    const url = cloneURL(this.url);
    url.pathname = path;
    return new Url(url, this.searchParams);
  }

  /** Makes a copy of this {@link Url} and replaces the query string. */
  withSearchParams(searchParams: IntoSearchParams): Url {
    const params = UrlSearchParams.new(searchParams);
    const url = cloneURL(this.url);
    url.search = params.toString();
    return new Url(url, params);
  }

  /** Makes a copy of this {@link Url} and appends the provided search parameters. */
  withSearchParamsAppended(searchParams: IntoSearchParams): Url {
    const params = this.searchParams.copyAndAppendAll(searchParams);
    const url = cloneURL(this.url);
    url.search = params.toString();
    return new Url(url, params);
  }

  /**
   * Makes a copy of this {@link Url} and replaces the fragment identifier.
   *
   * A leading `#` is added to the new fragment, if not already present.
   * Setting the fragment to `""` removes it.
   */
  withFragment(fragment: string): Url {
    const url = cloneURL(this.url);
    url.hash = fragment;
    return new Url(url, this.searchParams);
  }
}
