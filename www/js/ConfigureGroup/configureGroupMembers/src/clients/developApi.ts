import type { RobloxWebWebAPIModelsApiArrayResponseSystemCollectionsGenericIDictionarySystemStringSystemString } from '@rbx/client-develop/v2';
import { PermissionsApi } from '@rbx/client-develop/v2';
import { createClientConfiguration } from './utils';

const configuration = createClientConfiguration('develop', 'bedev1');

const permissionsApi = new PermissionsApi(configuration);

export type UniverseLegacyPermissionsResponse =
  RobloxWebWebAPIModelsApiArrayResponseSystemCollectionsGenericIDictionarySystemStringSystemString;

const developApiClient = {
  getUniverseLegacyPermissions(universeId: number) {
    return permissionsApi.v2UniversesUniverseIdPermissionsGet({ universeId });
  },
};

export default developApiClient;
