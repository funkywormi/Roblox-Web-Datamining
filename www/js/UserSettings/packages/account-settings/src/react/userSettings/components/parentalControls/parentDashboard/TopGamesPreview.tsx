import React, { useMemo } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-utilities";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  ThumbnailGameIconSize,
} from "roblox-thumbnails";
import { List, ListItem, ProgressCircle } from "@rbx/foundation-ui";
import { useAppSelector } from "../../../../redux/hooks";
import { selectChildPagesForChildUserId } from "../../../../apis/slices/childPagesSlice";
import { getTopGameDetailsPath } from "../../../constants/parentalControls/parentalControlsConstants";
import PreviewCard from "../../../../common/components/routing/PreviewCard";
import PreviewCardDescription from "../../../../common/components/PreviewCardDescription";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import useTopWeeklyGames from "../../../hooks/useTopWeeklyGames";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import parentalControlsEventService from "../../../services/eventServices/parentalControlsEventService";
import screentimeUtils from "../../../utils/parentalControls/screentime/screentimeUtils";

const TOP_GAMES_PREVIEW_COUNT = 3;

const TopGamesPreview = ({ child }: { child: TChildInfo }): JSX.Element => {
  const { translate } = useTranslation();
  const history = useHistory();
  const childPages = useAppSelector(selectChildPagesForChildUserId(child.userId));

  const { games, isLoading } = useTopWeeklyGames(child);
  const topGames = useMemo(() => games.slice(0, TOP_GAMES_PREVIEW_COUNT), [games]);

  const isEmpty = !isLoading && topGames.length === 0;

  const renderBody = (): JSX.Element => {
    if (isLoading && topGames.length === 0) {
      return (
        <div className="flex w-full justify-center padding-y-large">
          <ProgressCircle
            ariaLabel={translate(commonTranslationConstants.loading)}
            size="Small"
            variant="Indeterminate"
          />
        </div>
      );
    }

    if (isEmpty) {
      return (
        <PreviewCardDescription
          description={translate(parentalControlsTranslationConstants.topGames.zeroState)}
        />
      );
    }

    return (
      <List>
        {topGames.map(game => (
          <ListItem
            key={game.universeId}
            isContained={false}
            size="Medium"
            divider="None"
            title={game.name}
            metadata={game.genre_l1 ?? ""}
            leading={
              <div className="size-1000 radius-small clip flex items-center justify-center">
                <Thumbnail2d
                  type={ThumbnailTypes.gameIcon}
                  size={ThumbnailGameIconSize.size256}
                  targetId={game.universeId}
                  format={ThumbnailFormat.jpeg}
                  altName={game.name}
                />
              </div>
            }
            trailing={
              <span className="text-body-medium content-default">
                {screentimeUtils.getCompactFormattedTime(game.playTimeMinutes ?? 0, translate)}
              </span>
            }
            onSelect={() => {
              parentalControlsEventService.authButtonClickSettingsPControlsTopExperiencesExperienceDetail(
                child,
                game.universeId,
              );
              history.push(getTopGameDetailsPath(child.userId, game.universeId));
            }}
          />
        ))}
      </List>
    );
  };

  return (
    <React.Fragment>
      <div className="rbx-divider" />
      <PreviewCard
        title={translate(parentalControlsTranslationConstants.topGames.heading)}
        linkText={translate(parentalControlsTranslationConstants.topGames.viewMore)}
        linkPath={childPages?.topGamesPage.path}
        displayLink={!isEmpty}
      >
        {renderBody()}
      </PreviewCard>
    </React.Fragment>
  );
};

export default TopGamesPreview;
