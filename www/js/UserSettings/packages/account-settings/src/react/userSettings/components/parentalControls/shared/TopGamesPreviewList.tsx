import { useTranslation } from "react-utilities";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  ThumbnailGameIconSize,
} from "roblox-thumbnails";
import { List, ListItem, ProgressCircle } from "@rbx/foundation-ui";
import PreviewCardDescription from "../../../../common/components/PreviewCardDescription";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import screentimeUtils from "../../../utils/parentalControls/screentime/screentimeUtils";
import { TGameData } from "../parentDashboard/GameTile";

export const topGamesPreviewCount = 3;

// Content for top-games preview card
export const TopGamesPreviewList = ({
  games,
  isLoading,
  onSelectGame,
}: {
  games: TGameData[];
  isLoading: boolean;
  onSelectGame: (game: TGameData) => void;
}): JSX.Element => {
  const { translate } = useTranslation();

  if (isLoading && games.length === 0) {
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

  if (games.length === 0) {
    return (
      <PreviewCardDescription
        description={translate(parentalControlsTranslationConstants.topGames.zeroState)}
      />
    );
  }

  return (
    <List>
      {games.slice(0, topGamesPreviewCount).map(game => (
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
          onSelect={() => onSelectGame(game)}
        />
      ))}
    </List>
  );
};

export default TopGamesPreviewList;
