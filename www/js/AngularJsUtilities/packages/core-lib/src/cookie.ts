// This module is inspired after the browser native Cookie Store API and the NextJS `cookie` API.
// - https://developer.mozilla.org/en-US/docs/Web/API/Cookie_Store_API
// - https://nextjs.org/docs/app/api-reference/functions/cookies

import { Prettify, ValueOf } from "./commonTypes";

/** A cookie's name, value, and options. */
export type Cookie = { name: string; value: string };

/** The available options when setting a cookie. */
export type CookieOptions = {
  /**
   * Specifies the domain where the cookie is available.
   *
   * If not specified, this defaults to the host portion of the current document location and the cookie is not
   * available on subdomains.
   *
   * If a domain is specified, subdomains are always included.
   */
  readonly domain?: string;
  /**
   * Limits the cookie's scope to a specific path within the domain.
   *
   * Defaults to `/`.
   */
  readonly path?: string;
  /**
   * Controls whether or not the cookie is sent in cross-site requests.
   *
   * Browsers default to `lax` if not provided.
   *
   * See: [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#samesitesamesite-value)
   */
  readonly sameSite?: "lax" | "strict" | "none";
  /**
   * The expiry date of the cookie.
   *
   * If neither `expires` nor `max-age` is specified, then the cookie will expire at the end of session.
   */
  readonly expires?: Date;
  /**
   * The maximum age of the cookie in seconds.
   *
   * If neither `expires` nor `max-age` is specified, then the cookie will expire at the end of session.
   */
  readonly maxAge?: number;
};

/** The available options when deleting a cookie. */
export type DeleteCookieOptions<Key extends keyof CookieRegistry = keyof CookieRegistry> = Prettify<
  Pick<CookieRegistry[Key], keyof CookieRegistry[Key] & ("domain" | "path")>
>;

/**
 * The registry of cookie names and their expected {@link CookieOptions}.
 *
 * You can make the options for each cookie more restrictive to enforce that:
 * 1. Some options are always provided when setting the cookie. (E.g., `maxAge` should be provided so that the cookie persists after the session.)
 * 2. Some options must have a certain value for the cookie. (E.g., `sameSite` should always be `"strict"` for this particular cookie.)
 * 3. The same domain and path used to set the cookie are also used to delete the cookie. (So that the deletion does not silently fail.)
 *
 * Note that this is an interface, so you can add entries from your own code and the declarations
 * will be merged. For example:
 * ```
 * import "@rbx/core-lib/cookie";
 *
 * declare module "@rbx/core-lib/cookie" {
 *   interface CookieRegistry {
 *     MyCookie: {
 *       readonly domain: string,
 *       readonly sameSite: "strict",
 *       readonly maxAge: number,
 *     };
 *   }
 * }
 *
 * export {};
 * ```
 *
 * The registry is also used to more easily audit the list of cookies in use (i.e., for compliance purposes).
 */
export interface CookieRegistry {
  "__placeholder-cookie-do-not-use": CookieOptions;
}

/**
 * This type is used to check that all option objects in the CookieRegistry have valid keys/types.
 * If you get an error here, check that the options object of the entry you added to
 * {@link CookieRegistry} is type compatible with {@link CookieOptions}.
 */
type AllEntriesHaveValidOptions = ValueOf<CookieRegistry> extends CookieOptions ? true : never;
const _: AllEntriesHaveValidOptions = true;

/** Get all cookies from the browser. */
export const getAll = (): Cookie[] =>
  // eslint-disable-next-line no-restricted-properties
  document.cookie.split("; ").map(kv => {
    const [name, value] = kv.split("=");
    return { name: name ?? "", value: decodeURIComponent(value ?? "") };
  });

/** Get a cookie from the browser. */
export const get = (name: keyof CookieRegistry): Cookie | null => {
  const prefix = `${name}=`;
  // eslint-disable-next-line no-restricted-properties
  const value = document.cookie
    .split("; ")
    .find(row => row.startsWith(prefix))
    ?.split("=")[1];

  if (value == null) {
    return null;
  }

  return {
    name,
    value: decodeURIComponent(value),
  };
};

const setCookie = (name: string, value: string, opts: CookieOptions): void => {
  const sameSite = opts.sameSite == null ? "" : `;samesite=${opts.sameSite}`;
  const domain = opts.domain == null ? "" : `;domain=${opts.domain}`;
  const path = `;path=${opts.path ?? "/"}`;
  const expires = opts.expires == null ? "" : `;expires=${opts.expires.toUTCString()}`;
  const maxAge = opts.maxAge == null ? "" : `;max-age=${opts.maxAge}`;
  // eslint-disable-next-line no-restricted-properties
  document.cookie = `${name}=${encodeURIComponent(value)};secure${sameSite}${domain}${path}${expires}${maxAge}`;
};

/** Sets a cookie in the browser. */
export const set = <Key extends keyof CookieRegistry>(
  name: Key,
  value: string,
  options: CookieRegistry[Key],
): void => {
  setCookie(name, value, options);
};

/**
 * Delete a cookie in the browser.
 *
 * Note that the `domain` and `path` options must match the cookie you intend to delete.
 */
const deleteCookie = <Key extends keyof CookieRegistry>(
  name: Key,
  options: DeleteCookieOptions<Key>,
): void => {
  const { domain, path }: CookieOptions = options;
  setCookie(name, "", { domain, path, expires: new Date(0) });
};

export { deleteCookie as delete };
