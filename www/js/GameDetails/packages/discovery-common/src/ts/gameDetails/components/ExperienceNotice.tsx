import React from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { FeatureGameDetails } from "../../common/constants/translationConstants";
import {
  experienceNoticeCounterEvents,
  ExperienceNoticeType,
} from "../constants/experienceNoticeConstants";

export type TExperienceNoticeProps = {
  noticeType: string;
  translate: TranslateFunction;
};

const ExperienceNotice = ({ noticeType, translate }: TExperienceNoticeProps): JSX.Element => {
  if (noticeType === ExperienceNoticeType.InExperiencePurchase) {
    return (
      <div className="experience-notice-container">
        <div className="container-header">
          <h2>{translate(FeatureGameDetails.HeadingNotice)}</h2>
        </div>
        <div>{translate(FeatureGameDetails.InExperiencePurchase)}</div>
      </div>
    );
  }

  window.EventTracker?.fireEvent(experienceNoticeCounterEvents.UnknownNoticeType);
  return <React.Fragment />;
};

export default ExperienceNotice;
