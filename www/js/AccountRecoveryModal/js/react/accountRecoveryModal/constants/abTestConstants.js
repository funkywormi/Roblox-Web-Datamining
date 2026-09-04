import { EnvironmentUrls } from 'Roblox';

const abTestConstants = {
  apiUrls: {
    enrollAbtestingApi: {
      url: `${EnvironmentUrls.abtestingApiSite}/v1/enrollments`,
      retryable: false,
      withCredentials: false
    }
  },
  abtestingRequest: {
    subjectType: 'BrowserTracker',
    experimentName: 'Web.Login.AccountRecoveryPrompt'
  },
  abtestingResponse: {
    status: {
      enrolled: 'Enrolled'
    }
  }
};
export default abTestConstants;
