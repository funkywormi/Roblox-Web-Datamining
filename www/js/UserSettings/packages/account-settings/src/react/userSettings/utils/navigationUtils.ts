import RouterPath from "../../../enums/RouterPath";

export const redirectQueryParam = {
  creatorCollaboration: "creatorCollaboration",
  ageVerification: "ageVerification",
  idVerification: "idVerification",
  addParent: "addParent",
};

export const getRouterRelativePath = (routerPath: RouterPath): string =>
  `/my/account#!/${routerPath}`;

/** Current account-settings URL including the hash route (e.g. `/my/account#!/browser-preferences`). */
export const getAccountSettingsReturnUrl = (): string =>
  window.location.pathname + window.location.hash;

export const isAtTargetPath = (targetPath: string): boolean => {
  const currentPath = window.location.hash.replace(/^#!?/, "").split("?")[0] ?? "";
  const currentPathNoTrailingSlash = currentPath.replace(/\/$/, "");
  return currentPathNoTrailingSlash.startsWith(targetPath);
};

export const getQueryParamsFromUrl = (url: string): URLSearchParams => {
  // Support query params both before and after the hash fragment.
  // Example: https://www.roblox.com/my/account?changePassword#!/info
  const parsed = new URL(url, window.location.origin);

  // Start with the main query string
  const params = new URLSearchParams(parsed.search);

  // Merge any query string that appears after the hash
  const hash = parsed.hash.startsWith("#") ? parsed.hash.slice(1) : parsed.hash;
  const qIndex = hash.indexOf("?");
  if (qIndex !== -1) {
    const hashParams = new URLSearchParams(hash.slice(qIndex + 1));
    hashParams.forEach((value, key) => {
      if (!params.has(key)) {
        params.append(key, value);
      }
    });
  }

  return params;
};

// Map of redirect params to their target paths
// When user is already at target, we don't need to wait for redirection checks
const redirectTargetPaths: Record<string, string> = {
  [redirectQueryParam.creatorCollaboration]: "/privacy/Communication/StudioCollaboration",
  [redirectQueryParam.addParent]: `/${RouterPath.ParentalControls}`,
};

export const shouldWaitForRedirectionChecks = (): boolean => {
  const searchParams = getQueryParamsFromUrl(window.location.href);
  const activeRedirectParams = Object.values(redirectQueryParam).filter(value =>
    searchParams.has(value),
  );

  if (activeRedirectParams.length === 0) {
    return false;
  }

  // If user is already at the target path for all active redirect params, no need to wait
  const alreadyAtAllTargets = activeRedirectParams.every(param => {
    const targetPath = redirectTargetPaths[param];
    return targetPath && isAtTargetPath(targetPath);
  });

  return !alreadyAtAllTargets;
};

export const getHashPathFromUrl = (url: string): string => {
  const parsed = new URL(url, window.location.origin);
  const rawHash = parsed.hash.startsWith("#") ? parsed.hash.slice(1) : parsed.hash;
  const withoutBang = rawHash.startsWith("!") ? rawHash.slice(1) : rawHash;
  const qIndex = withoutBang.indexOf("?");
  return qIndex === -1 ? withoutBang : withoutBang.slice(0, qIndex);
};

export const isAtRouterPath = (routerPath: string): boolean => {
  const currentPath = getHashPathFromUrl(window.location.href);
  return currentPath.startsWith(routerPath);
};

/**
 * Removes a query param from both the regular query string and the hash fragment query string.
 * Handles URLs like:
 * - https://example.com/path?param=value#!/hash
 * - https://example.com/path#!/hash?param=value
 */
export const removeQueryParamFromUrl = (paramName: string): void => {
  const url = new URL(window.location.href);

  // Remove from regular query string
  url.searchParams.delete(paramName);

  // Remove from hash fragment query string (e.g., #!/path?param=value)
  const hashIndex = url.hash.indexOf("?");
  if (hashIndex !== -1) {
    const hashPath = url.hash.slice(0, hashIndex);
    const hashParams = new URLSearchParams(url.hash.slice(hashIndex + 1));
    hashParams.delete(paramName);
    const newHashQuery = hashParams.toString();
    url.hash = newHashQuery ? `${hashPath}?${newHashQuery}` : hashPath;
  }

  window.history.replaceState(null, "", url.toString());
};
