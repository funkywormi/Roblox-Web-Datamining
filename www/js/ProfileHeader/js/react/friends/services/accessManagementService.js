import { httpService } from 'core-utilities';
import urlConstants from '../constants/urlConstants';

const fetchFeatureCheckResponse = async (featureName, extraParameters, successfulAction) => {
  const encodedExtraParameters = extraParameters ? btoa(JSON.stringify(extraParameters)) : null;
  const urlConfig = urlConstants.getAmpUpsellWithParametersUrlConfig(
    featureName,
    encodedExtraParameters,
    successfulAction
  );

  const { data } = await httpService.get(urlConfig);
  return data;
};

const fetchFeatureCheckResponseWithNamespace = async (
  featureName,
  extraParameters,
  successfulAction,
  namespace
) => {
  const encodedExtraParameters = extraParameters ? btoa(JSON.stringify(extraParameters)) : null;
  const urlConfig = urlConstants.getAmpUpsellWithParametersAndNamespaceUrlConfig(
    featureName,
    encodedExtraParameters,
    successfulAction,
    namespace
  );

  const { data } = await httpService.get(urlConfig);
  return data;
};

export { fetchFeatureCheckResponse, fetchFeatureCheckResponseWithNamespace };
