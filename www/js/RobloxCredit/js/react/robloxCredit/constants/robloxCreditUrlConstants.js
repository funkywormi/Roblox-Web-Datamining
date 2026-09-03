import { EnvironmentUrls } from 'Roblox';

const { apiGatewayUrl } = EnvironmentUrls;

export const getConversionMetadataUrlConfig = () => ({
  withCredentials: true,
  url: `${apiGatewayUrl}/credit-balance/v1/get-conversion-metadata`
});

export const processPaymentUrlConfig = () => ({
  withCredentials: true,
  url: `${apiGatewayUrl}/payments-gateway/v1/process-payment`
});

export const COUNTER_METRICS = {
  PROCESS_PAYMENT_FAILED_STATUS_CODE_PREFIX: 'ProcessPaymentRequestFailedStatusCode',
  PROCESS_PAYMENT_NOT_SUCCESSFUL_PREFIX: 'ProcessPaymentNotSuccessful',
  PROCESS_PAYMENT_RESPONSE_MESSAGE_PREFIX: 'ProcessPaymentNotSuccessful',
  PROCESS_PAYMENT_UNEXPECTED_EXCEPTION: 'ProcessPaymentUnexpectedException',
  GET_CONVERSION_METADATA_FAILED_PREFIX: 'GetConversionMetadataFailed'
};
