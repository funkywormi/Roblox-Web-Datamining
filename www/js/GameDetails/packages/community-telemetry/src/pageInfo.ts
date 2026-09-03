import { EnvironmentUrls } from "@rbx/core-scripts/legacy/Roblox";

export const CUSTOM_MAPPER: Record<string, (pageRoute: string) => string> = {
  forums: pageRoute => {
    if (/^\/forums\/[^/]+\/post\//.test(pageRoute)) {
      return "/forums/post";
    }
    if (/^\/forums\/[^/]+/.test(pageRoute)) {
      return "/forums/category";
    }
    return "/forums";
  },
};

const DEFAULT_HASH_ROUTE = "/about";

/**
 * Hash routes permitted by the group ui-router config (see js/angular/groupDetails/groupModule.js).
 * Order: longest forum paths first so shorter patterns do not steal matches.
 */
const PERMITTED_GROUP_HASH_ROUTE = new RegExp(
  "^" +
    "(?:" +
    "/forums/[^/]+/post/[^/]+/comment/[^/]+" +
    "|/forums/[^/]+/post/[^/]+/edit" +
    "|/forums/[^/]+/post/create" +
    "|/forums/[^/]+/post/[^/]+" +
    "|/forums/[^/]+" +
    "|/forums" +
    "|/(?:about|store|affiliates|events)" +
    ")$",
);

function hashFragmentContainsUrl(fragment: string): boolean {
  if (fragment.includes("://")) {
    return true;
  }
  try {
    return decodeURIComponent(fragment.replace(/\+/g, " ")).includes("://");
  } catch {
    return false;
  }
}

function normalizeHashPath(fragment: string): string {
  return fragment.startsWith("/") ? fragment : `/${fragment}`;
}

function isPermittedGroupHashPath(path: string): boolean {
  return PERMITTED_GROUP_HASH_ROUTE.test(path);
}

export const getSanitizedHash = (hash: string): string => {
  const fragment = hash.split("#!")[1];
  if (!fragment) {
    return DEFAULT_HASH_ROUTE;
  }
  if (hashFragmentContainsUrl(fragment)) {
    return DEFAULT_HASH_ROUTE;
  }
  const path = normalizeHashPath(fragment);
  if (!isPermittedGroupHashPath(path)) {
    return DEFAULT_HASH_ROUTE;
  }
  return path;
};

export const getLocationTab = (hash: string): string => {
  const pageRoute = getSanitizedHash(hash);
  const [, locationSegment = ""] = pageRoute.split("/");
  return locationSegment === "" ? "unknown" : locationSegment;
};

export const getPageRoute = (hash: string): string => {
  let pageRoute = getSanitizedHash(hash);
  const locationTab = getLocationTab(hash);

  if (CUSTOM_MAPPER[locationTab]) {
    pageRoute = CUSTOM_MAPPER[locationTab](pageRoute);
  }

  return pageRoute;
};

export const getGroupIdFromPathname = (pathname: string): number => {
  const groupIdMatch = /^\/(?:communities|groups)\/(\d+)/.exec(pathname);
  const capturedGroupId = groupIdMatch?.[1];
  return capturedGroupId ? parseInt(capturedGroupId, 10) : 0;
};

export const getCommonParams = (
  hash: string,
  pathname: string,
): { pageRoute: string; locationTab: string; groupId: number; isValid: boolean } => {
  const pageRoute = getPageRoute(hash);
  const locationTab = getLocationTab(hash);
  const groupId = getGroupIdFromPathname(pathname);

  return {
    pageRoute,
    locationTab,
    groupId,
    isValid: Boolean(groupId) && locationTab !== "unknown",
  };
};

export const getInternalPageName = (pathname: string): string => {
  if (pathname === "/communities/configure") {
    return "communities_configure";
  }
  if (pathname.startsWith("/communities/")) {
    return "community";
  }
  if (/^\/users\/\d+\/profile$/.test(pathname)) {
    return "users_profile";
  }
  if (pathname.startsWith("/users/")) {
    return "users";
  }
  if (pathname.startsWith("/transactions")) {
    return "transactions";
  }
  if (pathname.startsWith("/my/account")) {
    return "my_account";
  }
  if (pathname.startsWith("/upgrades/robux")) {
    return "upgrades_robux";
  }
  if (pathname.startsWith("/login")) {
    return "login";
  }
  if (pathname.startsWith("/home")) {
    return "home";
  }
  if (pathname.startsWith("/games")) {
    return "games";
  }
  if (pathname.startsWith("/catalog")) {
    return "catalog";
  }
  if (pathname.startsWith("/search/")) {
    return pathname.replace("/search/", "search_");
  }

  return pathname;
};

export const getSanitizedReferrer = (referrer: string): string => {
  if (!referrer) {
    return "direct";
  }

  try {
    const url = new URL(referrer);
    if (url.origin !== EnvironmentUrls.websiteUrl) {
      return referrer;
    }

    return getInternalPageName(url.pathname);
  } catch {
    return "invalid";
  }
};

export const getCommunitySessionEnterFrom = (): string => getSanitizedReferrer(document.referrer);
