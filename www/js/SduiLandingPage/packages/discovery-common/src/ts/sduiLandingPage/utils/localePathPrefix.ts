/** `es` / `ko-kr`, then `/` or end of path (`/es`, `/es/…`). */
export const LOCALE_PREFIX_SOURCE = "[a-z]{2}(?:-[a-z]{2})?(?:/|$)";

/** Prefix `url` with the locale from `currentPathname` (`/es` → `/es/CreateAccount`). */
export const withLocalePrefix = (url: string, currentPathname: string | undefined): string => {
  const localeMatch = currentPathname?.match(`^/(${LOCALE_PREFIX_SOURCE})`);
  if (!localeMatch) {
    return url;
  }

  const locale = localeMatch[1]?.split("/")[0];
  if (!locale) {
    return url;
  }

  const localePrefix = `/${locale}`;
  if (url === localePrefix || url.startsWith(`${localePrefix}/`)) {
    return url;
  }

  return `${localePrefix}${url}`;
};
