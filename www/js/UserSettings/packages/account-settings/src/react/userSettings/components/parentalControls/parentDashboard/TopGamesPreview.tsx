import React from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-utilities";
import { useAppSelector } from "../../../../redux/hooks";
import { selectChildPagesForChildUserId } from "../../../../apis/slices/childPagesSlice";
import { getTopGameDetailsPath } from "../../../constants/parentalControls/parentalControlsConstants";
import PreviewCard from "../../../../common/components/routing/PreviewCard";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import useTopWeeklyGames from "../../../hooks/useTopWeeklyGames";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import parentalControlsEventService from "../../../services/eventServices/parentalControlsEventService";
import TopGamesPreviewList from "../shared/TopGamesPreviewList";

const TopGamesPreview = ({ child }: { child: TChildInfo }): JSX.Element => {
  const { translate } = useTranslation();
  const history = useHistory();
  const childPages = useAppSelector(selectChildPagesForChildUserId(child.userId));

  const { games, isLoading } = useTopWeeklyGames(child);

  const isEmpty = !isLoading && games.length === 0;

  return (
    <React.Fragment>
      <div className="rbx-divider" />
      <PreviewCard
        title={translate(parentalControlsTranslationConstants.topGames.heading)}
        linkText={translate(parentalControlsTranslationConstants.topGames.viewMore)}
        linkPath={childPages?.topGamesPage.path}
        displayLink={!isEmpty}
      >
        <TopGamesPreviewList
          games={games}
          isLoading={isLoading}
          onSelectGame={game => {
            parentalControlsEventService.authButtonClickSettingsPControlsTopExperiencesExperienceDetail(
              child,
              game.universeId,
            );
            history.push(getTopGameDetailsPath(child.userId, game.universeId));
          }}
        />
      </PreviewCard>
    </React.Fragment>
  );
};

export default TopGamesPreview;
