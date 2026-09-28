import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-utilities";
import { ParentalControlsErrorCode, useSnackbar } from "@rbx/user-settings";
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
import GameDetailsSection, {
  ManageExperienceOutcome,
  TManageExperienceOutcome,
} from "../shared/GameDetailsSection";
import parentalControlsEventService from "../../../services/eventServices/parentalControlsEventService";

const TopGameDetails = ({ child }: { child: TChildInfo }): JSX.Element | null => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const { universeId: universeIdParam } = useParams<{ universeId: string }>();
  const universeId = Number(universeIdParam);

  const { games, isLoading } = useTopWeeklyGames(child);
  const childPages = useAppSelector(selectChildPagesForChildUserId(child.userId));

  const game = useMemo(() => games.find(g => g.universeId === universeId), [games, universeId]);

  const { perExperienceScreentime } = parentalControlsTranslationConstants;

  const [manageBlockedExperiences] = useManageChildBlockedExperiencesMutation();

  const manageExperience = async (action: ManagementAction): Promise<TManageExperienceOutcome> => {
    if (!game) return ManageExperienceOutcome.Settled;
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
        return ManageExperienceOutcome.MaxBlockedReached;
      }
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
    return ManageExperienceOutcome.Settled;
  };

  return (
    <GameDetailsSection
      game={game}
      isLoading={isLoading}
      listPath={childPages?.topGamesPage.path}
      canManageExperiences={child.canParentManageChildsExperiences === true}
      manageExperience={manageExperience}
      onViewMoreClick={() => {
        if (!game) return;
        parentalControlsEventService.authButtonClickSettingsPControlsTopExperiencesEdp(
          child,
          game.universeId,
          game.name,
        );
      }}
      onBlockClick={() => {
        if (!game) return;
        parentalControlsEventService.authButtonClickSettingsPControlsTopExperiencesBlock(
          child,
          game.universeId,
        );
      }}
    />
  );
};

export default TopGameDetails;
