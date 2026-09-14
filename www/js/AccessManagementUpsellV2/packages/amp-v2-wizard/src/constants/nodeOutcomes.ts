/** The outcomes OdpAgeVerificationFlow declares for its challenge nodes. */
export const ChallengeOutcome = {
  /** The parent completed the vendor flow. Whether that authorizes the session is decided server-side. */
  Submitted: "Submitted",
  Failure: "Failure",
  Cancel: "Cancel",
} as const;

/** The outcome SessionPolling reports. */
export const PollingOutcome = {
  Poll: "Poll",
} as const;
