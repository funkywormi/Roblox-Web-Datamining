/**
 * Maps user locale to localized login/landing background CSS class suffix. See also: login.scss and landing.scss
 * @param localeCode - User locale string (e.g., 'id_id', 'de_de')
 * @returns Localized suffix or null if no mapping exists
 */
const getLocalizedBackgroundSuffix = (localeCode: string): string | null => {
  // Convert locale code to lowercase for consistent matching
  const locale = localeCode.toLowerCase();

  switch (locale) {
    case 'en_us':
      return 'us';
    case 'de_de':
      return 'de';
    case 'id_id':
      return 'id';
    case 'ja_jp':
      return 'jp';
    default:
      return null;
  }
};

export default getLocalizedBackgroundSuffix;
