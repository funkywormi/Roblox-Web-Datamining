import React, { useCallback } from "react";
import { sendUnlockPlayIntentEvent } from "../utils/playButtonUtils";
import ActionNeededButton from "./ActionNeededButton";
import playButtonConstants from "../constants/playButtonConstants";
import { PlayabilityStatus } from "../constants/playabilityStatus";
import type { TPlayButtonPageContext } from "../types/playButtonTypes";

const { counterEvents, unlockPlayIntentConstants, ampNamespaces } = playButtonConstants;

type TExperienceApprovalActionNeededButtonProps = {
  universeId: string;
  buttonClassName?: string;
  pageContext: TPlayButtonPageContext;
};

const ExperienceApprovalActionNeededButton = ({
  universeId,
  buttonClassName,
  pageContext,
}: TExperienceApprovalActionNeededButtonProps): React.JSX.Element => {
  const onButtonClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const { fireEvent } = window.EventTracker ?? {};
      fireEvent?.(counterEvents.PlayButtonUpsellExperienceApprovalTriggered);

      sendUnlockPlayIntentEvent(
        universeId,
        unlockPlayIntentConstants.experienceApprovalUpsellName,
        PlayabilityStatus.ContextualPlayabilityRequireParentApproval,
        pageContext,
      );

      if (!window.Roblox.AccessManagementUpsellV2Service) {
        fireEvent?.(counterEvents.PlayButtonUpsellExperienceApprovalError);
        return;
      }

      window.Roblox.AccessManagementUpsellV2Service.startAccessManagementUpsell({
        featureName: "CanApproveExperience",
        namespace: ampNamespaces.accountManagement,
        isAsyncCall: false,
        usePrologue: true,
        ampRecourseData: {
          universeId,
          experienceManagementAction: "Approve",
        },
      }).catch(() => {
        fireEvent?.(counterEvents.PlayButtonUpsellExperienceApprovalError);
      });
    },
    [universeId, pageContext],
  );

  return <ActionNeededButton onButtonClick={onButtonClick} buttonClassName={buttonClassName} />;
};

ExperienceApprovalActionNeededButton.defaultProps = {
  buttonClassName: undefined,
};

export default ExperienceApprovalActionNeededButton;
