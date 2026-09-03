import { EnvironmentUrls } from 'Roblox';

const { userAgreementsServiceApi } = EnvironmentUrls;
// Needed as part of the agreement-resolution request to UAQS
const clientType = 'web';

export default {
  getAgreementResolutionConfig: () => {
    return {
      withCredentials: true,
      url: `${userAgreementsServiceApi}/v1/agreements-resolution/${clientType}`
    };
  },
  getInsertAcceptancesConfig: () => {
    return {
      withCredentials: true,
      url: `${userAgreementsServiceApi}/v1/acceptances`
    };
  }
};
