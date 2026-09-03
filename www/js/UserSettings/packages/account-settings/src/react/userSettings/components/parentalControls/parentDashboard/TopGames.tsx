import { useHistory } from "react-router-dom";
import { useTranslation } from "react-utilities";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  ThumbnailGameIconSize,
} from "roblox-thumbnails";
import {
  List,
  ListItem,
  ListItemChevronTrailingAccessory,
  ProgressCircle,
} from "@rbx/foundation-ui";
import SettingsSection from "../../../../common/components/SettingsSection";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import {
  getGameDetailsPagePath,
  perExperienceScreentimeHelpPageUrl,
} from "../../../constants/urlConstants";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import useTopWeeklyGames from "../../../hooks/useTopWeeklyGames";
import { getTopGameDetailsPath } from "../../../constants/parentalControls/parentalControlsConstants";
import parentalControlsEventService from "../../../services/eventServices/parentalControlsEventService";
import privacyEventService from "../../../services/eventServices/privacyEventService";
import screentimeUtils from "../../../utils/parentalControls/screentime/screentimeUtils";

// `child` distinguishes the two render contexts:
// - parent dashboard (`child` provided): rows link to the per-game details page
//   for blocking/management.
// - child's own settings (`child` undefined): rows link directly to the EDP,
//   since the details page only adds parent-only block actions.
const TopGames = ({ child }: { child?: TChildInfo }): JSX.Element => {
  const { translate } = useTranslation();
  const history = useHistory();

  const { games, isLoading } = useTopWeeklyGames(child);

  const { topGames, perExperienceScreentime } = parentalControlsTranslationConstants;

  const description = (
    <div
      dangerouslySetInnerHTML={{
        __html: translate(
          child ? topGames.description : perExperienceScreentime.childSideDescription,
          {
            linkStart: `<a href=${perExperienceScreentimeHelpPageUrl} class="text-link" target="_blank">`,
            linkEnd: "</a>",
          },
        ),
      }}
    />
  );

  if (isLoading && games.length === 0) {
    return (
      <SettingsSection description={description}>
        <div className="flex w-full justify-center padding-y-large">
          <ProgressCircle
            ariaLabel={translate(commonTranslationConstants.loading)}
            size="Medium"
            variant="Indeterminate"
          />
        </div>
      </SettingsSection>
    );
  }

  if (games.length === 0) {
    return (
      <SettingsSection description={description}>
        <div className="screentime-zero-state">{translate(topGames.zeroState)}</div>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection description={description}>
      <List>
        {games.map(game => (
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
              <div className="flex items-center gap-small">
                <span className="text-body-medium content-default">
                  {screentimeUtils.getCompactFormattedTime(game.playTimeMinutes ?? 0, translate)}
                </span>
                <ListItemChevronTrailingAccessory />
              </div>
            }
            onSelect={() => {
              if (child) {
                parentalControlsEventService.authButtonClickSettingsPControlsTopExperiencesExperienceDetail(
                  child,
                  game.universeId,
                );
                history.push(getTopGameDetailsPath(child.userId, game.universeId));
                return;
              }
              if (!game.rootPlaceId) return;
              privacyEventService.authButtonClickSettingsTopExperiencesEdp(
                game.universeId,
                game.name,
              );
              window.location.href = getGameDetailsPagePath(game.rootPlaceId);
            }}
          />
        ))}
      </List>
    </SettingsSection>
  );
};

export default TopGames;
