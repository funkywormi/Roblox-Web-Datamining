import React, { useRef } from "react";
import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { WithTranslationsProps } from "@rbx/core-scripts/react";
import VerifiedBadgeIcon, {
  VERIFIED_BADGE_ARIA_LABEL,
  VERIFIED_BADGE_ARIA_LABEL_KEY,
} from "@rbx/www-common/components/verified-badge";
import { FeatureGamePage } from "../constants/translationConstants";
import "../../../css/common/_gameTiles.scss";

export type TCreatorLabelProps = {
  universeId: string;
  creatorName: string;
  creatorType: string;
  creatorId: number;
  linkUrl: string;
  isCreatorVerified: boolean;
  translate: WithTranslationsProps["translate"];
};

export const CreatorLabel = ({
  universeId,
  creatorName,
  creatorType,
  creatorId,
  linkUrl,
  isCreatorVerified,
  translate,
}: TCreatorLabelProps): JSX.Element => {
  const renderEl = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    sendEventWithTarget(
      "buttonClick",
      "featuredTileCreatorLabel",
      {
        creatorId,
        creatorType,
        universeId,
      },
      targetTypes.WWW,
    );
  };

  return (
    <div ref={renderEl} className="game-card-creator-name" data-testid="game-card-creator-name">
      <span className="text-label creator-name-label">
        {translate(FeatureGamePage.LabelByPrefix)}&nbsp;
      </span>
      <a
        href={linkUrl}
        onClick={() => handleClick()}
        className="text-overflow text-label creator-name"
      >
        {creatorName}
      </a>
      {isCreatorVerified && (
        <VerifiedBadgeIcon
          size="Medium"
          titleText={translate(VERIFIED_BADGE_ARIA_LABEL_KEY, undefined, VERIFIED_BADGE_ARIA_LABEL)}
        />
      )}
    </div>
  );
};

export default CreatorLabel;
