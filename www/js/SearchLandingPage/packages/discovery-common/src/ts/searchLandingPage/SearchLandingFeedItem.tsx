import React, { useMemo } from "react";
import type { TranslateFunction } from "@rbx/core-scripts/react";
import { TExploreApiSort, TTreatmentType } from "../common/types/bedev2Types";
import { TGetFriendsResponse } from "../common/types/bedev1Types";
import { searchLandingPage } from "../common/constants/configConstants";
import { useContentMetadata } from "../omniFeed/utils/contentMetadataContextProvider";
import { getHydratedGameData, isGameSortFromExploreApi } from "../omniFeed/utils/gameSortUtils";
import SearchLandingPageCarousel from "./SearchLandingPageCarousel";
import SearchPillCarousel from "./searchPill/SearchPillCarousel";

type TSearchLandingFeedItemProps = {
  sort: TExploreApiSort;
  positionId: number;
  friendsPresenceData: TGetFriendsResponse[];
  translate: TranslateFunction;
};

const SearchLandingFeedItem = ({
  sort,
  positionId,
  friendsPresenceData,
  translate,
}: TSearchLandingFeedItemProps): React.JSX.Element | null => {
  const { contentMetadata } = useContentMetadata();
  const isGameCarousel =
    sort.treatmentType === TTreatmentType.Carousel && isGameSortFromExploreApi(sort);
  const gameData = useMemo(
    () => (isGameCarousel ? getHydratedGameData(sort, contentMetadata) : []),
    [isGameCarousel, sort, contentMetadata],
  );

  if (isGameCarousel) {
    if (gameData.length === 0) {
      return null;
    }
    return (
      <SearchLandingPageCarousel
        key={sort.topic}
        sort={sort}
        gameData={gameData}
        translate={translate}
        positionId={positionId}
        itemsPerRow={searchLandingPage.numberOfTilesPerCarousel}
        friendsPresenceData={friendsPresenceData}
      />
    );
  }

  if (sort.treatmentType === TTreatmentType.SearchPillCarousel && sort.queries.length > 0) {
    return <SearchPillCarousel sort={sort} positionId={positionId} translate={translate} />;
  }

  return null;
};

export default SearchLandingFeedItem;
