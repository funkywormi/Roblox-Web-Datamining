import React from "react";

import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";
import { Link } from "@rbx/core-ui/legacy/react-style-guide";

import VerifiedBadgeIcon, {
  VERIFIED_BADGE_ARIA_LABEL,
  VERIFIED_BADGE_ARIA_LABEL_KEY,
} from "@rbx/www-common/components/verified-badge";
import {
  EntrypointExposure,
  logCmntyEntrypointClickEvent,
  logCmntyEntrypointExposureEvent,
  useEntrypointImpressionId,
} from "@rbx/community-telemetry";
import { getProfileUrlForUserOrGroup } from "../services";

import { translation } from "../translation.config";
import translationConstants from "../constants";

import "../css/virtualEventDetails/virtualEventHostedBy.scss";

const EVENT_DETAILS_CONTEXT = "eventDetailsPage";
const EVENT_DETAILS_ENTRY_POINT = "eventDetailsPage";

type Host = {
  hostName: string;
  hostId: number;
  hostType: string;
  hasVerifiedBadge: boolean;
};

function HostedBy({ host, translate }: { host?: Host } & WithTranslationsProps) {
  const entrypointImpressionId = useEntrypointImpressionId();
  const isCommunityHost = Boolean(host && host.hostType !== "user" && host.hostId);

  const badgeToRender = host?.hasVerifiedBadge ? (
    <VerifiedBadgeIcon
      size="Medium"
      className="verified-badge-icon-header"
      titleText={translate(VERIFIED_BADGE_ARIA_LABEL_KEY, undefined, VERIFIED_BADGE_ARIA_LABEL)}
    />
  ) : null;

  const hostedByContent = (
    <div className="hosted-by-content">
      <Link
        className="text-link dynamic-overflow-container"
        url={getProfileUrlForUserOrGroup(String(host?.hostId), String(host?.hostType))}
        onClick={
          isCommunityHost
            ? () =>
                logCmntyEntrypointClickEvent({
                  context: EVENT_DETAILS_CONTEXT,
                  entryPoint: EVENT_DETAILS_ENTRY_POINT,
                  entrypointImpressionId,
                  groupId: host?.hostId,
                })
            : undefined
        }
      >
        {host?.hostType === "user" && (
          <span className="avatar avatar-headshot-xs">
            <Thumbnail2d
              containerClass="avatar-card-image"
              targetId={host.hostId}
              type={ThumbnailTypes.avatarHeadshot}
              altName={host.hostName}
            />
          </span>
        )}
        <span className="text-overflow host-username font-caption-header">{host?.hostName}</span>
        {badgeToRender}
      </Link>
    </div>
  );

  return (
    <div className="event-hosted-by-container" data-testid="event-hosted-by">
      <div className="hosted-by-title">
        <p>
          {translate(translationConstants.hostedBy.translationKey) ||
            translationConstants.hostedBy.fallback}
        </p>
      </div>
      {isCommunityHost ? (
        <EntrypointExposure
          onExposure={() =>
            logCmntyEntrypointExposureEvent({
              context: EVENT_DETAILS_CONTEXT,
              entryPoint: EVENT_DETAILS_ENTRY_POINT,
              entrypointImpressionId,
              groupId: host?.hostId,
            })
          }
        >
          {hostedByContent}
        </EntrypointExposure>
      ) : (
        hostedByContent
      )}
    </div>
  );
}

export default withTranslations(HostedBy, translation);
