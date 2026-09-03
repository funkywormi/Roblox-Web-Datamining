import React, { useMemo, useState } from "react";
import { uuidService } from "core-utilities";
import { Loading } from "react-style-guide";
import { useTranslation } from "react-utilities";
import { TOmniSearchQueryParams } from "../../../../types/omniSearchTypes";
import SearchBar from "../../../common/components/SearchBar";
import { useLazyGetExperiencesQuery } from "../../../apis/experienceSearchApi";
import GameTile, { TGameData } from "../parentalControls/parentDashboard/GameTile";
import { useGetAgeRecommendationQuery } from "../../../apis/gameDetailsApi";
import SentinelTile from "../parentalControls/parentDashboard/SentinelTile";
import { useGetBlockedExperiencesQuery } from "../../../apis/experienceBlockingApi";
import { blockedExperiencesPageSize } from "../../constants/privacy/privacyConstants";
import parentalControlsTranslationConstants from "../../constants/contentConstants/parentalControlsTranslationConstants";
import parentalControlsEventService from "../../services/eventServices/parentalControlsEventService";
import { TChildInfo } from "../../../../types/childrenInfoTypes";

export const BlockedExperiencesSearch = ({ child }: { child: TChildInfo }): JSX.Element => {
  const { translate } = useTranslation();

  const [getExperiences, searchResults] = useLazyGetExperiencesQuery();
  const { data: blockedExperiencesResult } = useGetBlockedExperiencesQuery({
    targetUserId: child.userId,
    limit: blockedExperiencesPageSize,
    offset: 0,
  });

  const [searchInput, setSearchInput] = useState("");
  const [sessionId] = useState(uuidService.generateRandomUuid());
  const universeIds = useMemo(
    () =>
      searchResults.currentData?.searchResults
        .map(result => result.contents[0]?.universeId)
        .filter((id): id is number => id != null) ?? [],
    [searchResults],
  );
  const { data: ageRecommendations } = useGetAgeRecommendationQuery(universeIds, {
    skip: universeIds.length === 0,
  });

  const fetchExperiences = async (pageToken?: string) => {
    const params: TOmniSearchQueryParams = {
      searchQuery: searchInput,
      sessionId,
      pageToken,
    };
    await getExperiences(params);
  };

  const loadMoreData = async () => {
    if (searchResults.currentData?.nextPageToken) {
      await fetchExperiences(searchResults.currentData.nextPageToken);
    }
  };

  return (
    <React.Fragment>
      <SearchBar
        classNames="blocked-experiences-search"
        searchInput={searchInput}
        onSearchInputChange={e => setSearchInput(e.target.value)}
        onSubmit={async () => {
          parentalControlsEventService.authFormInteractionSettingsPControlsBlockedExperiencesSearch(
            child,
            searchInput,
            sessionId,
          );
          await fetchExperiences();
        }}
      />
      <div className="parental-controls-game-grid">
        {searchResults.currentData?.searchResults.map(result => {
          const content = result.contents[0];
          if (!content) {
            return null;
          }
          const { name, universeId, rootPlaceId } = content;

          const ageRec = ageRecommendations?.[universeId];
          const gameData: TGameData = {
            universeId,
            name,
            rootPlaceId,
            maturityRating: ageRec?.maturityRating,
            isBlocked:
              blockedExperiencesResult?.blockedExperiences.find(
                experience => experience.universeId === universeId,
              ) !== undefined,
            disabled:
              blockedExperiencesResult?.blockedExperiences.find(
                experience => experience.universeId === universeId,
              ) !== undefined,
          };
          return (
            <GameTile
              key={name}
              gameData={gameData}
              showManagementButton
              child={child}
              sessionId={sessionId}
            />
          );
        })}
        <SentinelTile loadData={loadMoreData} />
        {searchResults.isFetching && <Loading />}
      </div>

      {searchResults.currentData?.searchResults.length === 0 && (
        <div className="text-description">
          {translate(parentalControlsTranslationConstants.perExperienceScreentime.noSearchResults)}
        </div>
      )}
    </React.Fragment>
  );
};

export default BlockedExperiencesSearch;
