import React from "react";
import PropTypes from "prop-types";
import { Thumbnail2d } from "@rbx/www-common/components/thumbnail";

function PlayerAvatar({ playerId, altName }) {
  return (
    <div className="avatar-card-link">
      <Thumbnail2d
        type="AvatarHeadShot"
        size="48x48"
        targetId={playerId}
        imgClassName="avatar-card-image"
        format="webp"
        altName={altName}
      />
    </div>
  );
}

PlayerAvatar.defaultProps = {
  altName: "",
};

PlayerAvatar.propTypes = {
  playerId: PropTypes.number.isRequired,
  altName: PropTypes.string,
};

export default PlayerAvatar;
