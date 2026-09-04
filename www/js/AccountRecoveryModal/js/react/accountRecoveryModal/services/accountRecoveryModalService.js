import { Cookies } from 'Roblox';
import { eventStreamService } from 'core-roblox-utilities';
import { httpService } from 'core-utilities';
import abTestConstants from '../constants/abTestConstants';

export const openAccountRecoveryModal = loginAttemptCount => {
  const AccountRecoveryEvent = new CustomEvent('OpenAccountRecoveryModal', {
    detail: loginAttemptCount
  });
  window.dispatchEvent(AccountRecoveryEvent);
};

export const getExperimentEnrollment = setLoginFailuresRequired => {
  const data = [
    {
      SubjectType: abTestConstants.abtestingRequest.subjectType,
      SubjectTargetId: Cookies.getBrowserTrackerId(),
      ExperimentName: abTestConstants.abtestingRequest.experimentName
    }
  ];

  httpService
    .post(abTestConstants.apiUrls.enrollAbtestingApi, data)
    .then(function success(response) {
      if (response.data && response.data.data && response.data.data.length > 0) {
        const result = response.data.data[0];
        const { abtestingResponse } = abTestConstants;

        if (result.Status === abtestingResponse.status.enrolled) {
          if (result.Variation === 1) {
            setLoginFailuresRequired(1);
          } else if (result.Variation === 2) {
            setLoginFailuresRequired(3);
          } else {
            // set to -1 to indicate that modal will not open no matter how many failed attempts
            setLoginFailuresRequired(-1);
          }
        }
      }
      // set to -1 to indicate that modal will not open no matter how many failed attempts
      setLoginFailuresRequired(-1);
    });
};

export const sendAccountRecoveryEvent = event => {
  eventStreamService.sendEventWithTarget(event.type, event.context, {
    ...event.params
  });
};
