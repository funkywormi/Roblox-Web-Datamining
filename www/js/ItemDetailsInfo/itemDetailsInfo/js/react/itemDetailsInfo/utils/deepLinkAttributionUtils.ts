const DEEP_LINK_VALUE_PARAM = 'deep_link_value';

/**
 * Returns the id of the deep link that brought the user to this page, or null if they did not
 * arrive through one. The link type is not present in the URL, so every deep link id is passed
 * along and marketplace-sales-api decides which ones are attributable.
 */
export default function getDeepLinkId(): string | null {
  return new URLSearchParams(window.location.search).get(DEEP_LINK_VALUE_PARAM) || null;
}
