import { AxiosPromise, AxiosResponse } from "@rbx/core-scripts/http";
import * as httpService from "@rbx/core-scripts/http";
import { logMeasurement } from "@rbx/thumbnails/metrics";
import "../global";
import { WebGLJson } from "../types";
import {
  Thumbnail3DJsonSuccess,
  Thumbnail3DJsonFail,
  Thumbnail3DJsonStats,
  DefaultMaxRetry,
  DefaultMaxRetryInterval,
  ThumbnailStates,
  ThumbnailTypes,
  Thumbnail3DJsonData,
} from "../constants/thumbnail3dConstant";
import {
  getAvatarThumbnail3dJsonUrl,
  getAnimationManifestJsonUrl,
  getAssetJsonUrl,
  getUserOutfitJsonUrl,
} from "../constants/urlConstant";

const get3DJsonData = (
  jsonRes: AxiosResponse<Thumbnail3DJsonData>,
  success: Thumbnail3DJsonSuccess,
  fail: Thumbnail3DJsonFail,
  stats: Thumbnail3DJsonStats,
) => {
  const jsonUrlConfig = {
    url: jsonRes.data.imageUrl,
  };
  httpService
    .get<WebGLJson>(jsonUrlConfig)
    .then(jsonUrlRes => {
      success(jsonUrlRes.data, stats);
    })
    .catch(() => {
      fail("3D Thumbnail failed to load");
    });
};

