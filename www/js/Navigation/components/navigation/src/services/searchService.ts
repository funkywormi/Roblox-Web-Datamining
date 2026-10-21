import * as http from "@rbx/core-scripts/http";
import searchConstants from "../constants/searchConstants";
import { withApiMetrics } from "../topNav/observability";
import type { TAvatarAutocompleteSuggestion, TGamesAutocompleteSuggestion } from "./searchTypes";

export { GamesAutocompleteSuggestionEntryType } from "./searchTypes";
export type {
  TAvatarAutocompleteSuggestion,
  TAvatarAutocompleteSuggestionEntry,
  TGamesAutocompleteSuggestion,
  TGamesAutocompleteSuggestionEntry,
} from "./searchTypes";

let cancelToken = http.createCancelToken();

export const getSearchSuggestion = async (
  search: string,
): Promise<TGamesAutocompleteSuggestion> => {
  // Cancels any previous requests that are stil dangling
  cancelToken.cancel();
  cancelToken = http.createCancelToken();

  const { data } = await withApiMetrics("GamesAutocomplete", () =>
    http.get<TGamesAutocompleteSuggestion>({
      ...searchConstants.getSuggestionUrl,
      url: searchConstants.getSuggestionUrl.url + encodeURIComponent(search.toLowerCase()),
      cancelToken: cancelToken.token,
    }),
  );

  return data;
};

export const postRequestSuggestion = async (
  search: string,
): Promise<TGamesAutocompleteSuggestion> => {
  const params = {
    prefix: search.toLowerCase(),
    variationId: searchConstants.variationId,
    trendingSearchId: searchConstants.trendingVariationId,
  };

  // Cancels any previous requests that are stil dangling
  cancelToken.cancel();
  cancelToken = http.createCancelToken();

  const { data } = await http.post<TGamesAutocompleteSuggestion>(
    {
      ...searchConstants.requestSuggestionUrl,
      timeout: searchConstants.expiryTimeout,
      cancelToken: cancelToken.token,
      fullError: true,
    },
    params,
  );

  return data;
};

export const getAvatarRequestSuggestion = async (
  search: string,
  languageCode: string,
  limit: number,
  previousQuery: string,
  useFallback = false,
): Promise<TAvatarAutocompleteSuggestion> => {
  let lang = languageCode;
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/no-unnecessary-condition
  if (lang === null) {
    lang = searchConstants.englishLanguageCode;
  }
  const params = {
    prefix: search.toLowerCase(),
    limit,
    lang,
    q: previousQuery,
  };

  // Cancels any previous requests that are stil dangling
  cancelToken.cancel();
  cancelToken = http.createCancelToken();

  if (useFallback) {
    const { data } = await withApiMetrics("AvatarAutocomplete", () =>
      http.get<TAvatarAutocompleteSuggestion>(
        {
          ...searchConstants.avatarRequestSuggestionUrl,
          timeout: searchConstants.expiryTimeout,
          cancelToken: cancelToken.token,
          fullError: true,
        },
        params,
      ),
    );

    return data;
  }

  const { data } = await withApiMetrics("AvatarAutocomplete", () =>
    http.get<TAvatarAutocompleteSuggestion>(
      {
        ...searchConstants.avatarRequestSuggestionCdnUrl,
        timeout: searchConstants.expiryTimeout,
        cancelToken: cancelToken.token,
        fullError: true,
      },
      params,
    ),
  );

  return data;
};
