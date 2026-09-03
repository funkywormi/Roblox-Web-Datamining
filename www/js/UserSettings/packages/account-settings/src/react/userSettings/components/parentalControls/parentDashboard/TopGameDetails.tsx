import React, { useMemo } from "react";
import { Redirect, useParams } from "react-router-dom";
import { useTranslation } from "react-utilities";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  ThumbnailGameIconSize,
} from "roblox-thumbnails";
import { BadgeSizes, VerifiedBadgeIconContainer } from "roblox-badges";
import { Badge, Button, ProgressCircle } from "@rbx/foundation-ui";
import {
  useSettingsInfoModal,
  useSettingsModal,
  ParentalControlsErrorCode,
  useSnackbar,
} from "@rbx/user-settings";
import SettingsSection from "../../../../common/components/SettingsSection";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import {
  ManagementAction,
  ParentConsentType,
  TGrantConsentRequest,
} from "../../../../../types/parentConsentsTypes";
import useTopWeeklyGames from "../../../hooks/useTopWeeklyGames";
import { useManageChildBlockedExperiencesMutation } from "../../../../apis/experienceBlockingApi";
import { selectChildPagesForChildUserId } from "../../../../apis/slices/childPagesSlice";
import { useAppSelector } from "../../../../redux/hooks";
import parentalControlsEventService from "../../../services/eventServices/parentalControlsEventService";
import screentimeUtils from "../../../utils/parentalControls/screentime/screentimeUtils";
import { getGameDetailsPagePath } from "../../../constants/urlConstants";

const TopGameDetails = ({ child }: { child: TChildInfo }): JSX.Element | null => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const { universeId: universeIdParam } = useParams<{ universeId: string }>();
  const universeId = Number(universeIdParam);

  const { games, isLoading } = useTopWeeklyGames(child);
  const childPages = useAppSelector(selectChildPagesForChildUserId(child.userId));

  const game = useMemo(() => games.find(g => g.universeId === universeId), [games, universeId]);

  const { perExperienceScreentime, topGames, contentMaturity } =
    parentalControlsTranslationConstants;

  const [manageBlockedExperiences] = useManageChildBlockedExperiencesMutation();
  const [maxBlockedModal, maxBlockedModalService] = useSettingsInfoModal(
    translate(perExperienceScreentime.cantBlockExperience),
    translate(perExperienceScreentime.maximumExperiencesBlocked),
    translate(commonTranslationConstants.ok),
    translate(commonTranslationConstants.modal.closeBtn),
  );

  const manageGame = async (action: ManagementAction) => {
    if (!game) return;
    try {
      const request: TGrantConsentRequest = {
        childUserId: child.userId,
        consentType: ParentConsentType.ManageExperience,
        details: {
          experienceManagementAction: action,
          universeId: game.universeId,
        },
      };
      await manageBlockedExperiences(request).unwrap();

      snackbarService.success(
        translate(
          game.isBlocked
            ? perExperienceScreentime.unblockExperienceSuccess
            : perExperienceScreentime.blockExperienceSuccess,
          { experienceName: game.name },
        ),
      );
    } catch (error) {
      const errorCode = error as ParentalControlsErrorCode;
      if (errorCode === ParentalControlsErrorCode.ExperienceBlockingLimitReached) {
        maxBlockedModalService.open();
      } else {
        snackbarService.warning(translate(commonTranslationConstants.unknownError));
      }
    }
  };

  const [confirmUnblockModal, confirmUnblockModalService] = useSettingsModal({
    translatedTitle: translate(perExperienceScreentime.confirmUnblock),
    translatedBody: translate(perExperienceScreentime.confirmUnblockExperience),
    translatedActionButtonText: translate(perExperienceScreentime.unblockButton),
    translatedSecondaryButtonText: translate(commonTranslationConstants.cancel),
    translatedCloseLabel: translate(commonTranslationConstants.modal.closeBtn),
    onAction: () => manageGame(ManagementAction.Unblock),
  });
  const [confirmBlockModal, confirmBlockModalService] = useSettingsModal({
    translatedTitle: translate(perExperienceScreentime.confirmBlock),
    translatedBody: translate(perExperienceScreentime.confirmBlockExperience),
    translatedActionButtonText: translate(perExperienceScreentime.blockButton),
    translatedSecondaryButtonText: translate(commonTranslationConstants.cancel),
    translatedCloseLabel: translate(commonTranslationConstants.modal.closeBtn),
    onAction: () => manageGame(ManagementAction.Block),
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
    return childPages?.topGamesPage.path ? <Redirect to={childPages.topGamesPage.path} /> : null;
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
      parentalControlsEventService.authButtonClickSettingsPControlsTopExperiencesEdp(
        child,
        game.universeId,
        game.name,
      );
      window.location.href = gameDetailsUrl;
    }
  };

  const onToggleBlock = () => {
    if (game.isBlocked) {
      confirmUnblockModalService.open();
    } else {
      parentalControlsEventService.authButtonClickSettingsPControlsTopExperiencesBlock(
        child,
        game.universeId,
      );
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
            {creatorHasVerifiedBadge && <VerifiedBadgeIconContainer size={BadgeSizes.SUBHEADER} />}
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
                onClick={() =>
                  parentalControlsEventService.authButtonClickSettingsPControlsTopExperiencesEdp(
                    child,
                    game.universeId,
                    game.name,
                  )
                }
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
              {child.canParentManageChildsExperiences && (
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
            {child.canParentManageChildsExperiences && (
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

export default TopGameDetails;
