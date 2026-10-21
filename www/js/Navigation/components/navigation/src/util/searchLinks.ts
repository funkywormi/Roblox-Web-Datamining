import links, { UniversalSearchLink } from "../constants/linkConstants";
import { getNavCapability } from "./navCapabilities";

const { newUniversalSearchUrls, avatarSearchLink, topSearchLink } = links;

export const isInMobileSize = () => window.innerWidth < 601; // breakpoint for mobile size

export const getNewUniversalSearchLinks = (): UniversalSearchLink[] => {
  const urls: UniversalSearchLink[] = getNavCapability("isTopSearchResultsEnabled")?.()
    ? [topSearchLink, ...newUniversalSearchUrls]
    : [...newUniversalSearchUrls];
  const relevantUrls = urls.filter(({ pageSort }) =>
    pageSort.some(keyword => window.location.pathname.includes(keyword)),
  );
  const unRelevantUrls = urls.filter(({ pageSort }) =>
    pageSort.every(keyword => !window.location.pathname.includes(keyword)),
  );
  return [...relevantUrls, ...unRelevantUrls];
};

export const getAvatarAutocompleteSearchLinks = () =>
  avatarSearchLink.pageSort.some(keyword => window.location.pathname.includes(keyword));
