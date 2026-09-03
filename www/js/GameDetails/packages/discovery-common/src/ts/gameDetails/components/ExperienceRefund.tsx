import React from "react";
import { getHelpDeskUrl } from "@rbx/core-scripts/util/url";
import { Button, Link } from "@rbx/core-ui";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { gameDetailsPage, homePage } from "../../common/constants/configConstants";
import { FeatureGameDetails } from "../../common/constants/translationConstants";
import { TGetGameDetails, TRefundPolicy } from "../../common/types/bedev1Types";
import { sendRequestRefundEvent } from "../utils/refundButtonUtils";

type TRefundPolicyTextProps = {
  policyData: TRefundPolicy;
};

const RefundPolicyText: React.FC<TRefundPolicyTextProps> = ({ policyData }) => {
  const { policyText, learnMoreBaseUrl, locale, articleId } = policyData;
  const { linkStartDelimiter, linkEndDelimiter } = homePage;

  const learnMoreLink = getHelpDeskUrl(locale, articleId, learnMoreBaseUrl);

  const policyTextLinkRegex = new RegExp(`${linkStartDelimiter}|${linkEndDelimiter}`);

  // policyText contains at most one link, delimited by linkStart/linkEnd, so
  // the split yields [beforeLink, linkText, afterLink]. Only the middle
  // segment is rendered as a link; the rest is plain text.
  const [beforeLink, linkText, ...afterLink] = policyText.split(policyTextLinkRegex);

  return (
    <p>
      {beforeLink}
      {linkText != null && (
        <Link cssClasses="text-link" url={learnMoreLink}>
          {linkText}
        </Link>
      )}
      {afterLink.join("")}
    </p>
  );
};

export type TExperienceRefundProps = {
  gameDetails: TGetGameDetails;
  translate: TranslateFunction;
};

const ExperienceRefund: React.FC<TExperienceRefundProps> = ({ gameDetails, translate }) => {
  const { refundLink, refundPolicy, rootPlaceId } = gameDetails;
  return (
    <div className="experience-refund-container">
      <div className="container-header">
        <h2>{translate(FeatureGameDetails.HeadingRefund)}</h2>
      </div>
      <div className="experience-refund-content">
        {!!refundPolicy && <RefundPolicyText policyData={refundPolicy} />}
        {refundLink && (
          <div className="experience-refund-button">
            <Link url={refundLink}>
              <Button
                variant="secondary"
                onClick={() => {
                  if (rootPlaceId) {
                    sendRequestRefundEvent(rootPlaceId);
                  } else {
                    window.EventTracker?.fireEvent(gameDetailsPage.requestRefundError);
                  }
                }}
              >
                <span>{translate(FeatureGameDetails.ActionRequestRefund)}</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperienceRefund;
