export const magicLinkTokenQueryParam = 'magicLinkToken';

export const getMagicLinkTokenFromQueryString = (): string | null =>
  new URLSearchParams(window.location.search).get(magicLinkTokenQueryParam);
