/* eslint-disable @typescript-eslint/ban-ts-comment */

// TODO: remove this and use built-in `Url` object in JS
// @ts-ignore-error The type definitions below are according to https://github.com/defunctzombie/node-url
import url from "npm-url";
import { StringifiableRecord } from "query-string";

type UrlObj = {
  protocol?: string;
  auth?: string;
  hostname?: string;
  port?: string;
  host?: string;
  pathname?: string;
  search?: string;
  query?: StringifiableRecord;
  hash?: string;
};

/**
 * @deprecated Please use the JavaScript built-in `URL` object instead. In particular, the
 * `toString()` method or the `href` property.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/toString
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
export const formatUrl: (url: UrlObj) => string = url.format;

/**
 * @deprecated Please use the JavaScript built-in `URL` object instead. In particular, the
 * constructor `new Url(urlString, baseURL)`. Note that this will throw an exception if it fails to
 * parse an argument as a URL.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL#usage_notes
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
export const resolveUrl: (from: string, to: string) => string = url.resolve;

/**
 * @deprecated Please use the JavaScript built-in `URL` object instead. In particular, the
 * constructor `new Url(urlString)`. Note that this will throw an exception if it fails to parse the
 * string as a URL.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const parseUrl: (
  url: string,
  parseQueryString?: boolean,
  slashesDenoteHost?: boolean,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
) => UrlObj & { href: string; path?: string } = url.parse;
