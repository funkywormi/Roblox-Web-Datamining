import * as http from "@rbx/core-scripts/http";
import { UserAuthIntent } from "@rbx/core-scripts/data-store";
import { callBehaviour } from "@rbx/core-scripts/guac";
import environmentUrls from "@rbx/environment-urls";
import experimentConstants from "../constants/experimentConstants";
import bedev2Constants from "../constants/bedev2Constants";
import {
  TExploreApiGameSortResponse,
  TExploreApiSortsResponse,
  TGetOmniRecommendationsMetadataResponse,
  TGetOmniSearchParsedResponse,
  TGetOmniSearchResponse,
  TGuacAppPolicyBehaviorResponse,
  TOmniRecommendation,
  TOmniSearchContentType,
  TOmniSearchGameDataModel,
  TTreatmentType,
  TGetProfilesResponse,
  TSduiTreatmentType,
  TCanUserManagePlaceRequestBody,
  TCanUserManagePlaceResponse,
  TPrivateServerSettingsResponse,
  TSortIdMapping,
  TOmniRecommendationSort,
  TOmniSearchTextDataModel,
  TRequestIntent,
} from "../types/bedev2Types";
import {
  TUserSignalType,
  TUserSignalValueType,
  TUserSignalValue,
  TUserSignalEntity,
  TPostUserSignalRequestBody,
  TPostUserSignalResponse,
} from "../types/userSignalTypes";
import { TPageType } from "../types/bedev1Types";
import { TDeviceFeatures } from "../utils/deviceFeaturesUtils";
import { getInputUniverseIdsRequestParam } from "../utils/parsingUtils";
import { TOmniRecommendationSduiTree } from "../../sdui/system/SduiTypes";

export type TGetOmniRecommendationsResponse = {
  sorts: TOmniRecommendationSort[];
  sdui?: TOmniRecommendationSduiTree;
} & TGetOmniRecommendationsMetadataResponse;

const getExperimentationValues = async <T extends Record<string, number | string | boolean>>(
  layerName: string,
  defaultValues: T,
  projectId = 1,
): Promise<T> => {
  try {
    const { data } = await http.get<T>(
      experimentConstants.url.getExperimentationValues(
        projectId,
        layerName,
        Object.keys(defaultValues),
      ),
    );
    const parsedData = Object.keys(data).reduce<Record<string, any>>((acc, item) => {
      if (data[item] !== null) {
        acc[item] = data[item];
      }
      return acc;
    }, {});
    return { ...defaultValues, ...parsedData };
  } catch {
    return defaultValues;
  }
};

export const getOmniRecommendations = async (
  pageType: TPageType,
  sessionId: string,
  deviceFeatures?: TDeviceFeatures,
  authIntentFeatures?: UserAuthIntent,
  interestedUniverses?: number[],
  sduiTreatmentTypes?: TSduiTreatmentType[],
  requestIntent?: TRequestIntent,
): Promise<TGetOmniRecommendationsResponse> => {
  const params = {
    pageType,
    sessionId,
    supportedTreatmentTypes: [TTreatmentType.SortlessGrid],
    sduiTreatmentTypes,
    authIntentData: authIntentFeatures,
    requestIntent,
    ...deviceFeatures,
    ...getInputUniverseIdsRequestParam(interestedUniverses),
  };

  const { data } = await http.post<TGetOmniRecommendationsResponse>(
    bedev2Constants.url.getOmniRecommendations,
    params,
  );

  Object.keys(data.contentMetadata.Game).forEach(universeId => {
    const gameData = data.contentMetadata.Game[universeId]!;
    gameData.placeId = gameData.rootPlaceId as number;
  });

  return data;
};

export const getOmniRecommendationsMetadata = async (
  recommendationList: TOmniRecommendation[],
  sessionId: string,
): Promise<TGetOmniRecommendationsMetadataResponse> => {
  const { data } = await http.post<TGetOmniRecommendationsMetadataResponse>(
    bedev2Constants.url.getOmniRecommendationsMetadata,
    {
      contents: recommendationList,
      sessionId,
    },
  );

  Object.keys(data.contentMetadata.Game).forEach(universeId => {
    const gameData = data.contentMetadata.Game[universeId]!;
    gameData.placeId = gameData.rootPlaceId as number;
  });

  return data;
};

export const getOmniSearch = async (
  searchQuery: string,
  pageToken: string,
  sessionId: string,
  pageType: string,
): Promise<TGetOmniSearchParsedResponse> => {
  const { data } = await http.get<TGetOmniSearchResponse>(bedev2Constants.url.getOmniSearch, {
    searchQuery,
    pageToken,
    sessionId,
    pageType,
  });

  const gamesList: TOmniSearchGameDataModel[] = [];
  const textList: TOmniSearchTextDataModel[] = [];
  const gameTopicIds = new Set<string>();

  if (data && data.searchResults && data.searchResults.length > 0) {
    data.searchResults.forEach(contentGroup => {
      // Currently the backend only returns the "Game" and "Text" content types.
      // Future content types can be added here for parsing.
      if (contentGroup.contentGroupType === TOmniSearchContentType.Game) {
        const contents = contentGroup.contents as TOmniSearchGameDataModel[];
        contents.forEach(item => {
          gamesList.push(item);
        });
        gameTopicIds.add(contentGroup.topicId);
      } else if (contentGroup.contentGroupType === TOmniSearchContentType.Text) {
        const contents = contentGroup.contents as TOmniSearchTextDataModel[];
        contents.forEach(item => {
          textList.push({ ...item, topicId: contentGroup.topicId });
        });
      }
    });
  }

  return {
    paginationMethod: data.paginationMethod,
    filteredSearchQuery: data.filteredSearchQuery,
    nextPageToken: data.nextPageToken,
    sorts: data.sorts || [],
    gamesList,
    textList,
    gameTopicIds,
  };
};