const getJsonUrlByThumbnailType = (type: ThumbnailTypes, targetId: number) => {
  if (type === ThumbnailTypes.Animation) return getAnimationManifestJsonUrl(targetId);
  if (type === ThumbnailTypes.Asset) return getAssetJsonUrl(targetId);
  if (type === ThumbnailTypes.UserOutfit) return getUserOutfitJsonUrl(targetId);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (type === ThumbnailTypes.Avatar) return getAvatarThumbnail3dJsonUrl(targetId);
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Invalid thumbnail type: ${type}`);
};

/**
 * Fetch the initial json url for a thumbnail.
 * The result value contains the state of the thumbnail:
 * e.g., loading, complete, failed, etc.
 * If the thumbnail is complete, we can pass the URL from the json data to the rendering logic.
 */
export const getJsonUrl = async (
  type: ThumbnailTypes,
  targetId: number,
  getJson: () => AxiosPromise<Thumbnail3DJsonData>,
  retries: number = DefaultMaxRetry,
  retryInterval: number = DefaultMaxRetryInterval,
) => {
  let jsonRes: AxiosResponse<Thumbnail3DJsonData> | undefined;
  const stats = {
    realRegeneration: false,
    startTime: new Date(),
    retriesDone: 0,
    version: "TN2",
  };

  while (stats.retriesDone < retries && jsonRes?.data.state !== ThumbnailStates.complete) {
    try {
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (getJson) {
        // eslint-disable-next-line no-await-in-loop
        jsonRes = await getJson();
      } else {
        const urlConfig = { url: getJsonUrlByThumbnailType(type, targetId), withCredentials: true };

        // eslint-disable-next-line no-await-in-loop
        jsonRes = await httpService.get<Thumbnail3DJsonData>(urlConfig);
      }
      // eslint-disable-next-line no-console
      console.log("jsonRes", jsonRes);

      stats.version = jsonRes.data.version;
    } catch (error) {
      console.error("error construct get json request, exception: ", error);
      throw error;
    }
    if (jsonRes.data.state !== ThumbnailStates.complete) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise(resolve => {
        setTimeout(resolve, retryInterval);
      });
      stats.retriesDone += 1;
    }
  }

  if (jsonRes?.data.state === ThumbnailStates.complete) {
    stats.version = jsonRes.data.version;
    return jsonRes.data;
  }
  throw new Error("3D Thumbnail failed to load");
};

export const get3DJson = (
  targetId: number,
  type: ThumbnailTypes,
  getJson: () => AxiosPromise<Thumbnail3DJsonData>,
  success: Thumbnail3DJsonSuccess,
  fail: Thumbnail3DJsonFail,
  retries: number,
  retryInterval: number,
  stats: Thumbnail3DJsonStats,
) => {
  let requestJson;

  try {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (getJson === null || getJson === undefined) {
      const urlConfig = { url: getJsonUrlByThumbnailType(type, targetId), withCredentials: true };
      requestJson = httpService.get<Thumbnail3DJsonData>(urlConfig);
    } else {
      requestJson = getJson();
    }
  } catch (e: unknown) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.error(`error construct get json request, exception: ${e}`);
    throw e;
  }

  requestJson
    .then(jsonRes => {
      // TODO: old, migrated code
      // eslint-disable-next-line no-console
      console.log({ jsonRes });
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (jsonRes.data && jsonRes.data.state === ThumbnailStates.complete) {
        // TODO: old, migrated code
        // eslint-disable-next-line no-param-reassign
        stats.version = jsonRes.data.version;
        get3DJsonData(jsonRes, success, fail, stats);
      } else {
        // TODO: old, migrated code
        // eslint-disable-next-line no-param-reassign
        stats.realRegeneration = false;
        // TODO: old, migrated code
        // eslint-disable-next-line no-plusplus, no-param-reassign
        if (retries-- > 0) {
          // TODO: old, migrated code
          // eslint-disable-next-line no-plusplus, no-param-reassign
          stats.retriesDone++;
          setTimeout(() => {
            get3DJson(targetId, type, getJson, success, fail, retries, retryInterval, stats);
          }, retryInterval);
        } else {
          fail("3D Thumbnail failed to load");
        }
      }
    })
    .catch(() => {
      fail("3D Thumbnail failed to load");
    });
};

const processRequest = (
  targetId: number,
  type: ThumbnailTypes,
  getJson: () => AxiosPromise<Thumbnail3DJsonData>,
  success: Thumbnail3DJsonSuccess,
  fail: Thumbnail3DJsonFail,
  retries: number,
  retryInterval: number,
) => {
  const stats = {
    realRegeneration: false,
    startTime: new Date(),
    retriesDone: 0,
    version: "TN2",
  };
  get3DJson(targetId, type, getJson, success, fail, retries, retryInterval, stats);
};

const getThumbnail3dJson = (
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/default-param-last
  targetId = 0,
  getJson: () => AxiosPromise<Thumbnail3DJsonData>,
  type = ThumbnailTypes.Avatar,
  retries: number = DefaultMaxRetry,
  retryInterval: number = DefaultMaxRetryInterval,
) => {
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!targetId && getJson !== null && getJson !== undefined) {
    return new Promise((_resolve, reject) => {
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      reject("TargetId or GetJson function can not be empty.");
    });
  }

  return new Promise((resolve, reject) => {
    processRequest(
      targetId,
      type,
      getJson,
      (json: WebGLJson, stats: Thumbnail3DJsonStats) => {
        const finishTime = new Date().getTime();
        const duration = finishTime - stats.startTime.getTime();
        window.Roblox.ThumbnailMetrics?.logFinalThumbnailTime(duration);

        // log load success with retry
        logMeasurement("ThumbnailLoadDurationWebapp", {
          Status: "Success",
          ThumbnailType: `${type}_3d`,
          Version: stats.version,
          Value: duration.toString(),
        }).catch((e: unknown) => {
          console.error(e);
        });
        if (stats.retriesDone === 0) {
          // load success without retry
          logMeasurement("ThumbnailNoRetrySuccessWebapp", {
            ThumbnailType: `${type}_3d`,
            Version: stats.version,
          }).catch((e: unknown) => {
            console.error(e);
          });
        } else {
          // log retry attempts by type
          logMeasurement("ThumbnailRetryWebapp", {
            ThumbnailType: `${type}_3d`,
            Version: stats.version,
            Value: stats.retriesDone.toString(),
          }).catch((e: unknown) => {
            console.error(e);
          });
        }
        resolve({ json, performance: { duration } });
      },
      (error: string) => {
        window.Roblox.ThumbnailMetrics?.logThumbnailTimeout();

        logMeasurement("ThumbnailTimeoutWebapp", {
          ThumbnailType: `${type}_3d`,
          Version: "TN3",
        }).catch((e: unknown) => {
          console.error(e);
        });

        // TODO: old, migrated code
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        reject(error);
      },
      retries,
      retryInterval,
    );
  });
};

export { getThumbnail3dJson, getJsonUrlByThumbnailType };
