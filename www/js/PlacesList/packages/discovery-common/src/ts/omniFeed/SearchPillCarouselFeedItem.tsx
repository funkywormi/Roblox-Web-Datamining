import { TExploreApiSearchPillsSort } from "../common/types/bedev2Types";
import SearchPillCarousel from "../searchLandingPage/searchPill/SearchPillCarousel";
import { TranslateFunction } from "@rbx/core-scripts/react";

type TSearchPillCarouselFeedItemProps = {
  sort: TExploreApiSearchPillsSort;
  positionId: number;
  isNewScrollArrowsEnabled?: boolean;
  isNewSortHeaderEnabled?: boolean;
  translate: TranslateFunction;
};

const SearchPillCarouselFeedItem = ({
  sort,
  positionId,
  isNewScrollArrowsEnabled,
  isNewSortHeaderEnabled,
  translate,
}: TSearchPillCarouselFeedItemProps): JSX.Element | null => {
  if (sort.queries.length === 0) {
    return null;
  }

  return (
    <SearchPillCarousel
      sort={sort}
      positionId={positionId}
      isNewScrollArrowsEnabled={isNewScrollArrowsEnabled}
      isNewSortHeaderEnabled={isNewSortHeaderEnabled}
      translate={translate}
    />
  );
};

export default SearchPillCarouselFeedItem;
