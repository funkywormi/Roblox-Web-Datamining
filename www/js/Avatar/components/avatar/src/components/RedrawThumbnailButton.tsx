import React, { useCallback, useState } from "react";
import { useTranslations } from "@rbx/www-common/i18n";
import { Link } from "@rbx/foundation-ui";
import { reportAXError } from "../utils/axAnalyticsService";
import AvatarAPIService, { ErrorData } from "../services/avatarAPIService";
import { useSystemFeedback } from "../contexts/SystemFeedbackContext";
import avatarConstants from "../constants/avatarConstants";
import parseError from "../utils/parseErrorUtil";
import { trackEditAttempted, trackEditFailed, trackEditSucceeded } from "../observability";

interface RedrawThumbnailButtonProps {
  forceRefreshThumbnail: () => void;
}

function RedrawThumbnailButton({
  forceRefreshThumbnail,
}: RedrawThumbnailButtonProps): React.ReactElement {
  const translate = useTranslations("Feature.Avatar");
  const systemFeedback = useSystemFeedback();

  const [redrawFloodchecked, setRedrawFloodchecked] = useState(false);

  const redrawThumbnail = useCallback(() => {
    trackEditAttempted("redraw");
    AvatarAPIService.redrawThumbnail().then(
      () => {
        trackEditSucceeded("redraw");
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
          trackEditFailed("redraw", response);
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
      <Link
        as="button"
        variant="Standalone"
        underline="always"
        className="redraw-link"
        disabled={redrawFloodchecked}
        onClick={redrawThumbnail}
      >
        {translate("Action.Redraw")}
      </Link>
    </div>
  );
}

export default RedrawThumbnailButton;
