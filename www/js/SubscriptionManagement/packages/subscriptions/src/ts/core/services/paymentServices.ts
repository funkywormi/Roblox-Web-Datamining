import { httpService } from 'core-utilities';
import type { AxiosResponse } from '@rbx/core-scripts/http';
import serviceConstants from '../constants/serviceConstants';
import { SavedPaymentProfile } from '../types/savedPaymentProfile';
import {
  IsStripeEnabledForUserResponse,
  PaymentProfileResponse,
  PaymentProfileSetupResponse
} from '../types/serviceTypes';

export enum PAYMENT_PROVIDER {
  Stripe = 'Stripe'
}

export const verifyPaymentProfileCreationPoll = async (): Promise<boolean> => {
  return Promise.resolve(true);
};

export const verifyPaymentProfileCreation = async (
  providerPaymentProfileId: string
): Promise<string> => {
  const response = await httpService.get<PaymentProfileResponse>(
    serviceConstants.url.verifyPaymentProfileCreation(providerPaymentProfileId)
  );

  return response?.data?.id;
};

export const getSavedPaymentProfiles = async (): Promise<
  AxiosResponse<Array<SavedPaymentProfile>>
> => {
  return httpService.get(serviceConstants.url.getSavedPaymentProfiles());
};

export const getStripeClientSecret = async (): Promise<string> => {
  const response = await httpService.post<PaymentProfileSetupResponse>(
    serviceConstants.url.getPaymentProfileSetupUrlConfig(),
    {
      paymentProvider: PAYMENT_PROVIDER.Stripe
    }
  );

  return response?.data?.providerPayload?.clientSecret ?? '';
};

export const isStripeEnabledForUser = async (): Promise<
  AxiosResponse<IsStripeEnabledForUserResponse>
> => {
  return httpService.get(serviceConstants.url.getStripeEnabledForUserConfig());
};

export const updatePaymentProfileDetails = async (
  paymentProfileId: string,
  expirationMonth: number,
  expirationYear: number
): Promise<boolean> => {
  const res = await httpService.post(serviceConstants.url.updatePaymentProfile(paymentProfileId), {
    expirationMonth,
    expirationYear
  });

  return res.status === 200;
};

export const deletePaymentProfile = async (paymentProfileId: string): Promise<boolean> => {
  const res = await httpService.delete(serviceConstants.url.updatePaymentProfile(paymentProfileId));

  return res.status === 200;
};

export default {
  verifyPaymentProfileCreationPoll,
  verifyPaymentProfileCreation,
  getSavedPaymentProfiles,
  getStripeClientSecret,
  isStripeEnabledForUser
};
