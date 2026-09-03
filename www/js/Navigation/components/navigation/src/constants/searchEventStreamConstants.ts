import { uuidService } from "@rbx/core-scripts/legacy/core-utilities";
import { eventTypes } from "@rbx/core-scripts/event-stream";
import { ValueOf } from "@rbx/core-types";
import { DefaultSearchType, SearchType } from "../util/searchUtil";

const searchAutocompleteContext = "searchAutocomplete";
const searchLandingPageContext = "searchLandingPage";
const actionTypes = { open: "open", submit: "submit", close: "close", cancel: "cancel" } as const;
const { generateRandomUuid: generateSessionInfo } = uuidService;

const contexts = {
  searchAutocomplete: searchAutocompleteContext,
  searchLandingPage: searchLandingPageContext,
} as const;

export default {
  contexts,
  actionTypes,
  generateSessionInfo,
  searchTextTrim: (kwd: string, resultingKwd: string, searchType?: string, sessionInfo?: string) =>
    [
      {
        name: "searchTextTrim",
        type: eventTypes.formInteraction,
        context: searchAutocompleteContext,
      },
      {
        kwd,
        resultingKwd,
        searchType,
        sessionInfo,
      },
    ] as const,
  searchClear: (kwd: string, searchType?: string, sessionInfo?: string, page?: string) =>
    [
      {
        name: "searchClear",
        type: eventTypes.formInteraction,
        context: searchAutocompleteContext,
      },
      {
        kwd,
        searchType,
        sessionInfo,
        page,
      },
    ] as const,
  searchSuggestionClicked: (
    kwd: string,
    searchType?: string,
    suggestionPosition?: number,
    suggestionClicked?: string,
    suggestionType?: SearchType | DefaultSearchType,
    suggestions?: string,
    sessionInfo?: string,
  ) =>
    [
      {
        name: "searchSuggestionClicked",
        type: eventTypes.formInteraction,
        context: searchAutocompleteContext,
      },
      {
        kwd,
        searchType,
        suggestionPosition,
        suggestionClicked,
        suggestionType,
        suggestions,
        sessionInfo,
      },
    ] as const,
  searchAutocomplete: (
    kwd: string,
    previousKwd: string | undefined,
    fromLocalCache: boolean,
    suggestions: string,
    algorithm: string | null,
    latency: number,
    timeoutDelayMs: number,
    sessionInfo?: string,
    page?: string,
    isPersonalizedBasedOnPreviousQuery?: boolean,
  ) =>
    [
      {
        name: "searchAutocomplete",
        type: eventTypes.formInteraction,
        context: searchAutocompleteContext,
      },
      {
        kwd,
        previousKwd,
        fromLocalCache,
        suggestions,
        algorithm,
        latency,
        timeoutDelayMs,
        sessionInfo,
        page,
        isPersonalizedBasedOnPreviousQuery,
      },
    ] as const,
  search: (
    kwd: string | null | undefined,
    context: ValueOf<typeof contexts>,
    actionType: ValueOf<typeof actionTypes>,
    autocompleteSessionInfo?: string,
    searchLandingPageSessionInfo?: string,
  ) =>
    [
      {
        name: "search",
        type: eventTypes.formInteraction,
        context,
      },
      {
        kwd,
        actionType,
        sessionInfo: autocompleteSessionInfo,
        searchLandingPageSessionInfo,
      },
    ] as const,
  catalogSearch: (autocompleteFlag: number, previousPage: string) =>
    [
      {
        name: "catalogSearch",
        type: eventTypes.formInteraction,
        context: searchAutocompleteContext,
      },
      {
        autocompleteFlag,
        previousPage,
      },
    ] as const,
} as const;