export const getExploreSorts = (
  sessionId: string,
  sortsPageToken: string | undefined,
  filters: Map<string, string>,
  deviceFeatures?: TDeviceFeatures,
): Promise<TExploreApiSortsResponse> => {
  const filterParams: Record<string, string> = {};
  filters.forEach((value, key) => {
    filterParams[key] = value;
  });

  return http
    .get<TExploreApiSortsResponse>(bedev2Constants.url.getExploreSorts, {
      ...filterParams,
      ...deviceFeatures,
      sessionId,
      sortsPageToken,
    })
    .then(response => {
      return response.data;
    });
};

export const getExploreSortContents = (
  sessionId: string,
  sortId: string,
  pageToken: string | undefined,
  filters: Map<string, string>,
  deviceFeatures?: TDeviceFeatures,
): Promise<TExploreApiGameSortResponse> => {
  const filterParams: Record<string, string> = {};
  filters.forEach((value, key) => {
    filterParams[key] = value;
  });

  return http
    .get<TExploreApiGameSortResponse>(bedev2Constants.url.getExploreSortContents, {
      ...filterParams,
      ...deviceFeatures,
      sessionId,
      sortId,
      pageToken,
    })
    .then(response => {
      return response.data;
    });
};

const postUserSignal = async (
  signalValue: TUserSignalValue,
  signalValueType: TUserSignalValueType,
  signalEntity: TUserSignalEntity,
  signalType: TUserSignalType,
  omniSessionId: string,
): Promise<TPostUserSignalResponse> => {
  const timestampMs = Date.now().toString();

  const requestBody: TPostUserSignalRequestBody = {
    userSignalEvents: [
      { signalValue, timestampMs, signalValueType, signalEntity, signalType, omniSessionId },
    ],
  };

  const urlConfig = bedev2Constants.url.postUserSignal();
  const response = await http.post<TPostUserSignalResponse>(urlConfig, requestBody);
  return response.data;
};

export const getThumbnailForAsset = async (assetId: number): Promise<string> => {
  return http
    .get<{ data?: Array<{ state?: string; imageUrl?: string }> }>(
      {
        url: `${environmentUrls.thumbnailsApi}/v1/assets`,
        timeout: 10000,
        withCredentials: true,
      },
      {
        assetIds: [assetId],
        size: "768x432",
        format: "Png",
      },
    )
    .then(result => {
      if (result.data.data?.[0]?.state === "Completed" && result.data.data?.[0]?.imageUrl) {
        return result.data.data[0].imageUrl;
      }
      return Promise.reject();
    });
};

const getGuacAppPolicyBehaviorData = (): Promise<TGuacAppPolicyBehaviorResponse> => {
  return callBehaviour<TGuacAppPolicyBehaviorResponse>("app-policy");
};

const getProfiles = async (userIds: number[]): Promise<TGetProfilesResponse> => {
  const urlConfig = {
    url: `${environmentUrls.apiGatewayUrl}/user-profile-api/v1/user/profiles/get-profiles`,
    retryable: true,
    withCredentials: true,
  };

  const requestData = {
    userIds,
    fields: ["names.combinedName", "names.username"],
  };

  const { data }: { data: TGetProfilesResponse } = await http.post(urlConfig, requestData);
  return data;
};

const getSearchLandingRecommendations = async (
  sessionId: string,
): Promise<TExploreApiSortsResponse> => {
  const params = { sessionId };
  const { data } = await http.get<TExploreApiSortsResponse>(
    bedev2Constants.url.getSearchLandingPage,
    params,
  );
  return data;
};

const getCanUserManagePlace = async (placeId: number, userId: string): Promise<boolean> => {
  const urlConfig = {
    url: `${environmentUrls.apiGatewayUrl}/asset-permissions-api/v1/assets/check-permissions`,
    retryable: true,
    withCredentials: true,
  };

  const requestBody: TCanUserManagePlaceRequestBody = {
    requests: [
      {
        subject: {
          subjectType: "User",
          subjectId: userId,
        },
        action: "Edit",
        assetId: placeId,
      },
    ],
  };

  return http.post<TCanUserManagePlaceResponse>(urlConfig, requestBody).then(response => {
    if (response?.data?.results?.[0]?.value?.status === "HasPermission") {
      return true;
    }

    return false;
  });
};

const getPrivateServerSettings = async (
  universeId: number,
): Promise<TPrivateServerSettingsResponse> => {
  const urlConfig = {
    url: `${environmentUrls.apiGatewayUrl}/private-servers-api/Universe-Private-Server-Settings`,
    retryable: true,
    withCredentials: true,
  };

  return http
    .get<TPrivateServerSettingsResponse>(urlConfig, {
      universeId,
    })
    .then(response => {
      return response.data;
    })
    .catch(() => {
      return Promise.reject();
    });
};

const getSortIdMapping = async (): Promise<TSortIdMapping> => {
  const urlConfig = {
    url: `${environmentUrls.apiGatewayUrl}/explore-api/v1/get-sort-ids`,
    retryable: true,
  };

  return http
    .get<TSortIdMapping>(urlConfig)
    .then(response => {
      return response.data;
    })
    .catch(() => {
      return Promise.reject();
    });
};

export default {
  getExperimentationValues,
  getOmniRecommendations,
  getOmniRecommendationsMetadata,
  getOmniSearch,
  getExploreSorts,
  getExploreSortContents,
  postUserSignal,
  getThumbnailForAsset,
  getGuacAppPolicyBehaviorData,
  getProfiles,
  getSearchLandingRecommendations,
  getCanUserManagePlace,
  getPrivateServerSettings,
  getSortIdMapping,
};
