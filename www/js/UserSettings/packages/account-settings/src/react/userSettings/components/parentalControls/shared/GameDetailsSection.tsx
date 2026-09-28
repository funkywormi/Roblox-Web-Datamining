import React from "react";
import { Redirect } from "react-router-dom";
import { useTranslation } from "react-utilities";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  ThumbnailGameIconSize,
} from "roblox-thumbnails";
import VerifiedBadgeIcon, {
  VERIFIED_BADGE_ARIA_LABEL,
  VERIFIED_BADGE_ARIA_LABEL_KEY,
} from "@rbx/www-common/components/verified-badge";
import { Badge, Button, ProgressCircle } from "@rbx/foundation-ui";
import { useSettingsInfoModal, useSettingsModal } from "@rbx/user-settings";
import SettingsSection from "../../../../common/components/SettingsSection";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import { ManagementAction } from "../../../../../types/parentConsentsTypes";
import { TGameData } from "../parentDashboard/GameTile";
import screentimeUtils from "../../../utils/parentalControls/screentime/screentimeUtils";
import { getGameDetailsPagePath } from "../../../constants/urlConstants";

/** What the caller's block or unblock attempt did, which decides whether the limit notice opens. */
export const ManageExperienceOutcome = {
  Settled: "Settled",
  MaxBlockedReached: "MaxBlockedReached",
} as const;

export type TManageExperienceOutcome =
  (typeof ManageExperienceOutcome)[keyof typeof ManageExperienceOutcome];

/**
 * One experience from the child's top-games list: playtime, content maturity, genre, and the block
 * control. A remote parent blocks by granting consent directly, while an on-device parent goes
 * through the parent PIN first, so `manageExperience` belongs to the caller. So do the analytics
 * hooks, since the two surfaces attribute a click differently.
 */
