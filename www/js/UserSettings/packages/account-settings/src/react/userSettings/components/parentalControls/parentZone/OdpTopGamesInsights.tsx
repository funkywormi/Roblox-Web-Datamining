import { useTranslation } from "react-utilities";
import PreviewCard from "../../../../common/components/routing/PreviewCard";
import TopGamesPreviewList from "../shared/TopGamesPreviewList";
import useTopWeeklyGames from "../../../hooks/useTopWeeklyGames";
import { parentZonePages } from "../../../constants/parentalControls/parentZonePages";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import { getGameDetailsPagePath } from "../../../constants/urlConstants";

// Top games insights for on-device parent zone
export const OdpTopGamesInsights = (): JSX.Element => {
  const { translate } = useTranslation();
  const { games, isLoading } = useTopWeeklyGames();

  const isEmpty = !isLoading && games.length === 0;

  return (
    <PreviewCard
      title={translate(parentalControlsTranslationConstants.topGames.heading)}
      linkText={translate(parentalControlsTranslationConstants.topGames.viewMore)}
      linkPath={parentZonePages.topGamesPage.path}
      displayLink={!isEmpty}
    >
      <TopGamesPreviewList
        games={games}
        isLoading={isLoading}
        // A row opens the experience, the same as the full list does.
        onSelectGame={game => {
          if (game.rootPlaceId === undefined) {
            return;
          }
          window.location.href = getGameDetailsPagePath(game.rootPlaceId);
        }}
      />
    </PreviewCard>
  );
};

export default OdpTopGamesInsights;
