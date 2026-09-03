import { EnvironmentUrls } from 'Roblox';
import { Configuration } from '@rbx/clients';
import {
  AgreementsApi,
  HydratedAgreementWithHydratedTargetsResponse
} from '@rbx/clients/contentLicensingApi/v1';

const { apiGatewayUrl, domain } = EnvironmentUrls;

/**
 * Client for the Content Licensing API
 * This replaces the Rights Management API for agreement/license/listing lookups
 * since licensing data has been migrated to content-licensing-service.
 */
class ContentLicensingClient {
  private agreementsApi: AgreementsApi;

  constructor() {
    const defaultConfiguration = new Configuration({
      robloxSiteDomain: domain,
      basePath: `${apiGatewayUrl}/content-licensing-api`,
      credentials: 'include'
    });
    this.agreementsApi = new AgreementsApi(defaultConfiguration);
  }

  /**
   * Get a hydrated agreement by accountId and agreementId.
   * Returns the agreement with license and listing data inline.
   * @param accountId - The accountId of the agreement owner
   * @param agreementId - The agreementId to fetch
   * @returns The hydrated agreement with license, listing, and targets
   */
  getAgreement(
    accountId: string,
    agreementId: string
  ): Promise<HydratedAgreementWithHydratedTargetsResponse> {
    return this.agreementsApi.agreementsGetAgreement({ accountId, agreementId });
  }
}

const contentLicensingClient = new ContentLicensingClient();

export default contentLicensingClient;
