/**
 * Payments API caller utilities with error handling, retry logic, and user feedback
 * Provides a clean, focused alternative to complex monolithic error handlers
 */

import { fireEvent } from 'roblox-event-tracker';
import { TranslateFunction } from 'react-utilities';
import { TSystemFeedbackService } from 'react-style-guide';
import { fireApiErrorCounters } from '../../core/utils/errorEventUtils';
import { ErrorUtils } from './errorUtils';
import { TRANSLATION_KEYS, SYSTEM_FEEDBACK_CONFIG } from '../constants/constants';

export type ApiCallType =
  | 'PreparePayment'
  | 'PreparePaymentForCreditConversion'
  | 'GetNextPurchasable'
  | 'UpdateAddress';

interface ApiCallOptions {
  /** Whether to retry on retryable errors (5xx, timeouts) */
  enableRetry?: boolean;
  /** Prefix for counter metrics */
  counterPrefix?: string;
  /** Whether to show error banner to user */
  showErrorBanner?: boolean;
  /** Custom error callback */
  onError?: (error: unknown) => void;
}

/**
 * Determines if an error should be retried
 */
function shouldRetry(error: unknown, callType: ApiCallType): boolean {
  const statusCode = ErrorUtils.extractStatusCode(error);

  // Don't retry rate limiting
  if (statusCode === 429) {
    return false;
  }

  // Don't retry InvalidProduct errors for UpdateAddress
  if (callType === 'UpdateAddress' && ErrorUtils.isInvalidProduct(error)) {
    return false;
  }

  // Don't retry client errors (4xx) except specific cases
  if (statusCode && statusCode >= 400 && statusCode < 500) {
    return statusCode === 408; // Only retry timeouts
  }

  // Retry server errors (5xx) and network errors (no status)
  return !statusCode || statusCode >= 500;
}

/**
 * Determines if we should show an error banner for this error
 */
function shouldShowErrorBanner(error: unknown, callType: ApiCallType): boolean {
  // Don't show banner for InvalidProduct on UpdateAddress - will be handled specially
  if (callType === 'UpdateAddress' && ErrorUtils.isInvalidProduct(error)) {
    return false;
  }

  return true;
}

/**
 * Simple API caller with configurable error handling
 * Much cleaner than the original monolithic function
 */
export async function callApi<T>(
  apiCall: () => Promise<T>,
  callType: ApiCallType,
  systemFeedbackService: TSystemFeedbackService,
  translate: TranslateFunction,
  options: ApiCallOptions = {}
): Promise<T> {
  const { enableRetry = false, counterPrefix, showErrorBanner = true, onError } = options;

  let lastError: unknown;
  const maxAttempts = enableRetry ? 2 : 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await apiCall();
    } catch (error) {
      lastError = error;
      const isRetryAttempt = attempt < maxAttempts;
      const statusCode = ErrorUtils.extractStatusCode(error);

      // Always log metrics
      fireApiErrorCounters('CreditConversion', callType, error);
      if (statusCode && counterPrefix) {
        const suffix = isRetryAttempt ? '_RETRY' : '';
        fireEvent(`${counterPrefix}${statusCode}${suffix}`);
      }

      // Decide if we should retry
      if (isRetryAttempt && shouldRetry(error, callType)) {
        // eslint-disable-next-line no-continue
        continue; // Try again
      }

      // Final failure - handle user feedback
      if (showErrorBanner && shouldShowErrorBanner(error, callType)) {
        systemFeedbackService.warning(
          translate(TRANSLATION_KEYS.GenericFailureAlert) ||
            'Something went wrong! Please try again later.',
          SYSTEM_FEEDBACK_CONFIG.TIMEOUT_SHOW_MS,
          SYSTEM_FEEDBACK_CONFIG.TIMEOUT_HIDE_MS
        );
      }

      // Custom error callback
      if (onError) {
        onError(error);
      }

      break; // Don't retry
    }
  }

  throw lastError;
}

/**
 * Creates a payments API caller with pre-configured error handling for different payment operations
 */
export function createApiCaller(
  systemFeedbackService: TSystemFeedbackService,
  translate: TranslateFunction
): {
  call: <T>(
    apiCall: () => Promise<T>,
    callType: ApiCallType,
    options?: ApiCallOptions
  ) => Promise<T>;
  callWithRetry: <T>(
    apiCall: () => Promise<T>,
    callType: ApiCallType,
    counterPrefix?: string
  ) => Promise<T>;
  callAddressUpdate: <T>(apiCall: () => Promise<T>, counterPrefix?: string) => Promise<T>;
} {
  return {
    /** Standard API call (no retry) */
    call: <T>(apiCall: () => Promise<T>, callType: ApiCallType, options?: ApiCallOptions) =>
      callApi(apiCall, callType, systemFeedbackService, translate, options),

    /** API call with retry enabled */
    callWithRetry: <T>(apiCall: () => Promise<T>, callType: ApiCallType, counterPrefix?: string) =>
      callApi(apiCall, callType, systemFeedbackService, translate, {
        enableRetry: true,
        counterPrefix
      }),

    /** Address update call with special InvalidProduct handling */
    callAddressUpdate: <T>(apiCall: () => Promise<T>, counterPrefix?: string) =>
      callApi(apiCall, 'UpdateAddress', systemFeedbackService, translate, {
        enableRetry: true,
        counterPrefix
      })
  };
}
