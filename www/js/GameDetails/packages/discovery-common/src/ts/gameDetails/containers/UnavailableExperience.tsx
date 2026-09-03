import { useEffect, useRef } from "react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { sendEvent } from "@rbx/core-scripts/event-stream";
import { urlService } from "@rbx/core-scripts/legacy/core-utilities";
import { Button } from "@rbx/foundation-ui";
import { getPlayButtonContextualMessage, usePlayabilityStatus } from "@rbx/game-play-button";
import {
  CommonUIFeatures,
  CommonUIMessages,
  FeatureExperienceDetails,
} from "../../common/constants/translationConstants";
import eventStreamConstants, { EventType } from "../../common/constants/eventStreamConstants";
import metadataConstants from "../constants/metadataConstants";
import { unavailableExperienceTranslationConfig } from "../translation.config";
import errorIcon from "../images/error-icon.png";

export const UnavailableExperience = ({ translate }: WithTranslationsProps): JSX.Element => {
  const { universeId = "", placeId = "" } = metadataConstants.metadataData() || {};
  const { playabilityStatus, unplayableDisplayText } = usePlayabilityStatus(universeId);

  const hasFiredImpressionRef = useRef(false);

  useEffect(() => {
    if (hasFiredImpressionRef.current) return;
    if (playabilityStatus === undefined) return;
    hasFiredImpressionRef.current = true;
    const eventParams = eventStreamConstants[EventType.GameDetailUnavailable]({
      universeId,
      placeId,
      unplayableReason: playabilityStatus,
    });
    sendEvent(...eventParams);
  }, [universeId, placeId, playabilityStatus]);

  const resolved = getPlayButtonContextualMessage(translate, {
    playabilityStatus,
    unplayableDisplayText,
    shouldShowVpcPlayButtonUpsells: false,
  });

  const isAuthenticated = Boolean(authenticatedUser()?.isAuthenticated);
  const ctaHref = isAuthenticated
    ? urlService.getAbsoluteUrl("/home")
    : urlService.getAbsoluteUrl("/charts");
  const ctaLabel = isAuthenticated
    ? translate(CommonUIMessages.ActionReturnHome)
    : translate(CommonUIFeatures.LabelCharts);

  return (
    <div className="min-height-[70vh] flex items-center justify-center text-center padding-x-large">
      <div className="flex flex-col items-center gap-medium">
        <img className="width-[75px] height-[75px]" src={errorIcon} alt="" />
        <div className="flex flex-col gap-xsmall">
          <h3 className="text-heading-small">
            {translate(FeatureExperienceDetails.UpdateMaturitySettingModalLabelTitle)}
          </h3>
          <h4
            className="text-body-medium max-width-[320px] min-height-[3em] margin-x-auto"
            data-testid={resolved?.testId}
          >
            {resolved?.message}
          </h4>
        </div>
        <Button as="a" variant="Emphasis" size="Medium" href={ctaHref}>
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
};

export default withTranslations(UnavailableExperience, unavailableExperienceTranslationConfig);
