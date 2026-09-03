import { useEffect, RefObject } from 'react';
import { AXAnalyticsService } from 'Roblox';
import { useLocation } from 'react-router-dom';
import { CatalogQuery } from '../../hooks/catalogQuery/catalogQuery.types';

const { AXAnalyticsConstants } = AXAnalyticsService;

interface UseTrackCatalogViewsProps {
  catalogQuery: CatalogQuery;
  numberOfAppliedFilters: number;
  searchItemsError: string | null;
}

export const useTrackCatalogViews = ({
  catalogQuery,
  numberOfAppliedFilters,
  searchItemsError
}: UseTrackCatalogViewsProps): [RefObject<HTMLDivElement>] => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchPerformed = !!catalogQuery.keyword || !!searchParams.get('Keyword');
  const filtersApplied = numberOfAppliedFilters > 0;
  const [ref, isVisible] = AXAnalyticsService.useIsElementVisible();

  // Track Catalog View on didMount
  // Don't add searchItemsError to dependencies
  // as this should only run on didMount
  useEffect(() => {
    if (isVisible && !searchItemsError) {
      AXAnalyticsService.sendAXTracking({ itemName: AXAnalyticsConstants.CatalogView });
    }
  }, [isVisible]);

  // Track Search View if search is performed
  useEffect(() => {
    if (isVisible && searchPerformed && !searchItemsError) {
      AXAnalyticsService.sendAXTracking({ itemName: AXAnalyticsConstants.CatalogSearchView });
    }
  }, [isVisible, searchItemsError, searchPerformed]);

  // Track Filters View if filters are applied
  useEffect(() => {
    if (numberOfAppliedFilters > 0 && !searchItemsError) {
      if (searchPerformed) {
        AXAnalyticsService.sendAXTracking({
          itemName: AXAnalyticsConstants.CatalogSearchFiltersApplied
        });
      } else {
        AXAnalyticsService.sendAXTracking({
          itemName: AXAnalyticsConstants.CatalogFiltersApplied
        });
      }
    }
  }, [searchPerformed, numberOfAppliedFilters, searchItemsError, catalogQuery]);

  return [ref];
};

export default useTrackCatalogViews;
