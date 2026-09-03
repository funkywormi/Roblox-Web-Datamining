import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import ClassNames from "classnames";
import PropTypes from "prop-types";
import { logMeasurement } from "../metrics";
import * as thumbnailService from "../services/thumbnail2d";
import { ThumbnailRequester } from "../util/thumbnailRequester";
import { ThumbnailBatchHandler } from "../util/thumbnailHandler";
import { ThumbnailStates } from "../constants/thumbnail2dConstant";
import {
  resolveAvatarHeadshotIncludeBackground,
  useAvatarHeadshotBackgroundInTreatment,
} from "../experimentation/avatarHeadshotBackgroundExperiment";
import Thumbnail from "../components/Thumbnail";

const customThumbnailRequester = new ThumbnailRequester(
  item => item.targetId,
  () => "customThumbnailRequester",
);

function Thumbnail2d({
  type,
  targetId,
  token,
  size,
  imgClassName,
  containerClass,
  format,
  altName,
  onLoad,
  getThumbnail,
  version,
  headShape,
  includeBackground,
  includeProfileFrame,
  seedFromCache,
}) {
  const [startTime] = useState(new Date().getTime());
  const avatarHeadshotBackgroundInTreatment = useAvatarHeadshotBackgroundInTreatment(type);
  const resolvedIncludeBackground = resolveAvatarHeadshotIncludeBackground(
    type,
    includeBackground,
    avatarHeadshotBackgroundInTreatment,
  );
  // When opted in, seed the first render from the resolved-URL cache so an already-loaded thumbnail
  // (e.g. an avatar shown again after a chat screen change) shows immediately instead of flashing the
  // loading shimmer on remount. Computed once on mount via the lazy initializer.
  const [seededThumbnail] = useState(() =>
    seedFromCache
      ? thumbnailService.peekThumbnailImage(
          type,
          size,
          format,
          targetId,
          token,
          version,
          headShape,
          resolvedIncludeBackground,
          includeProfileFrame,
        )
      : undefined,
  );
  const hasSeededRef = useRef(Boolean(seededThumbnail));
  const [thumbnailStatus, setImageStatus] = useState(seededThumbnail?.state ?? null);
  const [thumbnailUrl, setImageUrl] = useState(seededThumbnail?.imageUrl ?? null);
  const errorIconClass = ClassNames(thumbnailService.getCssClass(thumbnailStatus));
  const [shimmerClass, setShimmerClass] = useState(seededThumbnail ? "" : "shimmer");
  const [performanceData, setPerformanceData] = useState(null);

  const customHandler = useMemo(
    () =>
      new ThumbnailBatchHandler(
        () =>
          new Promise((resolve, reject) => {
            getThumbnail()
              .then(response => {
                resolve({ data: { data: [{ ...response.data, targetId }] } });
              })
              .catch(reject);
          }),
        responseItem => responseItem.targetId,
        requestItem => requestItem.key,
        responseItem => responseItem.state !== ThumbnailStates.pending,
        responseItem => ({ thumbnail: responseItem }),
      ),
    [targetId, getThumbnail],
  );
  const onLoadWithPerformanceMetrics = useCallback(() => {
    if (performanceData) {
      const duration = new Date().getTime() - startTime;
      const { retryAttempts } = performanceData;
      // log load success with retry
      logMeasurement("ThumbnailLoadDurationWebapp", {
        Status: "Success",
        ThumbnailType: `${type}_2d`,
        Value: duration.toString(),
      }).catch(e => {
        console.error(e);
      });

      if (!retryAttempts) {
        // load success without retry
        logMeasurement("ThumbnailNoRetrySuccessWebapp", {
          ThumbnailType: `${type}_2d`,
        }).catch(e => {
          console.error(e);
        });
      } else {
        // log retry attempts by type
        logMeasurement("ThumbnailRetryWebapp", {
          ThumbnailType: `${type}_2d`,
          Value: retryAttempts.toString(),
        }).catch(e => {
          console.error(e);
        });
      }
    }
    if (onLoad) {
      onLoad();
    }
    // TODO: old, migrated code
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [performanceData]);

  useEffect(() => {
    // On a cache-seeded first mount, keep the seeded image instead of resetting to the shimmer; the
    // request below still runs and (for a cache hit) resolves to the same URL. Later dep changes
    // reset as usual.
    if (hasSeededRef.current) {
      hasSeededRef.current = false;
    } else {
      setShimmerClass("shimmer");
      setImageStatus(null);
      setImageUrl(null);
    }

    let isUnmounted = false;
    let requestThumbnail = thumbnailService.getThumbnailImage(
      type,
      size,
      format,
      targetId,
      token,
      version,
      headShape,
      resolvedIncludeBackground,
      includeProfileFrame,
    );
    if (getThumbnail) {
      requestThumbnail = customThumbnailRequester.processThumbnailBatchRequest(
        { targetId, type },
        items => customHandler.handle(items),
        targetId,
      );
    }

    requestThumbnail
      .then(data => {
        const {
          thumbnail: { state, imageUrl },
          performance,
        } = data;
        if (!isUnmounted) {
          setImageStatus(state);
          setImageUrl(imageUrl);
          setShimmerClass("");
          if (performance) {
            setPerformanceData({ ...performance });
          }
        }
      })
      .catch(err => {
        console.error(err);
        if (!isUnmounted) {
          setShimmerClass("");
        }
      });

    return () => {
      isUnmounted = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    type,
    targetId,
    token,
    size,
    imgClassName,
    getThumbnail,
    version,
    headShape,
    resolvedIncludeBackground,
    includeProfileFrame,
  ]);

  return (
    <Thumbnail
      {...{
        thumbnailUrl,
        errorIconClass,
        imgClassName,
        altName,
        onLoad: onLoadWithPerformanceMetrics,
        containerClass: ClassNames(shimmerClass, containerClass),
      }}
    />
  );
}
Thumbnail2d.defaultProps = {
  targetId: 0,
  token: "",
  size: "150x150",
  imgClassName: "",
  containerClass: "",
  format: "webp",
  altName: "",
  onLoad: () => {
    // do nothing
  },
  getThumbnail: null,
  version: "",
  includeProfileFrame: false,
  seedFromCache: false,
};

Thumbnail2d.propTypes = {
  type: PropTypes.string.isRequired,
  targetId: PropTypes.number,
  token: PropTypes.string,
  size: PropTypes.string,
  format: PropTypes.string,
  imgClassName: PropTypes.string,
  containerClass: PropTypes.string,
  altName: PropTypes.string,
  onLoad: PropTypes.func,
  getThumbnail: PropTypes.func,
  version: PropTypes.string,
  headShape: PropTypes.string,
  includeBackground: PropTypes.bool,
  includeProfileFrame: PropTypes.bool,
  seedFromCache: PropTypes.bool,
};

export default Thumbnail2d;
