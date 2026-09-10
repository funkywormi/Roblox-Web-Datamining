import { EnvironmentUrls } from 'Roblox';
import chatModule from '../chatModule';

function localeService($q, httpService, languageResource) {
  'ngInject';

  const localeDomain = EnvironmentUrls.localeApi;

  return {
    getCountryRegions(locale = languageResource.intl.getRobloxLocale()) {
      return httpService.httpGet({
        url: `${localeDomain}/v1/country-regions?locale=${locale}`,
        retryable: true,
        withCredentials: true
      });
    }
  };
}

chatModule.factory('localeService', localeService);

export default localeService;
