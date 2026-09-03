import { fireEvent } from 'roblox-event-tracker';

export interface PaymentResult {
  status: number;
  data?: {
    providerPayload?: {
      IsSuccessful?: boolean;
      ResponseMessage?: string;
      RedirectionUrl?: string;
    };
    isSuccess?: boolean;
  };
}

export interface PaymentProcessingConfig {
  failedStatusPrefix: string;
  unsuccessfulPrefix?: string;
  onStatusError: (status: number) => void;
  onSuccess: (result: any, isSuccessful: boolean) => void | Promise<void>;
  onError?: (error: any) => void;
}

/**
 * Handles common payment processing logic including status checks, event firing, and success/failure handling
 * @param paymentCall - The payment API call function
 * @param config - Configuration object for handling different scenarios
 * @returns Promise that resolves when payment processing is complete
 */
export const processPaymentWithCommonHandling = async (
  paymentCall: () => Promise<PaymentResult>,
  config: PaymentProcessingConfig
): Promise<void> => {
  try {
    const result = await paymentCall();

    // Handle non-200 status codes
    if (result.status !== 200) {
      config.onStatusError(result.status);
      fireEvent(`${config.failedStatusPrefix}${result.status}`);
      return;
    }

    // Extract result data and determine success
    const providerPayload = result.data?.providerPayload;
    const isSuccessful = providerPayload?.IsSuccessful ?? result.data?.isSuccess ?? false;

    // Handle unsuccessful payment (but successful API call)
    if (!isSuccessful && config.unsuccessfulPrefix) {
      fireEvent(`${config.unsuccessfulPrefix}${providerPayload?.ResponseMessage || ''}`);
    }

    // Call success handler
    await config.onSuccess(result, isSuccessful);
  } catch (error) {
    config.onError?.(error);
  }
};
