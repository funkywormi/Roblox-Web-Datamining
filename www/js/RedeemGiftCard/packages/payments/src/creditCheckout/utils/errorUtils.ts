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
 * Error utilities object for easier importing
 */
export const ErrorUtils = {
  isApiError,
  extractStatusCode,
  extractErrorData,
  isInvalidProduct,
} as const;

export default ErrorUtils;
