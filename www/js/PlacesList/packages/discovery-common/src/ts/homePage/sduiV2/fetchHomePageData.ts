import { create, toJson } from "@bufbuild/protobuf";
import { Url } from "@rbx/core-lib/url";
import {
  ClientCapabilitiesSchema,
  HomePageRequestSchema,
  HomePageResponseSchema,
  Platform,
  type ApiRequestConfig,
  type ClientCapabilities,
} from "@rbx/sdui-core";
import bedev2Constants from "../../common/constants/bedev2Constants";
import getDeviceFeatures, { type TDeviceFeatures } from "../../common/utils/deviceFeaturesUtils";
import { getHomePageKey, getHomePageSurfaceKey, homePageSduiConfig } from "./homePageConfiguration";

export type HomePageClientCapabilities = Partial<
  Pick<
    ClientCapabilities,
    | "enabledCapabilities"
    | "protoVersion"
    | "registeredUiComponentTypes"
    | "registeredActionTypes"
    | "runtimeFlagValues"
  >
>;

export type HomePageRequestConfigParams = {
  sessionId: string;
  contextualFeatures?: Record<string, string>;
  deviceFeatures?: TDeviceFeatures;
  topicIds?: string[];
  clientCapabilities?: HomePageClientCapabilities;
};

const RESOLUTION_PATTERN = /^(\d+)x(\d+)$/;

// Keys are the `RealtimeFeatureType` names read by discovery-api `FetchUserFeaturesStep`.
function buildDeviceContextualFeatures(deviceFeatures: TDeviceFeatures): Record<string, string> {
  const features: Record<string, string> = {};

  if (
    typeof deviceFeatures.cpuCores === "number" &&
    Number.isFinite(deviceFeatures.cpuCores) &&
    deviceFeatures.cpuCores > 0
  ) {
    features.cpucore = String(Math.round(deviceFeatures.cpuCores));
  }

  if (
    typeof deviceFeatures.maxMemory === "number" &&
    Number.isFinite(deviceFeatures.maxMemory) &&
    deviceFeatures.maxMemory > 0
  ) {
    features.deviceram = String(Math.round(deviceFeatures.maxMemory));
  }

  if (deviceFeatures.networkType) {
    features.networktype = deviceFeatures.networkType;
  }

  const resolutionMatch = deviceFeatures.maxResolution
    ? RESOLUTION_PATTERN.exec(deviceFeatures.maxResolution)
    : null;
  if (resolutionMatch?.[1] && resolutionMatch[2]) {
    features.screenwidth = resolutionMatch[1];
    features.screenheight = resolutionMatch[2];
  }

  return features;
}

export const buildHomePageRequestUrl = (): Url => {
  const { url } = bedev2Constants.url.getHomePage();
  return Url.parse(url).getOrThrow();
};

function buildHomePagePostBody({
  sessionId,
  contextualFeatures,
  deviceFeatures,
  topicIds,
  clientCapabilities,
}: HomePageRequestConfigParams): string {
  const mergedContextualFeatures = {
    ...buildDeviceContextualFeatures(deviceFeatures ?? getDeviceFeatures()),
    ...contextualFeatures,
  };

  const request = create(HomePageRequestSchema, {
    sessionId,
    ...(topicIds && topicIds.length > 0 ? { topicIds } : {}),
    ...(Object.keys(mergedContextualFeatures).length > 0
      ? { contextualFeatures: mergedContextualFeatures }
      : {}),
    cachedRobloxComponentToTemplateId: {},
    clientCapabilities: create(ClientCapabilitiesSchema, {
      ...clientCapabilities,
      platform: Platform.WEB,
    }),
  });

  return JSON.stringify(toJson(HomePageRequestSchema, request));
}

export function buildHomePageRequestConfig(params: HomePageRequestConfigParams): ApiRequestConfig {
  const body = buildHomePagePostBody(params);
  const buildUrl = buildHomePageRequestUrl;

  return {
    url: buildUrl(),
    surfaceKey: getHomePageSurfaceKey(),
    configKey: getHomePageKey(),
    postConfig: {
      body,
      contentType: "application/json",
      // Session / topic / capability changes must not reuse another POST's cache.
      bodyKey: body,
    },
    responseFormat: homePageSduiConfig.responseFormat,
    protoSchema: HomePageResponseSchema,
    buildRefreshUrl: buildUrl,
  };
}
