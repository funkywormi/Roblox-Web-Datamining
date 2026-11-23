import { window } from "@rbx/core-lib/browser";

export type HashRoute = {
  categoryName: string;
  subcategoryName?: string;
};

const HASH_PREFIX = "#!";

export const makeUrlFriendly = (str: string): string => str.split(" ").join("-").toLowerCase();

const decodeSegment = (segment: string): string => {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
};

export const parseHashRoute = (hash: string): HashRoute | null => {
  if (!hash.startsWith(`${HASH_PREFIX}/`)) {
    return null;
  }
  const path = hash.slice(HASH_PREFIX.length + 1).split(/[?#]/)[0] ?? "";
  const segments = path.split("/");
  if (segments.length > 2 || !segments[0]) {
    return null;
  }
  const [categoryName, subcategoryName] = segments.map(decodeSegment);
  if (categoryName === undefined) {
    return null;
  }
  return subcategoryName ? { categoryName, subcategoryName } : { categoryName };
};

export const buildHashRoute = ({ categoryName, subcategoryName }: HashRoute): string =>
  subcategoryName === undefined
    ? `${HASH_PREFIX}/${encodeURIComponent(categoryName)}`
    : `${HASH_PREFIX}/${encodeURIComponent(categoryName)}/${encodeURIComponent(subcategoryName)}`;

export const navigateToHashRoute = (route: HashRoute): void => {
  if (window) {
    window.location.hash = buildHashRoute(route).slice(1);
  }
};

export const getHashbangRewrite = (href: string): string | null =>
  href.includes("#") && !href.includes(HASH_PREFIX) ? href.replace("#", HASH_PREFIX) : null;
