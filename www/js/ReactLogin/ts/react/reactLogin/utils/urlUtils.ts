import { urlService } from 'core-utilities';
import { Endpoints } from 'Roblox';

export const enum env {
  Production = 'production',
  Sitetest1 = 'sitetest1',
  Sitetest2 = 'sitetest2',
  Sitetest3 = 'sitetest3'
}

/**
 * Examines the hostname to return the current environment.
 * @returns the current environment.
 */
export const getEnvironment = (): env => {
  const { hostname } = window.location;

  if (hostname.includes(env.Sitetest3)) {
    return env.Sitetest3;
  }
  if (hostname.includes(env.Sitetest2)) {
    return env.Sitetest2;
  }
  if (hostname.includes(env.Sitetest1)) {
    return env.Sitetest1;
  }

  return env.Production;
};

/**
 * Get explicitly allowed return Urls based on the current environment.
 * @returns the allowed return Urls.
 */
export const getAllowedReturnUrls = (): string[] => {
  const environment = getEnvironment();
  switch (environment) {
    case env.Sitetest3:
    case env.Sitetest2:
    case env.Sitetest1:
      return [
        `https://apis.${environment}.robloxlabs.com/application-authorization/v1/authorize`,
        `https://authorize.${environment}.robloxlabs.com`,
        `https://www.${environment}.robloxlabs.com`
      ];
    case env.Production:
    default:
      return [
        `https://apis.roblox.com/oauth/v1/authorize`,
        `https://authorize.roblox.com`,
        `https://www.roblox.com`
      ];
  }
};

/**
 * Get explicitly allowed login redirect return Urls.
 * @returns the allowed login redirect return Urls.
 */
export const getAllowedLoginRedirectReturnUrls = (): string[] => {
  return ['/upgrades/robux', '/upgrades/paymentmethods'];
};

/**
 * Get explicitly allowed return domains based for the current environment.
 * @returns the allowed return domains.
 */
const getAllowedDomains = (): string[] => {
  const environment = getEnvironment();
  switch (environment) {
    case env.Sitetest3:
    case env.Sitetest2:
    case env.Sitetest1:
      return [`robloxlabs.com`];
    case env.Production:
    default:
      return [`roblox.com`];
  }
};
export const invalidPaths = [
  // Angular XSS
  '{{',
  // Invalid paths
  '/getauthticket',
  '/placelauncher.ashx'
];
export const allowedSchemes = ['http:', 'https:'];
// eslint-disable-next-line no-script-url
export const invalidSchemes = ['#', '?', '//', '.', 'mailto:', 'javascript:', 'rbxmobile:'];
export const blockedSubdomains = ['survey.roblox.com'];
export const defaultPath = '/';

/**
 * Gets the root domain from a hostname.
 * Example: blah.roblox.com -> roblox.com
 * Example: www.roblox.com -> roblox.com
 * @param hostname the hostname.
 * @returns the root domain of the hostname.
 */
const getRootDomainFromHostname = (hostname: string): string => {
  return hostname.split('.').slice(-2).join('.');
};

/**
 * Ensures the returnUrl matches a set of criteria for security purposes.
 * @param returnUrl .
 */
const sanitizeUrl = (returnUrl: string): string => {
  switch (Endpoints.isAbsolute(returnUrl)) {
    case true: {
      const { hostname, protocol } = new URL(returnUrl);

      // Must be from the same root domain to prevent redirecting off-site
      if (
        getRootDomainFromHostname(window.location.hostname) !== getRootDomainFromHostname(hostname)
      ) {
        return defaultPath;
      }

      // Must be from an approved domain, and not an explicitly blocked subdomain
      const allowedDomains = getAllowedDomains();
      if (
        !allowedDomains.some(domain => domain === getRootDomainFromHostname(hostname)) ||
        blockedSubdomains.some(subdomain => hostname.includes(subdomain))
      ) {
        return defaultPath;
      }

      // Must be from an approved scheme
      if (!allowedSchemes.some(scheme => protocol === scheme)) {
        return defaultPath;
      }
      break;
    }
    case false:
    default: {
      // Block encoded relative return URLs
      if (returnUrl !== decodeURIComponent(returnUrl)) {
        return defaultPath;
      }
      break;
    }
  }
  return returnUrl;
};

export const matchesWithAllowedUrl = (returnUrl: string, allowedUrl: string): boolean => {
  try {
    const parsedAllowUrl = new URL(allowedUrl);
    const parsedReturnUrl = new URL(returnUrl);

    return (
      parsedAllowUrl.hostname === parsedReturnUrl.hostname &&
      parsedAllowUrl.protocol === parsedReturnUrl.protocol &&
      (parsedAllowUrl.pathname === parsedReturnUrl.pathname || parsedReturnUrl.pathname === '/')
    );
    // URL parsing can fail for relative paths, invalid URLs, etc.
  } catch (e) {
    return false;
  }
};

/**
 * Performs a set of validations on returnUrl in the query string and returns
 * a safe returnUrl for redirection.
 * @returns a safe URL to return the user to.
 */
export const getSafeReturnUrlFromQueryString = (): string => {
  const queryString = urlService.parseQueryString() || {};
  const returnUrlKey = Object.keys(queryString).find(key => key.toLowerCase() === 'returnurl');
  const returnUrl = returnUrlKey ? String(queryString[`${returnUrlKey}`] ?? '') : '';
  if (
    !returnUrl ||
    returnUrl.trim() === '' ||
    invalidSchemes.some(scheme => returnUrl.startsWith(scheme)) ||
    invalidPaths.some(path => returnUrl.includes(path))
  ) {
    return defaultPath;
  }

  // Automatically allow if returnUrl is on the explicit allow list
  const allowedReturnUrls = getAllowedReturnUrls();
  if (allowedReturnUrls.some(allowedUrl => matchesWithAllowedUrl(returnUrl, allowedUrl))) {
    return returnUrl;
  }

  try {
    return Endpoints.getAbsoluteUrl(sanitizeUrl(returnUrl));
  } catch (e) {
    // Play it safe and redirect to default path if we can't parse the URL
    return defaultPath;
  }
};

export const getSafeLoginRedirectReturnUrl = (): string => {
  const returnUrl = getSafeReturnUrlFromQueryString();
  const allowedLoginRedirectReturnUrls = getAllowedLoginRedirectReturnUrls();
  if (
    allowedLoginRedirectReturnUrls.some(
      allowedUrl => Endpoints.getAbsoluteUrl(allowedUrl) === returnUrl
    )
  ) {
    return returnUrl;
  }

  return defaultPath;
};
