import { parseQueryString } from "@rbx/core-scripts/util/url";

const searchConstants = {
  searchQueryParamName: "keyword",
};

const getKeyword = () => {
  const { searchQueryParamName } = searchConstants;
  const currentUrl = window.location.search;
  const queries = parseQueryString(currentUrl.toLowerCase());
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return queries ? queries[searchQueryParamName] : null;
};

export default { getKeyword };
