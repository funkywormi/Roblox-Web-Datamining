import React from "react";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  ThumbnailGameIconSize,
} from "roblox-thumbnails";
import { Button, IconButton, Popover } from "react-style-guide";
import { useTranslation } from "react-utilities";
import { AccessManagementUpsellV2Service } from "Roblox";
import { authenticatedUser } from "header-scripts";
import classNames from "classnames";
import { ParentalControlsErrorCode, useSnackbar } from "@rbx/user-settings";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import { TContentMaturityRating, TGameCreator } from "../../../../../types/gamesTypes";
import useSettingsModal, {
  useSettingsInfoModal,
} from "../../../../common/hooks/modals/useSettingsModal";
import { useGetParentalConsentsQuery } from "../../../../apis/parentalControlsApi";
import baseApi from "../../../../apis/common/baseApi";
import ApiCacheTag from "../../../../apis/common/cacheTagEnum";
import { useAppDispatch } from "../../../../redux/hooks";
import useCancelConsentRequestModal from "../../../../common/hooks/modals/useCancelConsentRequestModal";
import {
  ManagementAction,
  ParentConsentStatus,
  ParentConsentType,
  TGrantConsentRequest,
} from "../../../../../types/parentConsentsTypes";
import { useManageChildBlockedExperiencesMutation } from "../../../../apis/experienceBlockingApi";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import screentimeUtils from "../../../utils/parentalControls/screentime/screentimeUtils";
import { getGameDetailsPagePath } from "../../../constants/urlConstants";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import AMPFeaturesConstants from "../../../constants/AMPFeaturesConstants";
import parentalControlsEventService from "../../../services/eventServices/parentalControlsEventService";
import privacyEventService from "../../../services/eventServices/privacyEventService";

export type TGameData = {
  universeId: number;
  name: string;
  playTimeMinutes?: number;
  rootPlaceId?: number;
  maturityRating?: string;
  contentMaturity?: TContentMaturityRating;
  genre_l1?: string; // Primary genre
  genre_l2?: string; // Subgenre
  creator?: TGameCreator;
  isBlocked?: boolean;
  isApproved?: boolean;
  disabled?: boolean;
};

type TPlaytimeGameTileProps = {
  gameData: TGameData;
  showPopover?: boolean;
  showManagementButton?: boolean;
  child?: TChildInfo;
  sessionId?: string;
  onRevokeApproval?: () => void;
};

