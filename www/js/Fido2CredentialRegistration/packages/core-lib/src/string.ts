import { downcast, SubType } from "./types";

/** A Base64-encoded string. */
export type Base64 = SubType<"Base64", string>;

/**
 * A URL-compatible Base64-encoded string.
 *
 * That is, a Base64-encoded string where all:
 * - `+` are replaced with `-`
 * - `/` are replaced with `_`
 * - `=` are removed
 */
export type Base64Url = SubType<"Base64Url", string>;

// See https://developer.mozilla.org/en-US/docs/Web/API/Window/btoa#unicode_strings
// for the code snippets below.

/** Narrows an arbitrary string into a {@link Base64} encoded string. */
export const isBase64 = (str: string): str is Base64 =>
  str.length % 4 === 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(str);

/** Narrows an arbitrary string into a {@link Base64Url} encoded string. */
export const isBase64Url = (str: string): str is Base64Url =>
  str.length % 4 !== 1 && /^[A-Za-z0-9-_]*$/.test(str);

/** Converts a {@link Base64} to a {@link Base64Url}. */
export const base64ToBase64Url = (base64: Base64): Base64Url =>
  downcast(base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, ""));

/** Converts a {@link Base64Url} to a {@link Base64}. */
export const base64UrlToBase64 = (base64Url: Base64Url): Base64 => {
  const rem = base64Url.length % 4;
  const padding = "=".repeat(rem === 0 ? 0 : 4 - rem);
  const replaced = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  return downcast(`${replaced}${padding}`);
};

/** Converts a {@link Uint8Array} string to a {@link Base64}. */
export const bytesToBase64 = (bytes: Uint8Array): Base64 => {
  const binString = Array.from(bytes, c => String.fromCodePoint(c)).join("");
  // eslint-disable-next-line no-restricted-globals
  return downcast(btoa(binString));
};

/** Converts a {@link Base64} string to a {@link Uint8Array}. */
export const base64ToBytes = (base64: Base64): Uint8Array =>
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, no-restricted-globals
  Uint8Array.from(atob(base64), c => c.codePointAt(0)!);

/** Converts a {@link Uint8Array} string to a {@link Base64Url}. */
export const bytesToBase64Url = (bytes: Uint8Array): Base64Url =>
  base64ToBase64Url(bytesToBase64(bytes));

/** Converts a {@link Base64Url} string to a {@link Uint8Array}. */
export const base64UrlToBytes = (base64: Base64Url): Uint8Array =>
  base64ToBytes(base64UrlToBase64(base64));

const encoder = new TextEncoder();

/**
 * Converts a string to a {@link Base64}.
 *
 * Note that function is somewhat useless and is mainly just for light obfuscation.
 */
export const stringToBase64 = (str: string): Base64 => bytesToBase64(encoder.encode(str));

/**
 * Converts a string to a {@link Base64Url}.
 *
 * Note that function is somewhat useless and is mainly just for light obfuscation.
 */
export const stringToBase64Url = (str: string): Base64Url => base64ToBase64Url(stringToBase64(str));

const decoder = new TextDecoder();

/**
 * Converts a {@link Base64} to a string.
 *
 * Note that function is somewhat useless and is mainly just for light obfuscation.
 */
export const base64ToString = (base64: Base64): string => decoder.decode(base64ToBytes(base64));

/**
 * Converts a {@link Base64Url} to a string.
 *
 * Note that function is somewhat useless and is mainly just for light obfuscation.
 */
export const base64UrlToString = (base64: Base64Url): string =>
  decoder.decode(base64UrlToBytes(base64));
