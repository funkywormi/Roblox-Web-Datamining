import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Tooltip } from "@rbx/core-ui";
import { TranslateFunction } from "@rbx/core-scripts/react";
import {
  TChannelInformation,
  ReviewCategoryType,
  TReviewErrorResponse,
  submitReview,
} from "../services/playerFeedbackService";
import playerFeedbackConstants from "../constants/playerFeedbackConstants";
import { buildReportAbuseRevampUrl } from "../../common/utils/browserUtils";
import { sendPlayerFeedbackEvent, voteTypeToString } from "../utils/playerFeedbackUtils";
import {
  CommonUIMessages,
  PlayerFeedbacksVoteForm,
} from "../../common/constants/translationConstants";

type PlayerFeedbackModalProps = {
  voteType: ReviewCategoryType;
  hideModal: () => void;
  hideBannerUntilReload: () => void;
  showSuccessMessage: (message: string) => void;
  channelInformation: TChannelInformation;
  placeId: string;
  universeId: string;
  translate: TranslateFunction;
};

const PlayerFeedbackModal: React.FC<PlayerFeedbackModalProps> = ({
  voteType,
  hideModal,
  hideBannerUntilReload,
  showSuccessMessage,
  channelInformation,
  placeId,
  universeId,
  translate,
}) => {
  const textAreaId = "playerFeedbackTextArea";
  const maxLength = channelInformation.data.comment.maximum_length;
  const minLength = channelInformation.data.comment.minimum_length;
  const { tosUrl } = playerFeedbackConstants;
  const [disabledReason, setDisabledReason] = useState(
    translate(PlayerFeedbacksVoteForm.MessageMinLengthCharacters, { count: minLength }),
  );
  const [errorText, setErrorText] = useState("");
  const [reviewText, setReviewText] = useState("");
  const voteCategory = useMemo(
    () =>
      channelInformation.data.categories.find(
        category => category.type === voteTypeToString(voteType),
      ),
    [channelInformation, voteType],
  );

  const modalFooter: string = useMemo(() => {
    let footerText: string = channelInformation.data.metadata.disclaimer_label;
    footerText = footerText.replace(
      "<u>",
      `<a target="_blank" href="${tosUrl}" class="text-link">`,
    );
    footerText = footerText.replace("</u>", "</a>");
    return footerText;
  }, [channelInformation, tosUrl]);

  const abuseReportUrl = buildReportAbuseRevampUrl({ placeId, universeId });

  // The abuse report string is not returned by the backend at this time, so we get it
  // directly from the translator portal
  const reportFooter: string = useMemo(() => {
    let footerText = translate(PlayerFeedbacksVoteForm.MessageReportAbuseInsteadLong);
    footerText = footerText.replace(
      "<u>",
      `<a target="_blank" href="${abuseReportUrl}" class="text-link">`,
    );
    footerText = footerText.replace("</u>", "</a>");
    return footerText;
  }, [translate, abuseReportUrl]);

  useEffect(() => {
    sendPlayerFeedbackEvent("playerFeedbackFormModalMounted", placeId, voteType);
  }, [placeId, voteType]);

  const onCloseButtonPress = useCallback(() => {
    sendPlayerFeedbackEvent("dismissPlayerFeedbackFormModal", placeId, voteType);
    hideModal();
  }, [hideModal, placeId, voteType]);

  const onTextboxChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (event.target.value.length > maxLength) {
        setDisabledReason(
          translate(PlayerFeedbacksVoteForm.MessageMaxLengthCharacters, { count: maxLength }),
        );
      } else if (event.target.value.length < minLength) {
        setDisabledReason(
          translate(PlayerFeedbacksVoteForm.MessageMinLengthCharacters, { count: minLength }),
        );
      } else {
        setDisabledReason("");
      }
      setReviewText(event.target.value);
    },
    [maxLength, minLength, translate],
  );

  const handleSubmit = useCallback(async () => {
    sendPlayerFeedbackEvent("clickPlayerFeedbackFormModalSubmit", placeId, voteType);
    try {
      await submitReview(placeId, voteType, reviewText);
      setErrorText("");
      hideModal();
      hideBannerUntilReload();
      showSuccessMessage(translate(PlayerFeedbacksVoteForm.MessageSubmitSuccess));
    } catch (error) {
      const errorResponse = error as TReviewErrorResponse;
      if (errorResponse && errorResponse.data?.message) {
        setErrorText(`${errorResponse.data.message}: ${errorResponse.data.detail}`);
      } else {
        setErrorText(translate(CommonUIMessages.ResponseUnexpectedError));
      }
    }
  }, [
    hideBannerUntilReload,
    hideModal,
    placeId,
    reviewText,
    translate,
    voteType,
    showSuccessMessage,
  ]);

  const submitButton = useMemo(() => {
    return (
      // This is wrapped in a span so the tooltip renders properly
      <span>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabledReason !== ""}
          className="btn-growth-md player-feedback-button-container"
        >
          {channelInformation.data.metadata.submit_button_label}
        </button>
      </span>
    );
  }, [handleSubmit, disabledReason, channelInformation.data.metadata.submit_button_label]);

  return (
    <Modal show size="md" backdrop="static">
      <Modal.Header
        title={channelInformation.data.metadata.form_title_label}
        onClose={onCloseButtonPress}
      />
      <div className="player-feedback-modal-body">
        <div>{voteCategory?.label}</div>
        <textarea
          className="player-feedback-text-box"
          id={textAreaId}
          placeholder={channelInformation.data.comment.placeholder_text}
          onChange={onTextboxChange}
          onFocus={() => {
            sendPlayerFeedbackEvent("focusPlayerFeedbackFormModalComment", placeId, voteType);
          }}
        />
        {errorText && <div className="text-error">{errorText}</div>}
        {disabledReason ? (
          <Tooltip
            containerClassName="player-feedback-button-container"
            id="playerFeedbackTooltip"
            content={disabledReason}
            placement="bottom"
          >
            {submitButton}
          </Tooltip>
        ) : (
          <Fragment>{submitButton}</Fragment>
        )}
        {/* Note: We are OK dangerously using innerHTML here because the text is returned
        directly from the Roblox backend, with NO UGC text in the string */}
        {/* eslint-disable-next-line react/no-danger */}
        <div className="font-caption-body" dangerouslySetInnerHTML={{ __html: modalFooter }} />
        {voteType === ReviewCategoryType.Downvote && (
          // eslint-disable-next-line react/no-danger
          <div className="font-caption-body" dangerouslySetInnerHTML={{ __html: reportFooter }} />
        )}
      </div>
    </Modal>
  );
};

export default PlayerFeedbackModal;
