import {
  useBreakpoint as useBreakpointFromPayments,
  type BreakpointResult as PaymentsBreakpointResult,
} from "@rbx/payments/hooks";

/**
 * @deprecated Use @rbx/payments/hooks instead
 */
export const useBreakpoint = useBreakpointFromPayments;

/**
 * @deprecated Use @rbx/payments/hooks instead
 */
export type BreakpointResult = PaymentsBreakpointResult;
