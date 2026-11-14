import { withLocalePrefix } from "./localePathPrefix";

export const redirectToDataFetchErrorFallback = (
  url: string,
  replaceHistory: boolean | undefined,
  location: Pick<Location, "assign" | "replace"> = window.location,
): void => {
  const target = withLocalePrefix(url, window.location.pathname);

  if (replaceHistory) {
    location.replace(target);
    return;
  }

  location.assign(target);
};

export default redirectToDataFetchErrorFallback;
