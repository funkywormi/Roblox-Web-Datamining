/**
 * Used to normalize the output of the `getKeyword` helper function. If the
 * keyword is an array, that means the user manually altered the URL. In that
 * case we opt to use the first keyword and act as if they didn't add those
 * additional keywords
 */
export const normalizeKeyword = (keyword: string | string[] | null | undefined): string => {
  if (Array.isArray(keyword)) {
    return keyword[0] ?? "";
  }
  return keyword ?? "";
};
