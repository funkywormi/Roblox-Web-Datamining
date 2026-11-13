/**
 * Short language prefixes used in site URLs, matching `urlLanguagePrefixes` in
 * `@rbx/www-common/locale`. English has no prefix.
 */
const URL_LANGUAGE_PREFIXES: ReadonlySet<string> = new Set([
  "ar",
  "de",
  "es",
  "fr",
  "hi",
  "id",
  "it",
  "ja",
  "ko",
  "nl",
  "pl",
  "pt",
  "th",
  "tr",
  "vi",
]);

/** `/support` stays `/login`. `/fr/support` goes to `/fr/login`. */
export const supportLoginPath = (pathname: string): string => {
  const [first] = pathname.split("/").filter(Boolean);
  if (first !== undefined && URL_LANGUAGE_PREFIXES.has(first)) {
    return `/${first}/login`;
  }
  return "/login";
};
