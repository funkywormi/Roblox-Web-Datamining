/**
 * Types for on-device-parent verification.
 */

/** `verificationType` for `start-odp-verification`; the service maps each to its ODP Persona template. */
export enum OnDeviceParentVerificationMethod {
  Fae = "FAE",
  Idv = "IDV",
}

export type StartOnDeviceParentVerificationResponse = {
  /** The Persona inquiry id. */
  sessionIdentifier: string | null;
  /** The vendor's hosted page, used in a webview where the embedded SDK does not run reliably. */
  verificationLink: string | null;
};

/** Why the vendor stage ended without the parent submitting anything. */
export enum VendorSessionFailure {
  /** `start-odp-verification` rejected, or returned no inquiry to open. */
  StartFailed = "StartFailed",
  /** The vendor SDK raised an unrecoverable error. */
  VendorError = "VendorError",
}

/**
 * How the vendor stage ended. `Submitted` means the parent completed the vendor flow,
 * but does not necessarily mean they passed the criteria to be a parent. That is decided
 * server-side and is never returned to this client.
 */
export enum VendorOutcome {
  /** The parent completed the vendor flow. */
  Submitted = "Submitted",
  /** The parent dismissed the vendor flow without completing it. */
  Cancelled = "Cancelled",
  /** The flow could not be started, or the vendor SDK broke; `failure` says which. */
  Failed = "Failed",
}

export type VendorSessionResult =
  | { outcome: VendorOutcome.Submitted }
  | { outcome: VendorOutcome.Cancelled }
  | { outcome: VendorOutcome.Failed; failure: VendorSessionFailure };
