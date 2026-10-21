export enum GamesAutocompleteSuggestionEntryType {
  GameSuggestion = 0,
  QuerySuggestion = 1,
  TrendingQuerySuggestion = 2,
}

export type TGamesAutocompleteSuggestionEntry = {
  type: GamesAutocompleteSuggestionEntryType;
  score: number;
  universeId: number;
  canonicalTitle: string | null;
  thumbnailUrl: string | null;
  searchQuery: string;
  trendingSearchStartDateTime: string | null;
};

export type TGamesAutocompleteSuggestion = {
  prefix: string;
  algorithmName: string;
  entries: TGamesAutocompleteSuggestionEntry[];
};

export type TAvatarAutocompleteSuggestion = {
  Args: { Prefix: string; Limit: number; Algo: string | null };
  Data: TAvatarAutocompleteSuggestionEntry[];
};

export type TAvatarAutocompleteSuggestionEntry = {
  Query: string;
  Score: number;
};
