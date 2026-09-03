import React, { useCallback, useEffect, useRef, useState } from 'react';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
import {
  Category,
  Creator,
  CurrencyType,
  Layout,
  Library,
  Topic,
  Subcategory,
  TopUp,
  AssetsCollection
} from '../../../constants/types';
import CatalogBreadcrumbs from '../../catalogBreadcrumbs/CatalogBreadcrumbs';
import { CatalogQuery } from '../../../hooks/catalogQuery/catalogQuery.types';
import { SearchOptionsData } from '../../../hooks/searchOptions/searchOptions.types';
import catalogConstants from '../../../constants/catalogConstants';
import { translationConfig } from '../../../translation.config';
import useOrderedItems from '../useOrderedItems';
import TopicsCarousel from './TopicsCarousel';
import TopUpBanner from './TopUpBanner';
import ItemResults from './ItemResults';
import {
  trackCatalogPaginationClick,
  TPaginationMode
} from '../../../../analytics/axTrackingEvents';

export type ItemsContainerProps = {
  searchOptions: SearchOptionsData;
  layout: Layout;
  topicBasedBrowsingEnabledForCategory?: boolean;
  topUp: TopUp;
  catalogQuery: CatalogQuery;
  isKeywordCensored: boolean;
  fetchNextPage: () => void;
  canLoadNextPage: boolean;
  searchResultDict: AssetsCollection | null;
  searchResultList: string[] | null;
  isPaginationEnabled: boolean;
  isInfiniteScrollDisabled: boolean;
  library: Library;
  topics: Topic[];
  getCategoryOption: (category?: Category) => Category | undefined;
  setSubcategory: (subcategory: Subcategory | null) => void;
  setCreator: (creator?: Creator | null) => void;
  setCurrencyType: (currencyType: CurrencyType | null | undefined) => void;
  clearKeyword: () => void;
  onTopUpClear: () => void;
  setSelectedTopics: (selectedTopics: Topic[]) => void;
  onClearFilters: (keepKeyword: boolean) => void;
  clearTopics: () => void;
  hideBreadcrumbs?: boolean;
  enableThumbnailPrice?: boolean;
  enableCatalogRevampExperiment?: boolean;
};

