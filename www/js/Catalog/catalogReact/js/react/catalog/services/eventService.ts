import { EventStream } from 'Roblox';
import { pageName } from 'core-utilities';
import catalogConstants from '../constants/catalogConstants';

export class EventServiceDefault {
  static sendSearchAutocompleteEvent(
    algorithm: null,
    suggestions: string[],
    kwd: string,
    previouskwd: string,
    locale: string,
    latency: number,
    suggestionLimit: number | undefined,
    isPersonalizedBasedOnPreviousQuery: boolean
  ): void {
    if (EventStream) {
      EventStream.SendEventWithTarget(
        catalogConstants.autocompleteSuggestionEventData.searchAutocompleteEvent,
        catalogConstants.autocompleteSuggestionEventData.searchType,
        {
          algorithm,
          maxResults: suggestionLimit,
          timeoutDelay:
            catalogConstants.autocompleteSuggestionEventData
              .autocompleteSuggestionEventTimeoutDelay,
          suggestions,
          kwd,
          previouskwd,
          page: pageName.PageNameProvider.getInternalPageName(),
          searchBox: catalogConstants.autocompleteSuggestionEventData.searchBox,
          locale,
          searchType: catalogConstants.autocompleteSuggestionEventData.searchType,
          latency,
          suggestionSource: catalogConstants.autocompleteSuggestionEventData.suggestionSource,
          isPersonalizedBasedOnPreviousQuery
        },
        EventStream.TargetTypes.WWW
      );
    }
  }

  static sendSearchTextTrimEvent(kwd: string | null | undefined, resultingkwd: string): void {
    if (EventStream) {
      EventStream.SendEventWithTarget(
        catalogConstants.autocompleteSuggestionEventData.searchTextTrimEvent,
        catalogConstants.autocompleteSuggestionEventData.searchType,
        {
          kwd,
          resultingkwd,
          searchType: catalogConstants.autocompleteSuggestionEventData.searchType
        },
        EventStream.TargetTypes.WWW
      );
    }
  }

  static sendCatalogSearchEvent(autoCompleteFlag: number): void {
    if (EventStream) {
      EventStream.SendEventWithTarget(
        catalogConstants.autocompleteSuggestionEventData.catalogSearchEvent,
        catalogConstants.autocompleteSuggestionEventData.searchType,
        {
          autoCompleteFlag,
          previousPage: pageName.PageNameProvider.getInternalPageName()
        },
        EventStream.TargetTypes.WWW
      );
    }
  }

  static sendSearchClearEvent(kwd: string): void {
    if (EventStream) {
      EventStream.SendEventWithTarget(
        catalogConstants.autocompleteSuggestionEventData.searchClearEvent,
        catalogConstants.autocompleteSuggestionEventData.searchType,
        {
          kwd,
          searchType: catalogConstants.autocompleteSuggestionEventData.searchType,
          page: pageName.PageNameProvider.getInternalPageName()
        },
        EventStream.TargetTypes.WWW
      );
    }
  }

  static sendSearchSuggestionClickedEvent(
    kwd: string,
    suggestionPosition: number,
    suggestionClicked: string,
    suggestions: string[]
  ): void {
    if (EventStream) {
      EventStream.SendEventWithTarget(
        catalogConstants.autocompleteSuggestionEventData.searchSuggestionClickedEvent,
        catalogConstants.autocompleteSuggestionEventData.searchType,
        {
          kwd,
          searchType: catalogConstants.autocompleteSuggestionEventData.searchType,
          suggestionPosition,
          suggestionClicked,
          suggestions,
          maxResults: 0
        },
        EventStream.TargetTypes.WWW
      );
    }
  }

  static sendTopicSelectedEvent(
    topic: string,
    rank: number,
    categoryName: string | undefined,
    subcategoryName: string | undefined,
    query: string | null | undefined,
    allTopics: string,
    previousSelectedTopics: string
  ): void {
    if (EventStream) {
      EventStream.SendEventWithTarget(
        catalogConstants.topicEventData.topicSelectEventName,
        catalogConstants.topicEventData.topicEventContext,
        {
          topic,
          rank: rank + 1,
          categoryName,
          subcategoryName,
          query,
          allTopics,
          previousSelectedTopics
        },
        EventStream.TargetTypes.WWW
      );
    }
  }

  static sendTopicDeselectedEvent(
    topic: string,
    rank: number,
    categoryName: string | undefined,
    subcategoryName: string | undefined,
    query: string | null | undefined,
    allTopics: string
  ): void {
    if (EventStream) {
      EventStream.SendEventWithTarget(
        catalogConstants.topicEventData.topicDeselectEventName,
        catalogConstants.topicEventData.topicEventContext,
        {
          topic,
          rank: rank + 1,
          categoryName,
          subcategoryName,
          query,
          allTopics
        },
        EventStream.TargetTypes.WWW
      );
    }
  }

  static sendTopicClearedEvent(
    categoryName: string | undefined,
    subcategoryName: string | undefined,
    query: string | null | undefined,
    allTopics: string
  ): void {
    if (EventStream) {
      EventStream.SendEventWithTarget(
        catalogConstants.topicEventData.topicClearEventName,
        catalogConstants.topicEventData.topicEventContext,
        {
          categoryName,
          subcategoryName,
          query,
          allTopics
        },
        EventStream.TargetTypes.WWW
      );
    }
  }
}

/**
 * An interface encapsulating the events fired by this web app.
 *
 * This interface type offers future flexibility e.g. for mocking the default
 * event service.
 */
export type EventService = {
  [K in keyof EventServiceDefault]: EventServiceDefault[K];
};