export const GameDetailsSection = ({
  game,
  isLoading,
  listPath,
  canManageExperiences,
  manageExperience,
  onViewMoreClick,
  onBlockClick,
}: {
  game: TGameData | undefined;
  isLoading: boolean;
  /** Where an unknown universe id bounces back to. */
  listPath: string | undefined;
  canManageExperiences: boolean;
  /** Runs the action and reports whether the child is already at the blocked-experience limit. */
  manageExperience: (action: ManagementAction) => Promise<TManageExperienceOutcome>;
  onViewMoreClick?: () => void;
  onBlockClick?: () => void;
}): JSX.Element | null => {
  const { translate } = useTranslation();

  const { perExperienceScreentime, topGames, contentMaturity } =
    parentalControlsTranslationConstants;

  const [maxBlockedModal, maxBlockedModalService] = useSettingsInfoModal(
    translate(perExperienceScreentime.cantBlockExperience),
    translate(perExperienceScreentime.maximumExperiencesBlocked),
    translate(commonTranslationConstants.ok),
    translate(commonTranslationConstants.modal.closeBtn),
  );
  const runManageExperience = async (action: ManagementAction) => {
    if ((await manageExperience(action)) === ManageExperienceOutcome.MaxBlockedReached) {
      maxBlockedModalService.open();
    }
  };

  const [confirmUnblockModal, confirmUnblockModalService] = useSettingsModal({
    translatedTitle: translate(perExperienceScreentime.confirmUnblock),
    translatedBody: translate(perExperienceScreentime.confirmUnblockExperience),
    translatedActionButtonText: translate(perExperienceScreentime.unblockButton),
    translatedSecondaryButtonText: translate(commonTranslationConstants.cancel),
    translatedCloseLabel: translate(commonTranslationConstants.modal.closeBtn),
    onAction: () => runManageExperience(ManagementAction.Unblock),
  });
  const [confirmBlockModal, confirmBlockModalService] = useSettingsModal({
    translatedTitle: translate(perExperienceScreentime.confirmBlock),
    translatedBody: translate(perExperienceScreentime.confirmBlockExperience),
    translatedActionButtonText: translate(perExperienceScreentime.blockButton),
    translatedSecondaryButtonText: translate(commonTranslationConstants.cancel),
    translatedCloseLabel: translate(commonTranslationConstants.modal.closeBtn),
    onAction: () => runManageExperience(ManagementAction.Block),
  });

  if (!game) {
    if (isLoading) {
      return (
        <SettingsSection>
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
    // The screentime query has resolved and this universeId isn't in the
    // child's top-games list, so the URL is invalid (typo, stale link, etc.).
    // Bounce the user up to the list rather than rendering an empty page.
    return listPath ? <Redirect to={listPath} /> : null;
  }

  const playtimeLabel = screentimeUtils.getCompactFormattedTime(
    game.playTimeMinutes ?? 0,
    translate,
  );

  const maturityLevel = screentimeUtils.contentMaturityToLevel(game.contentMaturity);
  const maturityRatingName = maturityLevel
    ? translate(contentMaturity.optionTitlesV2[maturityLevel])
    : game.maturityRating || translate(perExperienceScreentime.unratedExperienceLabel);
  const contentMaturityTitle = translate(topGames.contentMaturityBoxTitle, {
    maturityRating: maturityRatingName,
  });
  const contentMaturityDescription = maturityLevel
    ? translate(contentMaturity.optionDescriptionsV2[maturityLevel])
    : translate(perExperienceScreentime.unratedExperienceLabel);

  const gameDetailsUrl = game.rootPlaceId ? getGameDetailsPagePath(game.rootPlaceId) : undefined;

  const onViewMore = () => {
    if (gameDetailsUrl) {
      onViewMoreClick?.();
      window.location.href = gameDetailsUrl;
    }
  };

  const onToggleBlock = () => {
    if (game.isBlocked) {
      confirmUnblockModalService.open();
    } else {
      onBlockClick?.();
      confirmBlockModalService.open();
    }
  };

  const creatorName = game.creator?.name;
  const creatorHasVerifiedBadge = game.creator?.hasVerifiedBadge;
  const genreLabel = screentimeUtils.getGenreLabel(game);

  const headerContent = (
    <React.Fragment>
      <div className="size-1400 radius-medium clip flex-shrink-none">
        <Thumbnail2d
          type={ThumbnailTypes.gameIcon}
          size={ThumbnailGameIconSize.size256}
          targetId={game.universeId}
          format={ThumbnailFormat.jpeg}
          altName={game.name}
        />
      </div>
      <div className="flex flex-col fill clip-x">
        <h3 className="text-title-large content-emphasis margin-none">{game.name}</h3>
        {creatorName && (
          <span className="text-body-medium content-default flex items-center gap-xsmall">
            {creatorName}
            {creatorHasVerifiedBadge && (
              <VerifiedBadgeIcon
                size="Medium"
                titleText={translate(
                  VERIFIED_BADGE_ARIA_LABEL_KEY,
                  undefined,
                  VERIFIED_BADGE_ARIA_LABEL,
                )}
              />
            )}
          </span>
        )}
      </div>
    </React.Fragment>
  );

  const blockButtonLabel = translate(
    game.isBlocked ? topGames.unblockAction : topGames.blockAction,
  );

  return (
    <React.Fragment>
      <SettingsSection>
        <div className="flex flex-col gap-large">
          <div className="flex items-center gap-medium">
            {gameDetailsUrl ? (
              <a
                href={gameDetailsUrl}
                onClick={() => onViewMoreClick?.()}
                className="flex items-center gap-medium content-emphasis no-underline fill clip-x"
              >
                {headerContent}
              </a>
            ) : (
              <div className="flex items-center gap-medium fill clip-x">{headerContent}</div>
            )}

            {/* On medium+ screens, render action buttons right of the header */}
            <div className="hidden medium:flex gap-medium flex-shrink-none">
              {game.rootPlaceId && (
                <Button variant="Standard" size="Medium" onClick={onViewMore}>
                  {translate(topGames.viewMore)}
                </Button>
              )}
              {canManageExperiences && (
                <Button variant="Standard" size="Medium" onClick={onToggleBlock}>
                  {blockButtonLabel}
                </Button>
              )}
            </div>
          </div>

          {/* Recent activity header */}
          <div className="flex items-center justify-between">
            <h4 className="text-title-medium content-emphasis margin-none">
              {translate(topGames.recentActivity)}
            </h4>
            <Badge variant="Neutral" label={screentimeUtils.getPastWeekDateRangeLabel()} />
          </div>

          {/* Screen time card */}
          <div className="radius-large bg-shift-100 padding-large flex flex-col">
            <div className="text-heading-medium">{playtimeLabel}</div>
            <div className="text-body-medium content-default">
              {translate(topGames.screenTimeLabel)}
            </div>
          </div>

          {/* Content maturity box */}
          <div className="radius-large stroke-standard stroke-muted padding-large flex flex-col gap-xsmall">
            <div className="text-title-medium">{contentMaturityTitle}</div>
            <div className="text-body-medium content-default">{contentMaturityDescription}</div>
          </div>

          {/* Genre box */}
          {genreLabel && (
            <div className="radius-large stroke-standard stroke-muted padding-large flex flex-col gap-xsmall">
              <div className="text-title-medium">{genreLabel}</div>
            </div>
          )}

          {/* On small screens, render action buttons at the bottom */}
          <div className="flex gap-medium medium:hidden">
            {game.rootPlaceId && (
              <Button variant="Emphasis" size="Medium" className="width-full" onClick={onViewMore}>
                {translate(topGames.viewMore)}
              </Button>
            )}
            {canManageExperiences && (
              <Button
                variant="Standard"
                size="Medium"
                className="width-full"
                onClick={onToggleBlock}
              >
                {blockButtonLabel}
              </Button>
            )}
          </div>
        </div>
      </SettingsSection>
      {confirmBlockModal}
      {confirmUnblockModal}
      {maxBlockedModal}
    </React.Fragment>
  );
};

export default GameDetailsSection;