function ItemsContainer(props: ItemsContainerProps & WithTranslationsProps): JSX.Element {
  const {
    layout,
    topicBasedBrowsingEnabledForCategory,
    topUp,
    fetchNextPage,
    canLoadNextPage,
    searchResultDict,
    searchResultList,
    isPaginationEnabled,
    isInfiniteScrollDisabled,
    catalogQuery,
    isKeywordCensored,
    searchOptions,
    library,
    topics,
    getCategoryOption,
    setSubcategory,
    setCreator,
    setCurrencyType,
    clearKeyword,
    onTopUpClear,
    setSelectedTopics,
    onClearFilters,
    clearTopics,
    translate,
    hideBreadcrumbs,
    enableThumbnailPrice,
    enableCatalogRevampExperiment
  } = props;

  const { isSearchOptionsLoaded } = searchOptions;

  // Helper to check if infinite scroll is enabled
  const isInfiniteScrollEnabled = isPaginationEnabled && !isInfiniteScrollDisabled;

  // Helper to determine the number of items to display
  const getNumberItemToDisplay = useCallback(() => {
    if (
      catalogQuery.category &&
      catalogConstants.expandedCategoryList.includes(catalogQuery.category.category)
    ) {
      return catalogConstants.numberOfSearchItemsExpanded;
    }
    if (isPaginationEnabled) {
      return catalogConstants.numberOfSearchItemsExpanded;
    }
    if (library.isFullScreen) {
      return catalogConstants.numberOfSearchItemsForFullScreen;
    }
    return searchResultList === null ? 0 : searchResultList.length;
  }, [catalogQuery.category, isPaginationEnabled, library.isFullScreen, searchResultList]);

  const [numberOfItemsToDisplay, setNumberOfItemsToDisplay] = useState(0);
  useEffect(() => {
    setNumberOfItemsToDisplay(getNumberItemToDisplay());
  }, [getNumberItemToDisplay]);

  const isBreadcrumbsAvailable = library.initialized && !library.isPhone;

  const showReturnToTop =
    searchResultList !== null &&
    searchResultList.length > catalogConstants.numberOfSearchItemsExpanded;

  const returnToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { orderedItems, showShimmer } = useOrderedItems(
    layout,
    searchResultDict,
    searchResultList,
    isPaginationEnabled,
    numberOfItemsToDisplay
  );

  const loader = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const first = entries[0];
        if (first.isIntersecting) {
          trackCatalogPaginationClick(TPaginationMode.InfiniteScroll);
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    const currentLoader = loader.current;

    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [loader, fetchNextPage]);

  const isListEmpty = !orderedItems?.length;

  return (
    <div id='react-items-container' className='catalog-results'>
      {!isSearchOptionsLoaded && (
        <h2 className='featured-items-heading'>
          <span className='shimmer-lines'>
            <span className='placeholder shimmer-line' />
          </span>
        </h2>
      )}
      {!hideBreadcrumbs && isBreadcrumbsAvailable && (
        <div>
          <CatalogBreadcrumbs
            catalogQuery={catalogQuery}
            searchOptions={searchOptions}
            getCategoryOption={getCategoryOption}
            setSubcategory={setSubcategory}
            setCreator={setCreator}
            setCurrencyType={setCurrencyType}
            clearKeyword={clearKeyword}
            isKeywordCensored={isKeywordCensored}
          />
        </div>
      )}
      {!enableCatalogRevampExperiment && (
        <TopicsCarousel
          topicBasedBrowsingEnabledForCategory={topicBasedBrowsingEnabledForCategory}
          catalogQuery={catalogQuery}
          topics={topics}
          setSelectedTopics={setSelectedTopics}
          onClearFilters={onClearFilters}
          clearTopics={clearTopics}
        />
      )}
      {/* Top Up Feature */}
      <TopUpBanner topUp={topUp} onTopUpClear={onTopUpClear} catalogQuery={catalogQuery} />

      {/* Results */}
      <div id='results' className='results-container'>
        <ItemResults
          layout={layout}
          isPaginationEnabled={isPaginationEnabled}
          enableThumbnailPrice={enableThumbnailPrice}
          enableCatalogRevampExperiment={enableCatalogRevampExperiment}
          orderedItems={orderedItems}
          showShimmer={showShimmer}
          numberOfItemsToDisplay={numberOfItemsToDisplay}
        />
      </div>

      {/* Pagination and Infinite Scroll Spinner */}
      {isPaginationEnabled && (
        <React.Fragment>
          {isInfiniteScrollEnabled ? (
            <div ref={loader} style={{ height: '1px', backgroundColor: 'transparent' }} />
          ) : (
            !isListEmpty &&
            !layout.loading &&
            canLoadNextPage && (
              <div className='load-more-btn-container'>
                <button
                  type='button'
                  className='btn-primary-md'
                  onClick={() => {
                    trackCatalogPaginationClick(TPaginationMode.LoadMore);
                    fetchNextPage();
                  }}>
                  <span> {translate('Action.LoadMore')} </span>
                </button>
              </div>
            )
          )}
          {!isListEmpty && (
            <React.Fragment>
              {layout.loading && (
                <div className='spinner spinner-default spinner-infinite-scroll' />
              )}
              {/* Scroll to Top Button */}
              {!layout.loading && showReturnToTop && (
                <button
                  aria-label='Back to top'
                  type='button'
                  className='scroll-to-top icon-back-to-top'
                  onClick={returnToTop}
                />
              )}
            </React.Fragment>
          )}
        </React.Fragment>
      )}
    </div>
  );
}

export default withTranslations(ItemsContainer, translationConfig);
