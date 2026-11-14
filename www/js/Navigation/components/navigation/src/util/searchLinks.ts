import { window } from "@rbx/core-lib/browser";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import links, { UniversalSearchLink } from "../constants/linkConstants";
import { getNavCapability } from "./navCapabilities";

const { newUniversalSearchUrls, avatarSearchLink, topSearchLink, playersSearchLink } = links;

const currentPathname = () => window?.location.pathname ?? "";

export const isInMobileSize = () => (window?.innerWidth ?? 0) < 601; // breakpoint for mobile size

export const forViewer = (
  urls: UniversalSearchLink[],
  isAuthenticated: boolean = authenticatedUser() != null,
): UniversalSearchLink[] =>
  isAuthenticated ? urls : urls.filter(url => url !== playersSearchLink);

export const getNewUniversalSearchLinks = (
  pathname: string = currentPathname(),
  isAuthenticated: boolean = authenticatedUser() != null,
  isTopSearchResultsEnabled: boolean = getNavCapability("isTopSearchResultsEnabled")?.() ?? false,
): UniversalSearchLink[] => {
  const urls: UniversalSearchLink[] = forViewer(
    isTopSearchResultsEnabled
      ? [topSearchLink, ...newUniversalSearchUrls]
      : [...newUniversalSearchUrls],
    isAuthenticated,
  );
  const relevantUrls = urls.filter(({ pageSort }) =>
    pageSort.some(keyword => pathname.includes(keyword)),
  );
  const unRelevantUrls = urls.filter(({ pageSort }) =>
    pageSort.every(keyword => !pathname.includes(keyword)),
  );
  return [...relevantUrls, ...unRelevantUrls];
};

export const getAvatarAutocompleteSearchLinks = (pathname: string = currentPathname()) =>
  avatarSearchLink.pageSort.some(keyword => pathname.includes(keyword));
