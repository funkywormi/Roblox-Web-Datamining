import React, { useMemo } from "react";
import { TranslateFunction } from "react-utilities";
import { Link } from "react-style-guide";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  ThumbnailBadgeIconSize,
} from "roblox-thumbnails";
import { TBadge } from "../types/gameBadgesTypes";
import gameBadgesUtils from "../utils/gameBadgesUtils";
import gameBadgesConstants from "../constants/gameBadgesConstants";

const { translationMap } = gameBadgesConstants;

export const GameBadge = ({
  badge,
  translate,
}: {
  badge: TBadge;
  translate: TranslateFunction;
}): JSX.Element | null => {
  const parseBadgeDetails = (badgeDetails: TBadge) => {
    const winRatePercentage = badgeDetails.statistics.winRatePercentage * 100;
    return {
      id: badgeDetails.id,
      name: badgeDetails.displayName || badgeDetails.name,
      description: badgeDetails.displayDescription || badgeDetails.description,
      winRatePercentage,
      rarityLabel: `${winRatePercentage.toFixed(1)}% (${translate(
        gameBadgesUtils.getRarityLabel(winRatePercentage),
      )})`,
      pastDayAwardedCount: badgeDetails.statistics.pastDayAwardedCount,
      awardedCount: badgeDetails.statistics.awardedCount,
      url: gameBadgesUtils.getBadgeLink(badgeDetails.id, badgeDetails.name),
    };
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const parsedBadgeDetails = useMemo(() => parseBadgeDetails(badge), [badge]);

  return (
    <li className="stack-row badge-row">
      <div className="badge-image">
        <Link url={parsedBadgeDetails.url}>
          <Thumbnail2d
            containerClass="badge-image-container"
            targetId={parsedBadgeDetails.id}
            format={ThumbnailFormat.webp}
            type={ThumbnailTypes.badgeIcon}
            size={ThumbnailBadgeIconSize.size150}
          />
        </Link>
      </div>
      <div className="badge-content">
        <div className="badge-data-container">
          <div className="font-header-2 badge-name">{parsedBadgeDetails.name}</div>
          <p className="para-overflow">{parsedBadgeDetails.description}</p>
        </div>
        <ul className="badge-stats-container">
          <li>
            <div className="text-label">{translate(translationMap.LabelRarity)}</div>
            <div className="font-header-2 badge-stats-info">{parsedBadgeDetails.rarityLabel}</div>
          </li>
          <li>
            <div className="text-label">{translate(translationMap.LabelWonYesterday)}</div>
            <div className="font-header-2 badge-stats-info">
              {parsedBadgeDetails.pastDayAwardedCount}
            </div>
          </li>
          <li>
            <div className="text-label">{translate(translationMap.LabelWonEver)}</div>
            <div className="font-header-2 badge-stats-info">{parsedBadgeDetails.awardedCount}</div>
          </li>
        </ul>
      </div>
    </li>
  );
};

export default GameBadge;
