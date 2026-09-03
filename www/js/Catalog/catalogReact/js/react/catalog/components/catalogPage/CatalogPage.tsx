import React, { useState, useEffect, useCallback } from 'react';
import Roblox, { CurrentUser } from 'Roblox';
import { paymentFlowAnalyticsService, localStorageService } from 'core-roblox-utilities';
import { TWebPerformanceMetric, reportWebVitals } from '@rbx/web-vitals';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { AxiosResponse } from 'core-utilities';
import { ScrollBar } from 'react-style-guide';
import classNames from 'classnames';
import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import ItemsContainer from '../itemsContainer/components/ItemsContainer';
import SearchOptions, { SearchOptionsProps } from '../searchOptions/SearchOptions';
import ShimmerMenu from '../shimmerMenu/ShimmerMenu';
import { Category, Creator, CurrencyType, Topic, Subcategory } from '../../constants/types';
import translationConfig from '../../translation.config';
import UtilityService from '../../services/utilityService';
import CatalogAPIService from '../../services/catalogAPIService';
import useAdsService from '../../services/abpService';
import useLibraryState from '../../hooks/useLibrary';
import useAvatarEnrollments from '../../hooks/avatarEnrollments/useAvatarEnrollments';
import useLayoutState from '../../hooks/useLayout';
import useMetadata from '../../hooks/useMetadata';
import useSearchOptions from '../../hooks/searchOptions/useSearchOptions';
import useCatalogQuery from '../../hooks/catalogQuery/useCatalogQuery';
import { WrappedSearchBar } from '../searchBar/WrappedSearchBar';
import useDisplayedQuery from '../../hooks/useDisplayedQuery';
import useCatalogSearch from '../../hooks/catalogSearch/useCatalogSearch';
import menuConstants from '../../constants/menuConstants';
import useSearchFiltersStickyTop from './useSearchFiltersStickyTop';
import UniversalAppConfigurationService, {
  AppPolicyBehaviorResponse,
  VngBuyRobuxPolicyResponse
} from '../../services/universalAppConfigurationService';
import catalogConstants from '../../constants/catalogConstants';
import LeaveRobloxWarningModal from '../leaveRobloxWarningModal/LeaveRobloxWarningModal';
import MobileSearchBar from '../searchBar/MobileSearchBar';
import useMobileSearchOptionsHeight from './useMobileSearchOptionsHeight';
import VngPaymentsService from '../../services/vngPaymentsService';
import useTrackCatalogViews from './useTrackCatalogViews';
import useMarketplaceOfferModal from '../../hooks/useMarketplaceOfferModal';
import MarketplaceOfferModal from '../marketplaceOfferModal/MarketplaceOfferModal';
import MarketplaceOfferBanner from '../marketplaceOfferModal/MarketplaceOfferBanner';
import { MarketplaceOfferProvider } from '../marketplaceOfferModal/MarketplaceOfferContext';
import type { MarketplaceOffer } from '../../services/marketplaceSalesOffersService';
import useUrlParameterCleanup from '../../hooks/useUrlParameterCleanup';
import useExperimentSearchV2 from '../../hooks/catalogSearch/useExperimentSearchV2';
import SearchOptionsTopBar, {
  SearchOptionsTopBarProps
} from '../searchOptionsTop/SearchOptionsTopBar';
import TopicsCarousel from '../itemsContainer/components/TopicsCarousel';
import {
  trackCatalogFilterClick,
  trackCatalogSearchClick
} from '../../../analytics/axTrackingEvents';
/*
  CatalogPage is the main component for the catalog page. It is responsible for initializing the page and setting up the necessary hooks and services.

  LIFECYCLE:

  1. The initialize function is invoked via a useEffect, which sets up the library, ads, user currency, and user enrollments
  2. Metadata is loaded through the useMetadata hook
  3. After metadata is loaded, the search options are loaded from the backend through the useSearchOptions hook
  4. After search options are loaded, the catalog query is initialized based on the search options and the current URL

  CATALOG QUERY DESIGN:

  "CatalogQuery" represents the current query that the catalog page is using to fetch items from the backend. It encapsulates the entirety of the data that the API needs to fetch catalog results from the backend. Thus, whenever CatalogQuery changes, the useCatalogSearch hook is invoked to fetch items from the backend based on the query.
  The current state of the catalog query is also represented in the current URL via query params. This allows the user to refresh the page or navigate back/forward without losing their search settings. To keep the catalog query in sync with the URL, the constructQueriesFromURL function is invoked whenever the URL changes.
  This catalog query object is initially set up based on the search options returned by the backend as well as the current URL. Whenever the user interacts with the UI to modify their search (e.g., changing the category, keyword, etc.), the catalog query is updated accordingly which triggers a new fetch of items from the backend.
*/

