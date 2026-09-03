import * as queryString from "query-string";
import normalizeUrl from "normalize-url";
import { Brand } from "@rbx/core-types";
import environmentUrls from "@rbx/environment-urls";
import * as endpoints from "../../endpoints";
import {
  composeQueryString as composeQueryStringCore,
  getQueryParam as getQueryParamCore,
  getRelativeUrlWithQueries as getRelativeUrlWithQueriesCore,
  parseQueryString as parseQueryStringCore,
  type ParsedQuery,
} from "./legacyQueryString";

export type { ParsedQuery };

/** @deprecated Use {@link UrlSearchParams.parse} from `@rbx/core-lib/url` with an explicit query string. */
export const parseUrlAndQueryString = queryString.parseUrl;

/** @deprecated Use {@link UrlSearchParams} from `@rbx/core-lib/url` instead. */
export const extractQueryString = queryString.extract;

const getDefaultSearchString = (): string =>
  typeof window !== "undefined" ? window.location.search : "";

/**
 * @deprecated Use {@link UrlSearchParams.parse} from `@rbx/core-lib/url` with an explicit search string.
 * In Next.js, prefer route `searchParams` via `@rbx/www-nextjs/sanitize`.
 */
export const parseQueryString = (searchString: string = getDefaultSearchString()): ParsedQuery =>
  parseQueryStringCore(searchString);

/**
 * @deprecated Use {@link UrlSearchParams.get} from `@rbx/core-lib/url` with an explicit search string.
 * In Next.js, prefer route `searchParams` via `@rbx/www-nextjs/sanitize`.
 */
export const getQueryParam = (paramName: string): ParsedQuery[string] | undefined =>
  getQueryParamCore(paramName, getDefaultSearchString());

/**
 * @deprecated Use {@link UrlSearchParams.new} from `@rbx/core-lib/url` and `.toString()` instead.
 */
export const composeQueryString = composeQueryStringCore;

/** @deprecated Use `@rbx/core-scripts/endpoints`, `@rbx/www-nextjs/base-urls`, or {@link Url} from `@rbx/core-lib/url` in Next.js. */
export const getAbsoluteUrl = (targetUrl: string): string => endpoints.getAbsoluteUrl(targetUrl);

/** @deprecated Prefer {@link Url.withSearchParams} from `@rbx/core-lib/url` with an absolute base URL. */
export const getUrlWithQueries = (path: string, queryParams: Record<string, unknown>): string =>
  getAbsoluteUrl(`${path}?${composeQueryString(queryParams)}`);

/** @deprecated Prefer `{ path, searchParams }` with `@rbx/www-nextjs/navigation` `intoUrl`, or {@link UrlSearchParams} from `@rbx/core-lib/url`. */
export const getRelativeUrlWithQueries = getRelativeUrlWithQueriesCore;

/** @deprecated Prefer {@link Url.withSearchParams} from `@rbx/core-lib/url`. */
export const getUrlWithLocale = (path: string, locale: string): string => {
  if (locale) {
    const queryParams = { locale };
    return getUrlWithQueries(path, queryParams);
  }

  return path;
};

export type ZendeskDeepLinkParams = {
  articleId?: string;
  domain: string;
  locale?: string;
  type?: string;
};

const getHelpDeskLocale = (locale: string): string => {
  // zendesk supported languages https://support.zendesk.com/hc/en-us/articles/4408821324826-Zendesk-language-support-by-product
  const specialCaseLocaleMap: Record<string, string> = {
    "zh-cn": "zh-cn",
    zh_cn: "zh-cn",
    "zh-cjv": "zh-cn",
    zh_cjv: "zh-cn",
    "zh-hans": "zh-cn",
    zh_hans: "zh-cn",
    "zh-tw": "zh-tw",
    zh_tw: "zh-tw",
    "zh-hant": "zh-tw",
    zh_hant: "zh-tw",
    "en-us": "en-us",
    en_us: "en-us",
    en: "en-us",
    "en-gb": "en-gb",
    en_gb: "en-gb",
    "fr-ca": "fr-ca",
    fr_ca: "fr-ca",
    nb: "no",
    "nb-no": "no",
    nb_no: "no",
  };

  if (specialCaseLocaleMap[locale]) {
    return specialCaseLocaleMap[locale];
  }

  const localeArray: string[] = locale.split(/[^a-zA-Z0-9]/).filter(Boolean);

  if (localeArray[0]) {
    return localeArray[0];
  }

  return "en";
};

