import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-scripts/http";

const getAmpUpsellWithParametersUrlConfig = (
  featureName: string,
  extraParameters: string | null = null,
  recourses: string | null = null,
) => ({
  retryable: true,
  withCredentials: true,
  url: `${environmentUrls.apiGatewayUrl}/access-management/v1/upsell-feature-access?featureName=${featureName}${
    extraParameters ? `&extraParameters=${extraParameters}` : ``
  }${recourses ? `&successfulActions=${recourses}` : ``}`,
});

const getAmpUpsellWithParametersAndNamespaceUrlConfig = (
  featureName: string,
  extraParameters: string | null = null,
  recourses: string | null = null,
  namespace: string | null = null,
) => ({
  retryable: true,
  withCredentials: true,
  url: `${environmentUrls.apiGatewayUrl}/access-management/v1/upsell-feature-access?featureName=${featureName}${
    extraParameters ? `&extraParameters=${extraParameters}` : ``
  }${recourses ? `&successfulActions=${recourses}` : ``}${
    namespace ? `&namespace=${encodeURIComponent(namespace)}` : ``
  }`,
});

export const fetchFeatureCheckResponse = async <T>(
  featureName: string,
  extraParameters?: unknown[] | Record<string, unknown>,
  successfulAction?: string,
): Promise<T> => {
  const encodedExtraParameters = extraParameters ? btoa(JSON.stringify(extraParameters)) : null;
  const urlConfig = getAmpUpsellWithParametersUrlConfig(
    featureName,
    encodedExtraParameters,
    successfulAction,
  );

  const { data } = await http.get<T>(urlConfig);
  return data;
};

export const fetchFeatureCheckResponseWithNamespace = async <T>(
  featureName: string,
  extraParameters?: unknown[] | Record<string, unknown>,
  successfulAction?: string,
  namespace?: string,
): Promise<T> => {
  const encodedExtraParameters = extraParameters ? btoa(JSON.stringify(extraParameters)) : null;
  const urlConfig = getAmpUpsellWithParametersAndNamespaceUrlConfig(
    featureName,
    encodedExtraParameters,
    successfulAction,
    namespace,
  );

  const { data } = await http.get<T>(urlConfig);
  return data;
};