type CatalogPageProps = {
  offer: MarketplaceOffer | null;
  showOfferModal: boolean;
  closeOfferModal: () => void;
  confirmOfferModalDismiss: () => void;
};

function CatalogPage({
  offer: marketplaceOffer,
  showOfferModal,
  closeOfferModal,
  confirmOfferModalDismiss,
  translate
}: CatalogPageProps & WithTranslationsProps): JSX.Element {
  const {
    isMetadataInitialized,
    autocompleteAvatarSearchNumToDisplay,
    isRemoveAllSubcategoryEnabled
  } = useMetadata();

  const abpService = useAdsService();

  const { topUp, setTopUp, isSearchOnBlurEnabled, getAvatarEnrollments } = useAvatarEnrollments();

  const { searchOptions } = useSearchOptions(isMetadataInitialized);

  const {
    keywordForDisplay,
    setKeywordForDisplay,
    isKeywordCensored,
    setIsKeywordCensored,
    setMinPriceForDisplay,
    setMaxPriceForDisplay,
    setCreatorNameForDisplay,
    displayedQuery
  } = useDisplayedQuery();

  const {
    setCategory,
    setSubcategory,
    setCreator,
    setCreatorName,
    setCurrencyType,
    setMinPrice,
    setMaxPrice,
    setIncludeNotForSale,
    setSalesTypeFilter,
    setSortType,
    setSortAggregation,
    setSelectedTopics,
    setKeyword,
    setCursor,
    catalogQuery,
    keyword,
    isCatalogQueryInitialized,
    numberOfAppliedFilters,
    initializeCatalogQuery
  } = useCatalogQuery(searchOptions, setKeywordForDisplay);

  const {
    initialized: layoutInitialized,
    setInitialized: setLayoutInitialized,
    setIsSearchItemsLoaded,
    searchItemsError,
    setSearchItemsError,
    setLoading,
    adsInitialized,
    setAdsInitialized,
    showError,
    setShowError,
    layout
  } = useLayoutState();

  // TODO - remove references to these variables since they are no longer used
  const robuxInThumbnailEnabled = false;
  const catalogRevampEnabled = true;

  const { library, setupLibrary } = useLibraryState();

  const [topics, setTopics] = useState<Topic[]>([]);

  // URL parameter cleanup and synchronization
  const { setCurrentUrl, constructQueriesFromURL } = useUrlParameterCleanup({
    searchOptions,
    initializeCatalogQuery,
    setKeywordForDisplay,
    setCreatorNameForDisplay,
    setMinPriceForDisplay,
    setMaxPriceForDisplay
  });
  const [ref] = useTrackCatalogViews({ catalogQuery, numberOfAppliedFilters, searchItemsError });

  // If pagination is not enabled, then the list will be limited to the first page of results
  const [isPaginationEnabled, setIsPaginationEnabled] = useState<boolean>();
  // If pagination is enabled, then the loading behavior uses either infinite scroll (continuous load) or an explicit "load more" button
  const [isInfiniteScrollDisabled, setIsInfiniteScrollDisabled] = useState<boolean>(true);

  useEffect(() => {
    setIsPaginationEnabled(library.initialized && !library.isPhone);
  }, [library]);

  useEffect(() => {
    UniversalAppConfigurationService.getAppPolicy()
      .then((result: AppPolicyBehaviorResponse) => {
        if (typeof result.EnableContinuousLoad === 'boolean') {
          setIsInfiniteScrollDisabled(!result.EnableContinuousLoad);
        } else {
          setIsInfiniteScrollDisabled(true);
        }
      })
      .catch(() => {
        // TODO - Log an error
        setIsInfiniteScrollDisabled(true);
      });
  }, []);

  const [isCurrentCategorySearchable, setIsCurrentCategorySearchable] = useState<boolean>();

  useEffect(() => {
    setIsCurrentCategorySearchable(catalogQuery.category?.isSearchable ?? true);
  }, [catalogQuery]);

  const setupAds = () => {
    if (!adsInitialized) {
      setAdsInitialized(true);

      abpService.registerAd(abpService.adIds.leaderboardAbp);
    }
  };

  const adRefresh = useCallback(() => {
    abpService.refreshAllAds();
  }, [abpService]);

  const clearTopics = useCallback(() => {
    setSelectedTopics([]);
  }, [setSelectedTopics]);

  // Sets the query settings from the URL and the search options results
  const callBackForSearchOptions = useCallback(() => {
    // Initialize the query based on the current URL as well as the default settings specified by the search options response
    constructQueriesFromURL();
  }, [constructQueriesFromURL]);

  useEffect(() => {
    if (searchOptions.isSearchOptionsLoaded) {
      callBackForSearchOptions();
    }
  }, [searchOptions]);

  const {
    getPagedItems,
    fetchNextPage,
    canLoadNextPage,
    searchResultDict,
    searchResultList
  } = useCatalogSearch({
    catalogQuery,
    searchOptions,
    isInfiniteScrollDisabled,
    library,
    layout,
    isPaginationEnabled,
    keyword,
    setCurrentUrl,
    setIsKeywordCensored,
    setIsSearchItemsLoaded,
    setLayoutInitialized,
    setSearchItemsError,
    setCursor,
    setLoading,
    clearTopics,
    setTopics,
    translate
  });

  useEffect(() => {
    if (isCatalogQueryInitialized) {
      const shouldAppendResults = !!catalogQuery.cursor;
      const queryUnchanged = getPagedItems(!shouldAppendResults, true);
      if (queryUnchanged) {
        return;
      }
      adRefresh();
      if (!shouldAppendResults) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [catalogQuery, isCatalogQueryInitialized]);

  const [shouldRedirectToVng, setShouldRedirectToVng] = useState<boolean>(false);
  const [buyRobuxButtonUrl, setBuyRobuxButtonUrl] = useState<string>(catalogConstants.buyRobuxUrl);
  const [showLeaveRobloxWarningModal, setShowLeaveRobloxWarningModal] = useState<boolean>(false);
  const [isMobileSearchOptionsOpen, setIsMobileSearchOptionsOpen] = useState<boolean>(false);

  useEffect(() => {
    UniversalAppConfigurationService.getVngBuyRobuxPolicy()
      .then((result: VngBuyRobuxPolicyResponse) => {
        setShouldRedirectToVng(result.shouldShowVng);
        setBuyRobuxButtonUrl('#');
      })
      .catch(() => {
        setShouldRedirectToVng(false);
        setBuyRobuxButtonUrl(catalogConstants.buyRobuxUrl);
      });
  }, []);

  const getUserCurrency = () => {
    if (CurrentUser.isAuthenticated === true) {
      CatalogAPIService.getUserCurrency().then(
        function success(result) {
          setTopUp(prevTopUp => ({
            ...prevTopUp,
            currentUserBalance: result.data.robux
          }));
        },
        function error() {
          // No op
        }
      );
    }
  };

  const clearKeyword = () => {
    setKeyword('');
  };

  const clearPrice = keepKeyword => {
    setCurrencyType(searchOptions.currencyTypes ? searchOptions.currencyTypes[0] : undefined);

    if (!keepKeyword) {
      clearKeyword();
    }
  };

  const clearCreator = (stopChaining: boolean, keepKeyword: boolean) => {
    setCreator(
      searchOptions.creators?.find(c => {
        return c.userId === searchOptions.defaultCreatorId;
      })
    );

    if (stopChaining) {
      clearKeyword();
      return;
    }

    clearPrice(keepKeyword);
  };

  const clearKeywordAndCreator = (stopChaining: boolean, keepKeyword: boolean) => {
    if (stopChaining) {
      clearKeyword();
      return;
    }

    clearCreator(false, keepKeyword);
  };

  const onClearFilters = (keepKeyword: boolean) => {
    clearKeywordAndCreator(false, keepKeyword);
  };

  const closeWarning = () => {
    setShowError(false);
  };

  const buyRobuxButtonOnClick = () => {
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_ROBUX_PURCHASE,
      false,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.CATALOG_LIST_PAGE,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
      paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.BUY_ROBUX
    );
    if (shouldRedirectToVng) {
      setShowLeaveRobloxWarningModal(true);
    } else {
      window.location.href = catalogConstants.buyRobuxUrl;
    }
  };

  const onLeaveRobloxWarningModalClose = () => {
    setShowLeaveRobloxWarningModal(false);
  };

  const onLeaveRobloxWarningModalContinue = () => {
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_ROBUX_PURCHASE,
      false,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.CATALOG_LIST_PAGE,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
      paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.CONTINUE_TO_VNG
    );
    setShowLeaveRobloxWarningModal(false);

    VngPaymentsService.getVngShopSignedUrl().then(
      data => {
        if (data) {
          window.open(data.data.vngShopRedirectUrl, '_blank');
        } else {
          window.open(catalogConstants.fallbackVngShopUrl, '_blank');
        }
      },
      e => {
        window.open(catalogConstants.fallbackVngShopUrl, '_blank');
      }
    );
  };

  const getCategoryOption = (originalCategory?: Category) => {
    return UtilityService.getCategoryMenu(searchOptions.categories, originalCategory?.categoryId);
  };

  const getCategoryDropdownValue = () => {
    const { category, subcategory } = catalogQuery;

    if (!category) {
      return '';
    }

    // For Gear, update the category dropdown in the search bar to be the Gear genre
    if (
      category.categoryId === searchOptions.gearCategoryId &&
      subcategory &&
      subcategory.subcategoryId !== searchOptions.defaultGearSubcategoryId
    ) {
      return subcategory.name;
    }

    return category.name;
  };

  const updateCategory = (
    event: React.MouseEvent | null,
    clearFilters: boolean,
    shouldClearKeyword: boolean,
    newCategory: Category,
    newSubcategory: Subcategory | undefined
  ) => {
    trackCatalogFilterClick(
      'category',
      newSubcategory ? `${newCategory?.name}/${newSubcategory?.name}` : newCategory?.name,
      !!catalogQuery.keyword
    );
    if (shouldClearKeyword) {
      setKeyword(null);
      clearTopics();
    }

    if (newSubcategory) {
      event?.stopPropagation();
    }
    let subCategoryToSet = newSubcategory;

    // if no subcategory was supplied, set the subcategory to the default for the given category
    // only apply this logic when the metadata field is false
    if (!subCategoryToSet && !isRemoveAllSubcategoryEnabled) {
      const cat = getCategoryOption(newCategory);
      if (cat && cat.subcategories) {
        subCategoryToSet = cat.subcategories?.[0];
      }
    }

    setCategory(newCategory);
    setSubcategory(subCategoryToSet);

    if (clearFilters) {
      onClearFilters(!shouldClearKeyword);
    }
  };

  const categoryClick = (event: React.MouseEvent, categoryClicked: Category) => {
    // for categories that don't have a subcategory menu, apply new search
    if (!categoryClicked.subcategories || categoryClicked.subcategories.length === 0) {
      clearTopics();
      setCategory(categoryClicked);
      setSubcategory(undefined);

      onClearFilters(false);
    }
  };

  const categoryNameClick = (event: React.MouseEvent, categoryClicked: Category) => {
    clearTopics();

    setCategory(categoryClicked);
    setSubcategory(undefined);
    onClearFilters(false);

    // Don't close the submenu if it is open
    if (
      document
        ?.getElementById(`expandable-menu-category-${categoryClicked.categoryId}`)
        ?.getAttribute('aria-expanded') === 'true'
    ) {
      event.stopPropagation();
    }
  };

  const onTopUpClear = () => {
    localStorageService.setLocalStorage(
      `Roblox.AvatarMarketplace.TopUpClearDate-${CurrentUser.userId}`,
      Date.now()
    );
    setTopUp(prevTopUp => ({ ...prevTopUp, showTopUp: false }));
  };

  const initialize = () => {
    if (layoutInitialized) {
      return;
    }

    reportWebVitals({
      logWebVitalsEvent: (metric: TWebPerformanceMetric) => {
        Roblox.EventStream.SendEventWithTarget(
          metric.eventName,
          'RobloxWWW',
          {
            metricName: metric.metricName,
            metricValue: metric.metricValue
          },
          Roblox.EventStream.TargetTypes.WWW
        );
      }
    });

    setupLibrary();
    setupAds();
    getUserCurrency();

    getAvatarEnrollments();
  };

  useEffect(() => {
    initialize();
  }, []);

  const onSalesTypeFilterChanged = useCallback(
    (salesTypeFilterId: number) => {
      const updatedSalesTypeFilter = searchOptions.salesTypeFilters?.find(
        s => s.filter === salesTypeFilterId
      );
      trackCatalogFilterClick('salesType', salesTypeFilterId, !!catalogQuery.keyword);
      setSalesTypeFilter(updatedSalesTypeFilter);
    },
    [searchOptions.salesTypeFilters, setSalesTypeFilter, catalogQuery.keyword]
  );

  const onSortTypeChanged = useCallback(
    (newSortType: number) => {
      const updatedSortType = searchOptions.sortMenus?.sortOptions.find(
        s => s.sortType === newSortType
      );
      trackCatalogFilterClick('sortType', newSortType, !!catalogQuery.keyword);
      setSortType(updatedSortType);
    },
    [searchOptions.sortMenus?.sortOptions, setSortType, catalogQuery.keyword]
  );

  const onSortAggregationChanged = useCallback(
    (newSortAggregation: number) => {
      const updatedSortAggregation = searchOptions.sortMenus?.sortAggregations.find(
        s => s.sortAggregation === newSortAggregation
      );
      trackCatalogFilterClick('sortAggregation', newSortAggregation, !!catalogQuery.keyword);
      setSortAggregation(updatedSortAggregation);
    },
    [searchOptions.sortMenus?.sortAggregations, setSortAggregation, catalogQuery.keyword]
  );

  const { isFullScreen, catalogUrl } = library;

  const { searchFiltersStickyTop } = useSearchFiltersStickyTop();
  const {
    mobileSearchOptionsContainerHeight,
    rbxHeaderHeight,
    headingContainerHeight
  } = useMobileSearchOptionsHeight();

  const mobileSearchBarStickyTop = rbxHeaderHeight - headingContainerHeight;

  const searchOptionsProps: Omit<SearchOptionsProps, 'isMobile'> = {
    searchOptions,
    catalogQuery,
    displayedQuery,
    setCreatorNameForDisplay,
    setMinPriceForDisplay,
    setMaxPriceForDisplay,
    updateCategory,
    categoryClick,
    categoryNameClick,
    isCurrentCategorySearchable: isCurrentCategorySearchable || false,
    menuConstantsCategoryTypesCommunityCreations: menuConstants.categoryTypes.CommunityCreations,
    onSalesTypeFilterChanged,
    onSortTypeChanged,
    onSortAggregationChanged,
    onUnavailableFilterChanged: (value: boolean) => {
      trackCatalogFilterClick('includeNotForSale', value, !!catalogQuery.keyword);
      setIncludeNotForSale(value);
    },
    onCreatorChanged: (updatedCreator: Creator) => {
      trackCatalogFilterClick('creator', updatedCreator?.name ?? undefined, !!catalogQuery.keyword);
      setCreator(updatedCreator);
    },
    applyCreatorNameToQuery: (newCreatorName?: string | null) => {
      trackCatalogFilterClick('creatorName', newCreatorName ?? undefined, !!catalogQuery.keyword);
      setCreatorName(newCreatorName);
    },
    applyMinPriceToQuery: (newMinPrice?: number | null) => {
      trackCatalogFilterClick('minPrice', newMinPrice ?? undefined, !!catalogQuery.keyword);
      setMinPrice(newMinPrice);
    },
    applyMaxPriceToQuery: (newMaxPrice?: number | null) => {
      trackCatalogFilterClick('maxPrice', newMaxPrice ?? undefined, !!catalogQuery.keyword);
      setMaxPrice(newMaxPrice);
    },
    onCurrencyTypeChanged: (updatedCurrencyType: CurrencyType) => {
      trackCatalogFilterClick('currencyType', updatedCurrencyType?.name, !!catalogQuery.keyword);
      setCurrencyType(updatedCurrencyType);
    },
    isSearchOnBlurEnabled,
    closeSearchOptions: () => {
      setIsMobileSearchOptionsOpen(false);
    },
    resetFilters: () => {
      constructQueriesFromURL(true);
    },
    isPhone: library.isPhone
  };

  const searchOptionsTopBarProps: SearchOptionsTopBarProps = {
    searchOptions,
    catalogQuery,
    displayedQuery,
    setCreatorNameForDisplay,
    setMinPriceForDisplay,
    setMaxPriceForDisplay,
    updateCategory,
    isCurrentCategorySearchable: isCurrentCategorySearchable || false,
    onSalesTypeFilterChanged,
    onSortTypeChanged,
    onSortAggregationChanged,
    onUnavailableFilterChanged: (value: boolean) => {
      trackCatalogFilterClick('includeNotForSale', value, !!catalogQuery.keyword);
      setIncludeNotForSale(value);
    },
    onCreatorChanged: (updatedCreator: Creator) => {
      trackCatalogFilterClick('creator', updatedCreator?.name ?? undefined, !!catalogQuery.keyword);
      setCreator(updatedCreator);
    },
    applyCreatorNameToQuery: (newCreatorName?: string | null) => {
      trackCatalogFilterClick('creatorName', newCreatorName ?? undefined, !!catalogQuery.keyword);
      setCreatorName(newCreatorName);
    },
    applyMinPriceToQuery: (newMinPrice?: number | null) => {
      trackCatalogFilterClick('minPrice', newMinPrice ?? undefined, !!catalogQuery.keyword);
      setMinPrice(newMinPrice);
    },
    applyMaxPriceToQuery: (newMaxPrice?: number | null) => {
      trackCatalogFilterClick('maxPrice', newMaxPrice ?? undefined, !!catalogQuery.keyword);
      setMaxPrice(newMaxPrice);
    },
    onCurrencyTypeChanged: (updatedCurrencyType: CurrencyType) => {
      trackCatalogFilterClick('currencyType', updatedCurrencyType?.name, !!catalogQuery.keyword);
      setCurrencyType(updatedCurrencyType);
    }
  };

  const handleSearchSubmit = (newKeyword: string | null) => {
    if (newKeyword) {
      trackCatalogSearchClick(newKeyword);
    }
    setKeyword(newKeyword);
  };

  return (
    <div
      id='catalog-react-page'
      className={classNames({ 'catalog-revamp': catalogRevampEnabled })}
      ref={ref}>
      <div className='alert-system-feedback'>
        <div className={`alert alert-warning ${showError ? 'on' : ''}`}>
          <span className='alert-content'>{translate('Response.Error.Filter')}</span>
          <button
            type='button'
            aria-label='Close'
            onClick={closeWarning}
            className='icon-close-white'
          />
        </div>
      </div>
      <div id='angular-react-purchase-handoff' data-identifier='direct-purchase' />
      <div
        id='catalog-content'
        className={`clearfix catalog-content sticky shopping-cart ${
          isFullScreen ? 'catalog-full-screen' : ''
        }`}>
        <div
          className='catalog-header'
          style={
            {
              display: 'flex',
              flexDirection: 'column',
              '--heading-container-mobile-height': `${mobileSearchBarStickyTop}px`,
              top: `${rbxHeaderHeight}px`,
              position: 'sticky'
            } as React.CSSProperties
          }>
          <div className='search-bars search-bar-placement-right'>
            <div className='heading-container'>
              <h1 className='heading'>
                <a href={catalogUrl} target='_self'>
                  {translate('Heading.Marketplace')}
                </a>
              </h1>
              <MarketplaceOfferBanner className='marketplace-offer-banner-heading' />
              <a
                className='btn-growth-md buy-robux'
                href={buyRobuxButtonUrl}
                target='_self'
                onClick={buyRobuxButtonOnClick}>
                {translate('Action.BuyRobux')}
              </a>
              {shouldRedirectToVng && (
                <LeaveRobloxWarningModal
                  showModal={showLeaveRobloxWarningModal}
                  onModalClosed={onLeaveRobloxWarningModalClose}
                  onModalContinue={onLeaveRobloxWarningModalContinue}
                />
              )}
            </div>
            <div hidden={!layoutInitialized}>
              <MobileSearchBar
                searchInputValue={keywordForDisplay}
                setSearchInputValue={setKeywordForDisplay}
                toggleSearchOptions={() => {
                  setIsMobileSearchOptionsOpen(isOpen => !isOpen);
                }}
                search={handleSearchSubmit}
                isSearchOnBlurEnabled={isSearchOnBlurEnabled}
                numberOfAppliedFilters={numberOfAppliedFilters}
                topicBasedBrowsingEnabledForCategory={
                  catalogQuery.topicBasedBrowsingEnabledForCategory
                }
                catalogQuery={catalogQuery}
                topics={topics}
                setSelectedTopics={setSelectedTopics}
                onClearFilters={onClearFilters}
                clearTopics={clearTopics}
              />
              <WrappedSearchBar
                keywordForDisplay={keywordForDisplay}
                setKeywordForDisplay={setKeywordForDisplay}
                search={handleSearchSubmit}
                catalogQuery={catalogQuery}
                categories={searchOptions.categories}
                hasSearchOptionsError={searchOptions.hasSearchOptionsError}
                autocompleteAvatarSearchNumToDisplay={autocompleteAvatarSearchNumToDisplay}
                library={library}
                updateCategory={updateCategory}
                buyRobuxButtonOnClick={buyRobuxButtonOnClick}
                buyRobuxButtonUrl={buyRobuxButtonUrl}
                getCategoryDropdownValue={getCategoryDropdownValue}
                isSearchOnBlurEnabled={isSearchOnBlurEnabled}
              />
            </div>
          </div>
          {catalogRevampEnabled && (
            <div className='catalog-heading-container'>
              <div className='catalog-heading-actions'>
                {searchOptions.isSearchOptionsLoaded && (
                  <SearchOptionsTopBar {...searchOptionsTopBarProps} />
                )}
              </div>
              <TopicsCarousel
                topicBasedBrowsingEnabledForCategory={
                  catalogQuery.topicBasedBrowsingEnabledForCategory
                }
                catalogQuery={catalogQuery}
                topics={topics}
                setSelectedTopics={setSelectedTopics}
                onClearFilters={onClearFilters}
                clearTopics={clearTopics}
              />
            </div>
          )}
        </div>
        <div id='main-view'>
          <ItemsContainer
            layout={layout}
            topicBasedBrowsingEnabledForCategory={catalogQuery.topicBasedBrowsingEnabledForCategory}
            setSelectedTopics={setSelectedTopics}
            onClearFilters={onClearFilters}
            clearTopics={clearTopics}
            topUp={topUp}
            catalogQuery={catalogQuery}
            isKeywordCensored={isKeywordCensored}
            searchOptions={searchOptions}
            fetchNextPage={fetchNextPage}
            canLoadNextPage={canLoadNextPage}
            searchResultDict={searchResultDict}
            searchResultList={searchResultList}
            isInfiniteScrollDisabled={isInfiniteScrollDisabled}
            isPaginationEnabled={!!isPaginationEnabled}
            library={library}
            topics={topics}
            getCategoryOption={getCategoryOption}
            setSubcategory={setSubcategory}
            setCreator={setCreator}
            setCurrencyType={setCurrencyType}
            clearKeyword={clearKeyword}
            onTopUpClear={onTopUpClear}
            hideBreadcrumbs={catalogRevampEnabled}
            enableThumbnailPrice={robuxInThumbnailEnabled}
            enableCatalogRevampExperiment={catalogRevampEnabled}
          />
        </div>
        {!catalogRevampEnabled && searchOptions.isSearchOptionsLoaded && (
          <div
            id='search-options-scrollbar-container'
            className='search-options-scrollbar-container'
            // The simplebar component doesn't seem to handle RTL layouts correctly, so we need to set the dir attribute back to LTR manually and then re-apply RTL to the child components
            dir='ltr'
            style={
              searchFiltersStickyTop !== null
                ? {
                    top: `${searchFiltersStickyTop}px`,
                    position: 'sticky',
                    maxHeight: `calc(100vh - ${searchFiltersStickyTop}px)`
                  }
                : undefined
            }>
            <ScrollBar className='rbx-scrollbar'>
              <SearchOptions {...searchOptionsProps} isMobile={false} />
            </ScrollBar>
          </div>
        )}
        {!searchOptions.isSearchOptionsLoaded && (
          <div id='shimmer-menu-container'>
            <ShimmerMenu />
          </div>
        )}
      </div>
      {isMobileSearchOptionsOpen && (
        /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/interactive-supports-focus */
        <div
          className='mobile-search-options-container'
          style={{
            top: rbxHeaderHeight,
            height:
              mobileSearchOptionsContainerHeight !== null
                ? mobileSearchOptionsContainerHeight
                : 'auto'
          }}
          role='button'
          onClick={event => {
            event.stopPropagation();
            setIsMobileSearchOptionsOpen(false);
          }}>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div
            className='mobile-search-options'
            onClick={event => {
              event.stopPropagation();
            }}>
            <SearchOptions {...searchOptionsProps} isMobile />
          </div>
        </div>
      )}
      <MarketplaceOfferModal
        offer={marketplaceOffer}
        showModal={showOfferModal}
        onClose={closeOfferModal}
        onConfirmDismiss={confirmOfferModalDismiss}
      />
    </div>
  );
}

const TranslatedCatalogPage = withTranslations(CatalogPage, translationConfig);

function ThemedCatalogPage(): JSX.Element {
  const theme = createTheme({
    typography: {
      fontFamily: 'inherit'
    },
    components: {
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8
          },
          input: {
            borderRadius: 8
          }
        }
      }
    }
  });

  const {
    offer,
    showOfferModal,
    openOfferModal,
    closeOfferModal,
    confirmOfferModalDismiss,
    showOfferBanner,
    dismissOfferBanner
  } = useMarketplaceOfferModal();

  return (
    <ThemeProvider theme={theme}>
      <MarketplaceOfferProvider
        value={{ offer, showOfferBanner, dismissOfferBanner, openOfferModal }}>
        <TranslatedCatalogPage
          offer={offer}
          showOfferModal={showOfferModal}
          closeOfferModal={closeOfferModal}
          confirmOfferModalDismiss={confirmOfferModalDismiss}
        />
      </MarketplaceOfferProvider>
    </ThemeProvider>
  );
}

export default ThemedCatalogPage;