const isValidLocale = (locale: string): boolean => {
  // valid if alphanumeric and hyphen or underscore
  if (locale) {
    return /^[a-zA-Z0-9-_]+$/.test(locale);
  }
  return false;
};

const isValidHelpDeskArticleId = (articleId?: string): boolean => {
  // valid if alphanumeric
  if (articleId) {
    return /^[a-zA-Z0-9]+$/.test(articleId);
  }
  return false;
};

export const getHelpDeskUrl = (
  locale?: string,
  articleId?: string,
  baseUrlOverride?: string,
): string => {
  let helpDeskUrl = baseUrlOverride ?? "https://en.help.roblox.com/hc/";
  if (locale != null && isValidLocale(locale)) {
    helpDeskUrl += getHelpDeskLocale(locale);
  } else {
    helpDeskUrl += "en-us";
  }

  if (isValidHelpDeskArticleId(articleId)) {
    helpDeskUrl += `/articles/${articleId}`;
  }
  return helpDeskUrl;
};

export type ValidHttpUrl = Brand<string, "ValidUrl">;
export type TValidHttpUrl = ValidHttpUrl;
export type ValidStripeCheckoutUrl = Brand<string, "ValidStripeCheckoutUrl">;

export const isValidHttpUrl = (urlString: string): urlString is ValidHttpUrl => {
  try {
    const urlObject = new URL(urlString);
    return urlObject.protocol === "http:" || urlObject.protocol === "https:";
  } catch {
    return false;
  }
};

export const isValidStripeCheckoutUrl = (urlString: string): urlString is ValidStripeCheckoutUrl =>
  isValidHttpUrl(urlString) &&
  (urlString.includes("checkout.stripe.com") ||
    urlString.includes(environmentUrls.stripeCheckoutDomain));
/*
 * This function is for a URL safety check.
 * It should be implemented to ensure that the URL is safe to use.
 * For example, it could check for malicious content or ensure that the URL
 * does not lead to a phishing site, or trigger unwanted scripts
 * Doc for normalizeUrl can be found here:
 * https://github.com/sindresorhus/normalize-url
 * @param urlString - The URL string to check for safety.
 * @returns A URL that is safe to use in Roblox.
 */
export const urlSafetyValidation = (urlString: string): URL | undefined => {
  let normalizedUrl: string;
  try {
    // Only allow https protocol by default
    normalizedUrl = normalizeUrl(urlString, { defaultProtocol: "https", stripWWW: false });
  } catch {
    // If normalization fails, return undefined
    return undefined;
  }
  if (!isValidHttpUrl(normalizedUrl)) {
    return undefined;
  }
  // Ensure the domain is a Roblox domain
  const urlObject = new URL(normalizedUrl);
  const { domain } = environmentUrls;
  // domain can be different length for different environments, e.g., roblox.com vs. sitetest1.robloxlab.com
  // Extract the same length of domain from the hostname (e.g., sub.example.com -> example.com)
  const robloxDomainParts = domain.split(".");
  const hostnameParts = urlObject.hostname.split(".");
  const urlDomain =
    hostnameParts.length >= robloxDomainParts.length
      ? hostnameParts.slice(-robloxDomainParts.length).join(".")
      : urlObject.hostname;
  if (urlDomain !== domain) {
    return undefined;
  }
  return urlObject;
};
export * from "./url";
