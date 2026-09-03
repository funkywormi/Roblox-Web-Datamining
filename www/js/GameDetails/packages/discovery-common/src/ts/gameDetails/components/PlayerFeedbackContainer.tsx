import { withTranslations } from "@rbx/core-scripts/react";
import React, { Fragment, useCallback } from "react";
import { createSystemFeedback } from "@rbx/core-ui";
import PlayerFeedbackBanner from "./PlayerFeedbackBanner";
import { playerFeedbackTranslationConfig } from "../translation.config";
import { ReviewCategoryType } from "../services/playerFeedbackService";

export type PlayerFeedbackContainer = {
  show: boolean;
  voteType?: ReviewCategoryType;
  placeId: string;
  universeId: string;
};

const PlayerFeedbackContainer: React.FC<PlayerFeedbackContainer> = props => {
  const [SystemFeedback, systemFeedbackService] = createSystemFeedback();

  const showSuccessMessage = useCallback(
    (message: string) => systemFeedbackService.success(message),
    [systemFeedbackService],
  );

  return (
    <Fragment>
      <div className="player-feedback-alert-container">
        <SystemFeedback />
      </div>
      <PlayerFeedbackBanner {...props} showSuccessMessage={showSuccessMessage} />
    </Fragment>
  );
};

export default withTranslations(PlayerFeedbackContainer, playerFeedbackTranslationConfig);
