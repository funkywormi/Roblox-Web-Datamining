import React, { useCallback, useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { reportAXError } from "../utils/axAnalyticsService";
import AvatarAPIService, { ErrorData } from "../services/avatarAPIService";
import { useSystemFeedback } from "../contexts/SystemFeedbackContext";
import avatarConstants from "../constants/avatarConstants";
import parseError from "../utils/parseErrorUtil";

interface RedrawThumbnailButtonProps {
  forceRefreshThumbnail: () => void;
}

function RedrawThumbnailButton({ forceRefreshThumbnail }: RedrawThumbnailButtonProps): JSX.Element {
  const { translate } = useTranslation();
  const systemFeedback = useSystemFeedback();

  const [redrawFloodchecked, setRedrawFloodchecked] = useState(false);

  const redrawThumbnail = useCallback(() => {
    AvatarAPIService.redrawThumbnail().then(
      () => {
        forceRefreshThumbnail();
      },
      response => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const errorResultData = response?.data as ErrorData;

        const firstError = errorResultData?.errors?.[0];

        const floodchecked =
          firstError &&
          (firstError.code === "1" || firstError.message.toLowerCase() === "too many requests");
        if (floodchecked) {
          systemFeedback.error(avatarConstants.thumbnail.redrawFloodchecked);
          setRedrawFloodchecked(true);

          setTimeout(() => {
            setRedrawFloodchecked(false);
          }, avatarConstants.thumbnail.waitForThumbnailRegenerationInSeconds * 1000);
        } else {
          reportAXError({
            itemName: "RedrawThumbnailError",
            counterName: "AvatarEditorError",
            log: parseError(response),
          });
          systemFeedback.error(avatarConstants.thumbnail.redrawThumbnailFailed);
        }
      },
    );
  }, [forceRefreshThumbnail, systemFeedback]);

  return (
    <div className="redraw-avatar">
      {!redrawFloodchecked ? (
        <span>{translate("Label.AskIfLoadingCorrectly")}</span>
      ) : (
        <span>{translate("Label.RedrawUnavailable")}</span>
      )}
      <button
        disabled={redrawFloodchecked}
        onClick={redrawThumbnail}
        className="text-link"
        style={{
          background: "none",
          border: "none",
          margin: 0,
          padding: 0,
          textDecoration: "underline",
        }}
        type="button"
      >
        {translate("Action.Redraw")}
      </button>
    </div>
  );
}

export default RedrawThumbnailButton;
