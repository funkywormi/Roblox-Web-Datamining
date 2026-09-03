import { httpService } from 'core-utilities';
import { isGoogleAnalyticsCookieConsentOptIn } from 'core-roblox-utilities';
import { AxiosError } from 'axios';
import catalogConstants from '../constants/catalogConstants';
import UtilityService from './utilityService';
import { ErrorData } from './catalogAPIService';

export type MetricsService = {
  sendErrorsToLogCount(result: any, endpointName: string): void;
  sendErrorsToGoogleAnalytics(result: any, endpointName: any): void;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
declare global {
  interface Window {
    GoogleAnalyticsEvents: any;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const GoogleAnalyticsEvents = window.GoogleAnalyticsEvents || null;

function useMetricsService(): MetricsService {
  function sendErrorCount(data) {
    const { endpoints } = catalogConstants;
    const url = endpoints.performanceMeasurements;
    return httpService.post(url, data);
  }

  function getUserAgent(): string {
    if (navigator && navigator.userAgent) {
      return navigator.userAgent;
    }
    return '';
  }

  return {
    sendErrorsToLogCount(result: ErrorData, endpointName: string) {
      const { errors } = result;
      const { categoryName } = catalogConstants.errorMessages;
      const postData: any[] = [];
      errors.forEach((error: AxiosError) => {
        const { code } = error;
        const measureName = `${endpointName}${code as string}`;
        postData.push({
          featureName: categoryName,
          measureName,
          value: 1 // log each time
        });
      });
      if (postData.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        sendErrorCount(postData);
      }
    },

    sendErrorsToGoogleAnalytics(result: ErrorData, endpointName: string) {
      const hasGAConsent = (isGoogleAnalyticsCookieConsentOptIn as () => boolean)();
      if (!hasGAConsent) return;
      const { errors } = result;
      const { categoryName } = catalogConstants.errorMessages;
      const userAgent = getUserAgent();
      const errorMessages = UtilityService.buildErrorMessages(errors, userAgent);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (GoogleAnalyticsEvents?.FireEvent) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        GoogleAnalyticsEvents.FireEvent([categoryName, endpointName, errorMessages]);
      }
    }
  };
}

export default useMetricsService;
