import { useCallback } from "react";
import PropTypes from "prop-types";
import { ThumbnailAnimation } from "@rbx/thumbnail3d";
import { getThumbnail3dJson } from "../services/thumbnail3d";
import { ThumbnailTypes } from "../constants/thumbnail3dConstant";

function AnimatedThumbnail({
  targetId,
  getThumbnailJson,
  onSuccess,
  onFailure,
  onAnimationLoopFinish,
  loadingClass,
}) {
  const getJson = useCallback(
    () => getThumbnail3dJson(targetId, getThumbnailJson, ThumbnailTypes.Animation),
    [targetId, getThumbnailJson],
  );

  return (
    <ThumbnailAnimation
      targetId={targetId}
      getThumbnailJson={getJson}
      onSuccess={onSuccess}
      onFailure={onFailure}
      onAnimationLoopFinish={onAnimationLoopFinish}
      slots={{
        // TODO: old, migrated code
        // eslint-disable-next-line react/no-unstable-nested-components
        loading: () => (
          <div className="thumbnail-loader">
            <span className={loadingClass} />
          </div>
        ),
      }}
    />
  );
}

AnimatedThumbnail.defaultProps = {
  getThumbnailJson: null,
  onSuccess: () => {
    // do nothing
  },
  onFailure: () => {
    // do nothing
  },
  onAnimationLoopFinish: () => {
    // do nothing
  },
  loadingClass: "spinner spinner-default",
};

AnimatedThumbnail.propTypes = {
  targetId: PropTypes.number.isRequired,
  getThumbnailJson: PropTypes.func,
  onSuccess: PropTypes.func,
  onFailure: PropTypes.func,
  onAnimationLoopFinish: PropTypes.bool,
  loadingClass: PropTypes.string,
};

export default AnimatedThumbnail;
