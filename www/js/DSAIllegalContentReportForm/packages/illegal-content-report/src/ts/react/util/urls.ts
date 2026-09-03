import { EnvironmentUrls } from "@rbx/legacy-webapp-types/Roblox";

/**
 * The character used to separate URLs in a input string
 */
const URL_SEPARATOR = ',';

/**
 * Splits up URLs by the separator character into array.
 * Remove any empty strings.
 */
export const getUrlsList = (rawUrl: string): string[] => {
  return rawUrl
    .split(URL_SEPARATOR)
    .map(url => url.trim())
    .filter(url => url);
};

/**
 * Checks if the number of URLs exceeds the limit given a comma-separated list of URLs.
 */
export const isTooManyUrls = (rawUrl: string, maxAllowedCount: number): boolean => {
  const urls = getUrlsList(rawUrl);
  return urls.length > maxAllowedCount;
};

export const isUsingInvalidSeparator = (rawUrl: string): boolean => {
  const urls = getUrlsList(rawUrl);
  const hasUnseparatedUrls = urls.some(url => {
    const matches = url.match(/https:\/\//g);
    return matches && matches.length > 1;
  });
  return hasUnseparatedUrls;
};

/**
 * If the URL is a Roblox URL. Top-level or subdomains.Allows:
 * - `https://${EnvironmentUrls.domain}/`
 * - `https://*.${EnvironmentUrls.domain}/`
 */
export const isValidRobloxUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);

    const isValidDomain =
      parsedUrl.hostname === EnvironmentUrls.domain ||
      parsedUrl.hostname.endsWith(`.${EnvironmentUrls.domain}`);

    const isValidProtocol = parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:';

    return isValidDomain && isValidProtocol;
  } catch (error) {
    return false;
  }
};

/**
 * Checks if all URLs in a comma-separated list are valid Roblox URLs.
 */
export const isValidRobloxUrls = (rawUrls: string): boolean => {
  const urls = getUrlsList(rawUrls);
  return urls.every(isValidRobloxUrl) && urls.length > 0;
};

/**
 * Sample URL to show users as an example.
 */
export const getSampleRobloxUrl = (): string => {
  return `https://${EnvironmentUrls.domain}/catalog/item`;
};
