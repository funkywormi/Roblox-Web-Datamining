import React, { useCallback, useEffect, useState } from "react";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import {
  TChannelInformation,
  getChannelInformation,
  ReviewCategoryType,
} from "../services/playerFeedbackService";
import PlayerFeedbackModal from "./PlayerFeedbackModal";
import { sendPlayerFeedbackEvent } from "../utils/playerFeedbackUtils";
import {
  CommonUIMessages,
  PlayerFeedbacksVoteForm,
} from "../../common/constants/translationConstants";
import { playerFeedbackTranslationConfig } from "../translation.config";

export type PlayerFeedbackBannerProps = {
  show: boolean;
  voteType?: ReviewCategoryType;
  placeId: string;
  universeId: string;
  showSuccessMessage: (message: string) => void;
} & WithTranslationsProps;

const PlayerFeedbackBanner: React.FC<PlayerFeedbackBannerProps> = ({
  show,
  voteType,
  placeId,
  universeId,
  showSuccessMessage,
  translate,
}) => {
  const [userIsEligible, setUserIsEligible] = useState(false);
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);
  const [channelInformation, setChannelInformation] = useState<TChannelInformation | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    const _ = getChannelInformation(placeId)
      .then(channelInfo => {
        setChannelInformation(channelInfo);
        if (channelInfo.data.capabilities.can_submit_comment) {
          setUserIsEligible(true);
        }
      })
      .catch();
  }, [placeId]);

  useEffect(() => {
    setVisible(show);
  }, [show, voteType]); // We may show the banner again if the user changes their vote

  useEffect(() => {
    sendPlayerFeedbackEvent("playerFeedbackPromptMounted", placeId);
  }, [placeId]);

  const onGiveFeedbackClick = useCallback(() => {
    setShowFeedbackModal(true);
    sendPlayerFeedbackEvent("clickPlayerFeedbackPromptCta", placeId);
  }, [placeId]);

  const onHideBannerClick = useCallback(() => {
    setVisible(false);
    sendPlayerFeedbackEvent("dismissPlayerFeedbackPrompt", placeId);
  }, [placeId]);

  if (!visible || !userIsEligible || !channelInformation || !voteType || hasSubmittedFeedback) {
    return null;
  }
  return (
    <div className="message-banner player-feedback-banner">
      <div className="player-feedback-banner-title">
        {translate(PlayerFeedbacksVoteForm.PromptBannerTitleOnly)}
      </div>
      <button type="button" className="btn-secondary-md" onClick={onGiveFeedbackClick}>
        {translate(PlayerFeedbacksVoteForm.PromptBannerGiveFeedbackButton)}
      </button>
      <button
        type="button"
        className="btn-generic-close-md close-button"
        aria-label={translate(CommonUIMessages.ActionClose)}
        onClick={onHideBannerClick}
      >
        <span className="icon-close" />
      </button>
      {showFeedbackModal && (
        <PlayerFeedbackModal
          voteType={voteType}
          hideModal={() => {
            setShowFeedbackModal(false);
            setVisible(false);
          }}
          hideBannerUntilReload={() => {
            // There's a cooldown for reviews: we assume this will last at least until this component rerenders
            setHasSubmittedFeedback(true);
          }}
          showSuccessMessage={showSuccessMessage}
          channelInformation={channelInformation}
          placeId={placeId}
          universeId={universeId}
          translate={translate}
        />
      )}
    </div>
  );
};

export default withTranslations(PlayerFeedbackBanner, playerFeedbackTranslationConfig);
