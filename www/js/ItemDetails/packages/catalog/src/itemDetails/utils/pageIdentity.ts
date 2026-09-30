// The host derives its own identity from the URL rather than from server-rendered markup, so the page
// type cannot be forced by stubbing data.
export const getIsBundle = (href: string = window.location.href): boolean =>
  href.includes("bundles");

export const getTargetId = (
  isBundle: boolean,
  pathname: string = window.location.pathname,
): string => {
  const parts = isBundle
    ? /\/bundles\/([^/]+)/.exec(pathname)
    : /\/catalog\/([^/]+)/.exec(pathname);
  return parts !== null && parts[1] !== null ? (parts[1] ?? "") : "";
};

export const getItemType = (isBundle: boolean): string => (isBundle ? "Bundle" : "Asset");
