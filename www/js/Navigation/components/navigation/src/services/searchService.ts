import * as http from "@rbx/core-scripts/http";
import searchConstants from "../constants/searchConstants";

let cancelToken = http.createCancelToken();

export enum GamesAutocompleteSuggestionEntryType {
  GameSuggestion = 0,
  QuerySuggestion = 1,
  TrendingQuerySuggestion = 2,
}

export type TGamesAutocompleteSuggestionEntry = {
  type: GamesAutocompleteSuggestionEntryType;
  score: number;
  universeId: number;
  canonicalTitle: string;
  thumbnailUrl: string;
  searchQuery: string;
  trendingSearchStartDateTime: string;
};

export type TGamesAutocompleteSuggestion = {
  prefix: string;
  algorithmName: string;
  entries: TGamesAutocompleteSuggestionEntry[];
};

export const getSearchSuggestion = async (
  search: string,
): Promise<TGamesAutocompleteSuggestion> => {
  // Cancels any previous requests that are stil dangling
  cancelToken.cancel();
  cancelToken = http.createCancelToken();

  const { data } = await http.get<TGamesAutocompleteSuggestion>({
    ...searchConstants.getSuggestionUrl,
    url: searchConstants.getSuggestionUrl.url + encodeURIComponent(search.toLowerCase()),
    cancelToken: cancelToken.token,
  });

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

export type TAvatarAutocompleteSuggestion = {
  Args: { Prefix: string; Limit: number; Algo: string | null };
  Data: TAvatarAutocompleteSuggestionEntry[];
};

export type TAvatarAutocompleteSuggestionEntry = {
  Query: string;
  Score: number;
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
    const { data } = await http.get<TAvatarAutocompleteSuggestion>(
      {
        ...searchConstants.avatarRequestSuggestionUrl,
        timeout: searchConstants.expiryTimeout,
        cancelToken: cancelToken.token,
        fullError: true,
      },
      params,
    );

    return data;
  }

  const { data } = await http.get<TAvatarAutocompleteSuggestion>(
    {
      ...searchConstants.avatarRequestSuggestionCdnUrl,
      timeout: searchConstants.expiryTimeout,
      cancelToken: cancelToken.token,
      fullError: true,
    },
    params,
  );

  return data;
};
