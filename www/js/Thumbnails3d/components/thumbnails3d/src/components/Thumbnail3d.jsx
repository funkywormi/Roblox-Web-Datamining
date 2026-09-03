import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Thumbnail3d } from "@rbx/thumbnail3d";
import { getJsonUrl } from "../services/thumbnail3d";
import { ThumbnailTypes } from "../constants/thumbnail3dConstant";

// TODO: old, migrated code
// eslint-disable-next-line react/prop-types
const LoadingThumbnail = ({ loadingClass }) => (
  <div className="thumbnail-loader">
    <span className={loadingClass} />
  </div>
);

function Thumbnail3dWrapper({
  targetId,
  getThumbnailJson,
  useDynamicLighting,
  onSuccess,
  onFailure,
  loadingClass,
  type = ThumbnailTypes.Avatar,
  version,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState();
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const response = await getJsonUrl(type, targetId, getThumbnailJson);
        setImageUrl(response.imageUrl);
      } catch (error) {
        console.error("Error fetching image URL:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [type, targetId, version, getThumbnailJson]);

  if (isLoading) {
    return <LoadingThumbnail loadingClass={loadingClass} />;
  }

  return (
    <Thumbnail3d
      imageUrl={imageUrl}
      useDynamicLighting={useDynamicLighting}
      slots={{
        // TODO: old, migrated code
        // eslint-disable-next-line react/no-unstable-nested-components
        loading: () => <LoadingThumbnail loadingClass={loadingClass} />,
        // TODO: show a fallback image or i18n error message
        // the previous implementation did nothing on error when parsing, creating the 3d canvas.
        // eslint-disable-next-line react/no-unstable-nested-components
        error: () => <div />,
      }}
      onError={onFailure}
      onSuccess={onSuccess}
      disableKeyboardControls
    />
  );
}

Thumbnail3dWrapper.defaultProps = {
  useDynamicLighting: false,
  getThumbnailJson: null,
  onSuccess: () => {
    // do nothing
  },
  onFailure: () => {
    // do nothing
  },
  loadingClass: "spinner spinner-default",
  version: "",
};

Thumbnail3dWrapper.propTypes = {
  type: PropTypes.string.isRequired,
  targetId: PropTypes.number.isRequired,
  getThumbnailJson: PropTypes.func,
  useDynamicLighting: PropTypes.bool,
  onSuccess: PropTypes.func,
  onFailure: PropTypes.func,
  loadingClass: PropTypes.string,
  version: PropTypes.string,
};

export default Thumbnail3dWrapper;
