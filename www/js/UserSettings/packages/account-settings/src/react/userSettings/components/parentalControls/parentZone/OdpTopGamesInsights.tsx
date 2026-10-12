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
import { btnClickOdpTopGames } from "../../../services/eventServices/odpFamilyEventService";
import { useGetParentInfoQuery } from "../../../../apis/parentalControlsApi";

// Top games insights for on-device parent zone
export const OdpTopGamesInsights = (): JSX.Element => {
  const { translate } = useTranslation();
  const history = useHistory();
  const { data: parentInfo } = useGetParentInfoQuery();
  const { games, isLoading, isError } = useTopWeeklyGames();

  const isEmpty = !isLoading && games.length === 0;

  return (
    <PreviewCard
      title={translate(parentalControlsTranslationConstants.topGames.heading)}
      linkText={translate(parentalControlsTranslationConstants.topGames.viewMore)}
      linkPath={parentZonePages.topGamesPage.path}
      displayLink={!isEmpty}
      onClick={() => btnClickOdpTopGames(parentInfo?.parents)}
    >
      <TopGamesPreviewList
        games={games}
        isLoading={isLoading}
        isError={isError}
        // A row opens the details page with the block control, the same as the full list does and
        // the same as the remote parent's preview card.
        onSelectGame={game => history.push(getParentZoneTopGameDetailsPath(game.universeId))}
      />
    </PreviewCard>
  );
};

export default OdpTopGamesInsights;
