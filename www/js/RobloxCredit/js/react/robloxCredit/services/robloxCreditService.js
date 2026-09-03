import { httpService } from 'core-utilities';
import {
  getConversionMetadataUrlConfig,
  processPaymentUrlConfig
} from '../constants/robloxCreditUrlConstants';

export const getConversionMetadata = async () => {
  const urlConfig = getConversionMetadataUrlConfig();
  return httpService.get(urlConfig);
};

export const processPayment = async () => {
  const body = {
    paymentProviderType: 'Credit'
  };

  const urlConfig = processPaymentUrlConfig();
  return httpService.post(urlConfig, body);
};