const GameTile = ({
  gameData,
  showPopover,
  showManagementButton,
  child,
  sessionId,
  onRevokeApproval,
}: TPlaytimeGameTileProps): JSX.Element => {
  const { perExperienceScreentime } = parentalControlsTranslationConstants;

  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const dispatch = useAppDispatch();

  const [manageBlockedExperiences] = useManageChildBlockedExperiencesMutation();
  const { data: parentalConsents } = useGetParentalConsentsQuery({
    childUserId: child?.userId ?? authenticatedUser.id!,
    consentStatus: ParentConsentStatus.Pending,
    consentType: ParentConsentType.ManageExperience,
  });
  const pendingConsent = parentalConsents?.consents.find(
    consent => consent.consentData?.universeId === gameData.universeId,
  );

  const iconSize = ThumbnailGameIconSize.size256;

  const [maxBlockedExperiencesModal, maxBlockedExperiencesModalService] = useSettingsInfoModal(
    parentalControlsTranslationConstants.perExperienceScreentime.cantBlockExperience,
    parentalControlsTranslationConstants.perExperienceScreentime.maximumExperiencesBlocked,
  );

  const manageExperience = async (action: ManagementAction) => {
    if (child) {
      try {
        const request: TGrantConsentRequest = {
          childUserId: child.userId,
          consentType: ParentConsentType.ManageExperience,
          details: {
            experienceManagementAction: action,
            universeId: gameData.universeId,
          },
        };
        await manageBlockedExperiences(request).unwrap();

        snackbarService.success(
          translate(
            gameData?.isBlocked
              ? perExperienceScreentime.unblockExperienceSuccess
              : perExperienceScreentime.blockExperienceSuccess,
            {
              experienceName: gameData.name,
            },
          ),
        );
      } catch (error) {
        const errorCode = error as ParentalControlsErrorCode;
        if (errorCode === ParentalControlsErrorCode.ExperienceBlockingLimitReached) {
          parentalControlsEventService.authModalShownSettingsPControlsBlockedExperiencesCantBlock(
            child,
            gameData.universeId,
            sessionId,
          );
          maxBlockedExperiencesModalService.open();
        } else {
          snackbarService.warning(translate(commonTranslationConstants.unknownError));
        }
      }
    }
  };

  const showViewDetails = gameData.rootPlaceId && gameData.name;
  const handleViewDetails = () => {
    if (showManagementButton) {
      if (child) {
        parentalControlsEventService.authButtonClickSettingsPControlsBlockedExperiencesEdp(
          child,
          gameData.universeId,
          gameData.name,
        );
      } else {
        privacyEventService.authButtonClickSettingsBlockedExperiencesEdp(
          gameData.universeId,
          gameData.name,
        );
      }
    } else if (showPopover) {
      if (child) {
        parentalControlsEventService.authButtonClickSettingsPControlsTopExperiencesEdp(
          child,
          gameData.universeId,
          gameData.name,
        );
      } else {
        privacyEventService.authButtonClickSettingsTopExperiencesEdp(
          gameData.universeId,
          gameData.name,
        );
      }
    }
    window.location.href = getGameDetailsPagePath(gameData.rootPlaceId!);
  };

  // Modal for revoking consent request
  const [cancelConsentRequestModal, cancelConsentRequestModalService] =
    useCancelConsentRequestModal({
      pendingConsent,
    });

  const requestParentalConsent = async () => {
    try {
      await AccessManagementUpsellV2Service.startAccessManagementUpsell({
        featureName: AMPFeaturesConstants.CanRemoveParentManagedExperienceBlocks,
        isAsyncCall: false,
        usePrologue: true,
        ampRecourseData: {
          universeId: gameData.universeId,
          experienceManagementAction: ManagementAction.Unblock,
          experienceName: gameData.name,
        },
      }).finally(() => {
        const invalidCacheTags = [ApiCacheTag.ParentalConsentsType];
        const invalidateAction = baseApi.util.invalidateTags(invalidCacheTags);
        dispatch(invalidateAction);
      });
    } catch (e) {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
  };

  const [confirmUnblockModal, confirmUnblockModalService] = useSettingsModal({
    titleResourceId: perExperienceScreentime.confirmUnblock,
    bodyResourceId: perExperienceScreentime.confirmUnblockExperience,
    actionButtonTextResourceId: perExperienceScreentime.unblockButton,
    neutralButtonTextResourceId: commonTranslationConstants.cancel,
    onAction: async () => {
      if (child) {
        parentalControlsEventService.authButtonClickSettingsPControlsBlockedExperiencesConfirmUnblock(
          child,
          gameData.universeId,
        );
      }
      await manageExperience(ManagementAction.Unblock);
    },
    onNeutral: () => {
      if (child) {
        parentalControlsEventService.authButtonClickSettingsPControlsBlockedExperiencesCancelUnblock(
          child,
          gameData.universeId,
        );
      }
    },
  });
  const [confirmBlockModal, confirmBlockModalService] = useSettingsModal({
    titleResourceId: perExperienceScreentime.confirmBlock,
    bodyResourceId: perExperienceScreentime.confirmBlockExperience,
    actionButtonTextResourceId: perExperienceScreentime.blockButton,
    neutralButtonTextResourceId: commonTranslationConstants.cancel,
    onAction: async () => {
      if (child) {
        parentalControlsEventService.authButtonClickSettingsPControlsBlockedExperiencesConfirmBlock(
          child,
          gameData.universeId,
          sessionId,
        );
      }
      await manageExperience(ManagementAction.Block);
    },
    onNeutral: () => {
      if (child) {
        parentalControlsEventService.authButtonClickSettingsPControlsBlockedExperiencesCancelBlock(
          child,
          gameData.universeId,
          sessionId,
        );
      }
    },
  });

  const handleManageExperience = (action: ManagementAction) => {
    if (action === ManagementAction.Block) {
      confirmBlockModalService.open();
    } else {
      confirmUnblockModalService.open();
    }
  };

  const toggleManageExperience = () => {
    handleManageExperience(gameData.isBlocked ? ManagementAction.Unblock : ManagementAction.Block);
  };

  const getManagementButton = (): JSX.Element => {
    const pendingRequestButton = (
      <Button
        className="experience-management-btn"
        variant={Button.variants.control}
        onClick={cancelConsentRequestModalService.open}
        width={Button.widths.full}
      >
        <span className="icon-uiblox-pending themified-icon" />
        {translate(commonTranslationConstants.pending)}
      </Button>
    );

    const unblockButton = (
      <Button
        className="experience-management-btn"
        variant={Button.variants.control}
        onClick={async () => {
          if (child) {
            parentalControlsEventService.authButtonClickSettingsPControlsBlockedExperiencesUnblock(
              child,
              gameData.universeId,
            );
            parentalControlsEventService.authModalShownSettingsPControlsBlockedExperiencesConfirmUnblock(
              child,
              gameData.universeId,
            );
            handleManageExperience(ManagementAction.Unblock);
          } else {
            await requestParentalConsent();
          }
        }}
        width={Button.widths.full}
        isDisabled={gameData.disabled}
      >
        {!child && <span className="icon-status-private themified-icon" />}
        {gameData.disabled
          ? translate(perExperienceScreentime.blockedButton)
          : translate(perExperienceScreentime.unblockButton)}
      </Button>
    );

    const blockButton = (
      <Button
        variant={Button.variants.control}
        onClick={() => {
          if (child) {
            parentalControlsEventService.authButtonClickSettingsPControlsBlockedExperiencesBlock(
              child,
              gameData.universeId,
              sessionId,
            );
            parentalControlsEventService.authModalShownSettingsPControlsBlockedExperiencesConfirmBlock(
              child,
              gameData.universeId,
              sessionId,
            );
          }
          handleManageExperience(ManagementAction.Block);
        }}
        width={Button.widths.full}
      >
        {translate(perExperienceScreentime.blockButton)}
      </Button>
    );

    if (!child && pendingConsent) {
      return pendingRequestButton;
    }

    return gameData.isBlocked ? unblockButton : blockButton;
  };

  const getPopoverManagementButton = (): JSX.Element => {
    return (
      <Button
        variant={Button.variants.secondary}
        onClick={() => {
          if (child && showPopover && !gameData.isBlocked) {
            parentalControlsEventService.authButtonClickSettingsPControlsTopExperiencesBlock(
              child,
              gameData.universeId,
            );
          }
          toggleManageExperience();
        }}
      >
        {translate(
          gameData.isBlocked
            ? perExperienceScreentime.unblockButton
            : perExperienceScreentime.blockButton,
        )}
      </Button>
    );
  };

  const classes = classNames("game-card-container grid-item-container", {
    "game-card-disabled": gameData.disabled,
  });

  return (
    <React.Fragment>
      <div className={classes} data-testid="playtime-game-tile">
        <div className="game-card-link">
          <div
            className="game-thumbnail-wrapper"
            role="button"
            tabIndex={0}
            onClick={handleViewDetails}
            onKeyPress={e => {
              if (e.key === "Enter") {
                handleViewDetails();
              }
            }}
          >
            <Thumbnail2d
              type={ThumbnailTypes.gameIcon}
              size={iconSize}
              targetId={gameData.universeId}
              containerClass="game-card-thumb-container"
              format={ThumbnailFormat.jpeg}
              altName={gameData.name}
            />
          </div>

          <div className="game-title-container">
            <div className="game-card-name game-name-title" title={gameData.name}>
              {gameData.name}
            </div>

            {showPopover && (
              <Popover
                id={`game-management-dropdown-${gameData.universeId}`}
                button={
                  <IconButton
                    className="game-management-menu"
                    iconName="overflow-vertical"
                    size={IconButton.sizes.small}
                    onClick={() => {
                      // onClick is not an optional parameter for a Button but is not needed for the popover
                    }}
                    altName={translate(commonTranslationConstants.manage)}
                  />
                }
                trigger="click"
                containerPadding={12}
                placement="bottom"
              >
                <ul className="dropdown-menu" role="menu">
                  {child && !gameData.isApproved && <li>{getPopoverManagementButton()}</li>}
                  {gameData.isApproved && onRevokeApproval && (
                    <li>
                      <Button variant={Button.variants.secondary} onClick={onRevokeApproval}>
                        {translate(
                          parentalControlsTranslationConstants.approvedExperiences
                            .removeFromApproved,
                        )}
                      </Button>
                    </li>
                  )}
                  {showViewDetails && (
                    <li>
                      <Button variant={Button.variants.secondary} onClick={handleViewDetails}>
                        {translate(perExperienceScreentime.viewDetailsButton)}
                      </Button>
                    </li>
                  )}
                </ul>
              </Popover>
            )}
          </div>

          <div className="game-card-info">
            {gameData.disabled && !showManagementButton ? (
              <span className="info-label">
                {translate(perExperienceScreentime.blockedExperienceDescription)}
              </span>
            ) : (
              <React.Fragment>
                <span className="info-label">
                  {screentimeUtils.generateRatingDisplay(
                    translate(perExperienceScreentime.maturityRatingLabel),
                    translate(perExperienceScreentime.unratedExperienceLabel),
                    gameData.maturityRating, // Localized by default
                  )}
                </span>

                {gameData.playTimeMinutes && (
                  <span className="info-label">
                    {screentimeUtils.generatePlaytimeString(
                      translate(perExperienceScreentime.screentimeLabel),
                      translate(perExperienceScreentime.timeLabels.hours),
                      translate(perExperienceScreentime.timeLabels.hour),
                      translate(perExperienceScreentime.timeLabels.minutes),
                      translate(perExperienceScreentime.timeLabels.minute),
                      gameData.playTimeMinutes,
                    )}
                  </span>
                )}
              </React.Fragment>
            )}
          </div>
        </div>
        {showManagementButton && getManagementButton()}
      </div>
      {cancelConsentRequestModal}
      {confirmUnblockModal}
      {confirmBlockModal}
      {maxBlockedExperiencesModal}
    </React.Fragment>
  );
};

export default GameTile;
