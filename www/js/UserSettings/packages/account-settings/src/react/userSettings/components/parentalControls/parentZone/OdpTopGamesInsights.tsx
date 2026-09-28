import { useHistory } from "react-router-dom";
import { useTranslation } from "react-utilities";
import PreviewCard from "../../../../common/components/routing/PreviewCard";
import TopGamesPreviewList from "../shared/TopGamesPreviewList";
import useTopWeeklyGames from "../../../hooks/useTopWeeklyGames";
import {
  getParentZoneTopGameDetailsPath,
  parentZonePages,
} from "../../../constants/parentalControls/parentZonePages";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";

// Top games insights for on-device parent zone
export const OdpTopGamesInsights = (): JSX.Element => {
  const { translate } = useTranslation();
  const history = useHistory();
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
        // A row opens the details page with the block control, the same as the full list does and
        // the same as the remote parent's preview card.
        onSelectGame={game => history.push(getParentZoneTopGameDetailsPath(game.universeId))}
      />
    </PreviewCard>
  );
};

export default OdpTopGamesInsights;
