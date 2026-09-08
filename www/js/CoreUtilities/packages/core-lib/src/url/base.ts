import { UrlSearchParams } from "./searchParams";
import { Unique } from "./types";

export abstract class BaseUrl {
  protected constructor(
    protected readonly url: Unique<URL>,
    /** The immutable URL search parameters. */
    readonly searchParams: UrlSearchParams,
  ) {}

  /** The whole URL as a string. */
  get href(): string {
    return this.url.href;
  }

  /** The scheme of this URL including the trailing `:`. */
  get scheme(): string {
    return this.url.protocol;
  }

  /**
   * The authority of this URL (host and port).
   *
   * See {@link BaseUrl.host} for just the host name and {@link BaseUrl.port} for just the port number.
   */
  get authority(): string {
    return this.url.host;
  }

  /**
   * The host name of this URL.
   *
   * This does not include the port number. See {@link authority} or {@link port} to get the port number.
   */
  get host(): string {
    return this.url.hostname;
  }

  /**
   * The port number of this URL.
   *
   * If the port is the default for the protocol, then this property contains an empty string.
   */
  get port(): string {
    return this.url.port;
  }

  /** The path of this URL including the leading `/`. */
  get path(): string {
    return this.url.pathname;
  }

  /**
   * The query string of this URL. This includes the leading `?` if the query string is not empty.
   *
   * See also {@link searchParams} for the query string as structured data.
   */
  get query(): string {
    return this.url.search;
  }

  /** The fragment identifier of this URL. This includes the leading `#` if the hash is not empty. */
  get fragment(): string {
    return this.url.hash;
  }

  /** Converts this immutable {@link BaseUrl} to a mutable {@link URL}. */
  toMutable(): URL {
    // eslint-disable-next-line no-restricted-globals
    return new URL(this.url);
  }

  toString(): string {
    return this.url.toString();
  }

  toJson(): string {
    return this.url.toJSON();
  }
}
