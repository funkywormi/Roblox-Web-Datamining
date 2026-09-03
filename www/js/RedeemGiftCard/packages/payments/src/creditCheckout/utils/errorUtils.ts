/**
 * Error handling utilities for payment flows
 * Provides type-safe error detection and handling functions
 */

import { CodedExceptionInvalidProduct } from "../constants/redeemConstants";

/**
 * Standard API error structure that we expect from backend services
 */
export interface ApiError {
  status?: number;
  response?: {
    status?: number;
    data?: unknown;
  };
  data?: unknown;
  message?: string;
}

/**
 * Type guard to check if an unknown value is an API error
 * @param error - The error object to check
 * @returns boolean - true if the error conforms to ApiError interface
 */
export const isApiError = (error: unknown): error is ApiError => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const errorObj = error as Record<string, unknown>;
  return (
    typeof errorObj.status === "number" ||
    (typeof errorObj.response === "object" &&
      errorObj.response !== null &&
      typeof (errorObj.response as Record<string, unknown>).status === "number")
  );
};

/**
 * Safely extracts status code from various error formats
 * @param error - The error object to extract status from
 * @returns number | undefined - the HTTP status code if found
 */
export const extractStatusCode = (error: unknown): number | undefined => {
  if (!isApiError(error)) {
    return undefined;
  }

  return error.status || error.response?.status;
};

/**
 * Safely extracts error data from various error formats
 * @param error - The error object to extract data from
 * @returns unknown - the error data if found
 */
export const extractErrorData = (error: unknown): unknown => {
  if (!isApiError(error)) {
    return undefined;
  }

  return error.response?.data || error.data;
};

/**
 * Type-safe function to check if an error indicates an invalid product
 * @param error - The error object to check
 * @returns boolean - true if the error indicates CodedExceptionInvalidProduct
 */
export const isInvalidProduct = (error: unknown): boolean => {
  const status = extractStatusCode(error);
  const responseData = extractErrorData(error);

  return status === 422 && responseData === CodedExceptionInvalidProduct;
};

/**
 * Checks if an error is a network-related error that should be retried
 * @param error - The error object to check
 * @returns boolean - true if this is a retryable network error
 */
export const isRetryableNetworkError = (error: unknown): boolean => {
  const status = extractStatusCode(error);

  // Don't retry client errors (4xx) except for certain cases
  if (status && status >= 400 && status < 500) {
    // Don't retry rate limiting or invalid product errors
    if (status === 429 || isInvalidProduct(error)) {
      return false;
    }
    // 408 Request Timeout is retryable
    return status === 408;
  }

  // Retry server errors (5xx) and network errors (no status)
  return !status || status >= 500;
};

/**
 * Safely extracts error message from various error formats
 * @param error - The error object to extract message from
 * @returns string - the error message or a default message
 */
export const extractErrorMessage = (error: unknown): string => {
  if (!error) {
    return "Unknown error occurred";
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object") {
    const errorObj = error as Record<string, unknown>;

    // Try various common error message fields
    if (typeof errorObj.message === "string") {
      return errorObj.message;
    }

    if (typeof errorObj.error === "string") {
      return errorObj.error;
    }

    // Try response data
    const responseData = extractErrorData(error);
    if (typeof responseData === "string") {
      return responseData;
    }

    if (responseData && typeof responseData === "object") {
      const dataObj = responseData as Record<string, unknown>;
      if (typeof dataObj.message === "string") {
        return dataObj.message;
      }
    }
  }

  return "An error occurred";
};

/**
 * Error utilities object for easier importing
 */
export const ErrorUtils = {
  isApiError,
  extractStatusCode,
  extractErrorData,
  isInvalidProduct,
  isRetryableNetworkError,
  extractErrorMessage,
} as const;

export default ErrorUtils;
