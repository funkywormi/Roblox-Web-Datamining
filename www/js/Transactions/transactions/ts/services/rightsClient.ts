import { EnvironmentUrls } from 'Roblox';
import { Configuration } from '@rbx/clients';
import {
  DefaultApi as RightsApi,
  GetCurrentAccountAssociatedEntityTypeEnum as AssociatedEntityType,
  AccountAndUser,
  IPFamily
} from '@rbx/clients/rightsV1';

const { apiGatewayUrl, domain } = EnvironmentUrls;

/**
 * Client for the Rights API.
 * Note: Agreement and IP listing data have been migrated to content-licensing-api.
 * This client is still used for getCurrentAccount and getIpFamilyById.
 */
class RightsClient {
  private rightsApi: RightsApi;

  constructor() {
    const defaultConfiguration = new Configuration({
      robloxSiteDomain: domain,
      basePath: `${apiGatewayUrl}/rights-management-api/rights/v1/`,
      credentials: 'include'
    });
    this.rightsApi = new RightsApi(defaultConfiguration);
  }

  /**
   * Get the rights management account for the current Roblox user
   * @returns The current account
   */
  getCurrentAccount(): Promise<AccountAndUser> {
    return this.rightsApi.getCurrentAccount({
      associatedEntityType: AssociatedEntityType.RobloxUser,
      associatedEntityId: ''
    });
  }

  /**
   * Get an IP family by accountId and ipFamilyId
   * @param accountId - The accountId of the IP family
   * @param ipFamilyId - The id of the IP family
   * @returns The IP family
   */
  getIpFamilyById(accountId: string, ipFamilyId: string): Promise<IPFamily> {
    return this.rightsApi.getIpFamilyId({ accountId, ipFamilyId });
  }
}

const rightsClient = new RightsClient();

export default rightsClient;
