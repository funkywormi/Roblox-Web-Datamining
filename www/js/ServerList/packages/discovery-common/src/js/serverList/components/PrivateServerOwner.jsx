import React from "react";
import PropTypes from "prop-types";
import { Link } from "@rbx/core-ui";
import { Thumbnail2d, ThumbnailTypes, DefaultThumbnailSize } from "@rbx/thumbnails";
import { BadgeSizes, VerifiedBadgeStringContainer } from "@rbx/roblox-badges";
import urlConstants from "../constants/urlConstants";

const { getUserProfileUrl } = urlConstants;

function PrivateServerOwner({ ownerUserId, ownerName, ownerHasVerifiedBadge }) {
  return (
    <div className="rbx-private-owner">
      <Link
        title={ownerName}
        url={getUserProfileUrl(ownerUserId)}
        className="avatar avatar-card-fullbody owner-avatar"
      >
        <Thumbnail2d
          type={ThumbnailTypes.avatarHeadshot}
          size={DefaultThumbnailSize}
          targetId={ownerUserId}
          containerClass="avatar-card-image"
        />
      </Link>
      <Link url={getUserProfileUrl(ownerUserId)} className="text-name text-overflow">
        <VerifiedBadgeStringContainer
          size={BadgeSizes.CAPTIONHEADER}
          showVerifiedBadge={ownerHasVerifiedBadge}
          text={ownerName}
        />
      </Link>
    </div>
  );
}

PrivateServerOwner.propTypes = {
  ownerUserId: PropTypes.number.isRequired,
  ownerName: PropTypes.string.isRequired,
  ownerHasVerifiedBadge: PropTypes.bool.isRequired,
};

export default PrivateServerOwner;
