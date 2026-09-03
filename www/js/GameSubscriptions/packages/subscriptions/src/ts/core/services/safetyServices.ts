import { httpService } from 'core-utilities';
import serviceConstants from '../constants/serviceConstants';
import { SubmitSafetyEventRequest, SubmitSafetyEventResponse } from '../types/serviceTypes';

export const submitSafetyEvent = async (params: SubmitSafetyEventRequest): Promise<string> => {
  const response = await httpService.post<SubmitSafetyEventResponse>(
    serviceConstants.url.submitSafetyEvent,
    {
      safetyEvent: {
        eventTime: Date.now(),
        idempotencyKey: `subscriptions/${params.subscriptionTargetKey}/${params.reporterId}`,
        tags: {
          SUBMITTER_USER_ID: {
            valueList: [
              {
                data: params.reporterId
              }
            ]
          },
          REPORTED_ABUSE_VECTOR: {
            valueList: [
              {
                data: 'subscriptions'
              }
            ]
          },
          REPORT_TARGET_SUBSCRIPTION_TARGET_KEY: {
            valueList: [
              {
                data: params.subscriptionTargetKey
              }
            ]
          },
          REPORT_TARGET_ASSET_ID: {
            valueList: [
              {
                data: params.imageAssetId
              }
            ]
          },
          ENTRY_POINT: {
            valueList: [
              {
                data: 'website'
              }
            ]
          },
          REPORTED_ABUSE_CATEGORY: {
            valueList: [
              {
                data: 'ABUSE_TYPE_OTHER'
              }
            ]
          },
          REPORTER_COMMENT: {
            valueList: [
              {
                data: ''
              }
            ]
          }
        }
      }
    }
  );

  return response.data.id;
};

export default {
  submitSafetyEvent
};
