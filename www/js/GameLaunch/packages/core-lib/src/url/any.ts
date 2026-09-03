import { downcast } from "../commonTypes";
import { err, ok, Result } from "../result";
import { BaseUrl } from "./base";
import { IntoSearchParams, UrlSearchParams } from "./searchParams";
import { cloneURL } from "./shared";
import { Unique } from "./types";

/**
 * An immutable URL with no restrictions. Exposes a subset of the {@link URL} API.
 *
 * An {@link AnyUrl} is guaranteed to have no username or password.
 *
 * ```
 * const url = AnyUrl.parse("http://anyhost").getOrThrow();
 * const url2 = url.withPort(80);
 * const url3 = url.withPath("/my/route").withSearchParams({ foo: "bar" });
 * ```
 */
export class AnyUrl extends BaseUrl {
  private constructor(url: Unique<URL>, searchParams: UrlSearchParams) {
    super(url, searchParams);
  }

  private static new(url: Unique<URL>): AnyUrl {
    /* eslint-disable no-param-reassign */
    url.password = "";
    url.username = "";
    /* eslint-enable no-param-reassign */
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const searchParams = UrlSearchParams.internalFromUniqueURLSearchParams(
      downcast(url.searchParams),
    );
    return new AnyUrl(url, searchParams);
  }

  /** Create an immutable {@link AnyUrl} from a mutable {@link URL}. */
  static fromURL(url: URL): AnyUrl {
    return AnyUrl.new(cloneURL(url));
  }

  /** Parse a string into an {@link AnyUrl}. */
  static parse(url: string): Result<AnyUrl> {
    try {
      // eslint-disable-next-line no-restricted-globals
      return ok(AnyUrl.new(downcast(new URL(url))));
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      return err(e as Error);
    }
  }

  /** Makes a copy of this {@link AnyUrl} and replaces the specified parts of the URL with new values. */
  with({
    scheme,
    host,
    port,
    path,
    searchParams,
    fragment,
  }: {
    readonly scheme?: string;
    readonly host?: string;
    readonly port?: number | string;
    readonly path?: string;
    readonly searchParams?: IntoSearchParams;
    readonly fragment?: string;
  }): AnyUrl {
    if (
      scheme == null &&
      host == null &&
      port == null &&
      path == null &&
      searchParams == null &&
      fragment == null
    ) {
      return this;
    }
    const url = cloneURL(this.url);
    if (scheme != null) {
      url.protocol = scheme;
    }
    if (host != null) {
      url.hostname = host;
    }
    if (port != null) {
      url.port = typeof port === "number" ? port.toString() : port;
    }
    if (path != null) {
      url.pathname = path;
    }
    if (fragment != null) {
      url.hash = fragment;
    }
    if (searchParams != null) {
      const params = UrlSearchParams.new(searchParams);
      url.search = params.toString();
      return new AnyUrl(url, params);
    }
    return new AnyUrl(url, this.searchParams);
  }

  /** Makes a copy of this {@link AnyUrl} and replaces the protocol scheme. */
  withScheme(scheme: string): AnyUrl {
    const url = cloneURL(this.url);
    url.protocol = scheme;
    return new AnyUrl(url, this.searchParams);
  }

  /** Makes a copy of this {@link AnyUrl} and replaces the host name. */
  withHost(host: string): AnyUrl {
    const url = cloneURL(this.url);
    url.hostname = host;
    return new AnyUrl(url, this.searchParams);
  }

  /** Makes a copy of this {@link AnyUrl} and replaces the port number. */
  withPort(port: number | string): AnyUrl {
    const url = cloneURL(this.url);
    url.port = typeof port === "number" ? port.toString() : port;
    return new AnyUrl(url, this.searchParams);
  }

  /** Makes a copy of this {@link AnyUrl} and replaces the path. */
  withPath(path: string): AnyUrl {
    const url = cloneURL(this.url);
    url.pathname = path;
    return new AnyUrl(url, this.searchParams);
  }

  /** Makes a copy of this {@link AnyUrl} and replaces the query string. */
  withSearchParams(searchParams: IntoSearchParams): AnyUrl {
    const params = UrlSearchParams.new(searchParams);
    const url = cloneURL(this.url);
    url.search = params.toString();
    return new AnyUrl(url, params);
  }

  /** Makes a copy of this {@link AnyUrl} and appends the provided search parameters. */
  withSearchParamsAppended(searchParams: IntoSearchParams): AnyUrl {
    const params = this.searchParams.copyAndAppendAll(searchParams);
    const url = cloneURL(this.url);
    url.search = params.toString();
    return new AnyUrl(url, params);
  }

  /**
   * Makes a copy of this {@link AnyUrl} and replaces the fragment identifier.
   *
   * A leading `#` is added to the new fragment, if not already present.
   * Setting the fragment to `""` removes it.
   */
  withFragment(fragment: string): AnyUrl {
    const url = cloneURL(this.url);
    url.hash = fragment;
    return new AnyUrl(url, this.searchParams);
  }
}
