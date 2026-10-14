import type { RobloxApiDevelopModelsPlaytesterEligibility } from '@rbx/client-develop/v1';
import { UniverseSettingsApi } from '@rbx/client-develop/v1';
import type { RobloxWebWebAPIModelsApiArrayResponseSystemCollectionsGenericIDictionarySystemStringSystemString } from '@rbx/client-develop/v2';
import { PermissionsApi } from '@rbx/client-develop/v2';
import { createClientConfiguration } from './utils';

const configuration = createClientConfiguration('develop', 'bedev1');

const permissionsApi = new PermissionsApi(configuration);
const universeSettingsApi = new UniverseSettingsApi(configuration);

export type UniverseLegacyPermissionsResponse =
  RobloxWebWebAPIModelsApiArrayResponseSystemCollectionsGenericIDictionarySystemStringSystemString;

export type PlaytesterEligibility = RobloxApiDevelopModelsPlaytesterEligibility;

// The endpoint rejects larger batches (error 49).
export const PLAYTESTER_ELIGIBILITY_BATCH_SIZE = 50;

const developApiClient = {
  getUniverseLegacyPermissions(universeId: number) {
    return permissionsApi.v2UniversesUniverseIdPermissionsGet({ universeId });
  },

  async getPlaytesterEligibility(
    universeId: number,
    userIds: readonly number[],
  ): Promise<PlaytesterEligibility[]> {
    const batches: number[][] = [];
    for (let i = 0; i < userIds.length; i += PLAYTESTER_ELIGIBILITY_BATCH_SIZE) {
      batches.push(userIds.slice(i, i + PLAYTESTER_ELIGIBILITY_BATCH_SIZE));
    }
    const results = await Promise.all(
      batches.map((batch) =>
        universeSettingsApi.v1UniversesUniverseIdConfigurationPlaytestersEligibilityPost({
          universeId,
          request: { playtesters: batch },
        }),
      ),
    );
    return results.flatMap((result) => result.playtesters ?? []);
  },
};

export default developApiClient;
