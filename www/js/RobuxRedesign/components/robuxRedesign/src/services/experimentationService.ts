import type ExperimentationService from "@rbx/experimentation";

const POLL_INTERVAL_MS = 100;
const POLL_TIMEOUT_MS = 5_000;

/**
 * Waits for the runtime-linked experimentation bundle to become available.
 */
export const waitForExperimentationService = async (): Promise<typeof ExperimentationService> => {
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  let service: typeof ExperimentationService | undefined = window.Roblox.ExperimentationService;

  while (!service) {
    if (Date.now() > deadline) {
      throw new Error("ExperimentationService not available before timeout");
    }
    // eslint-disable-next-line no-await-in-loop
    await new Promise<void>(resolve => {
      window.setTimeout(resolve, POLL_INTERVAL_MS);
    });
    service = window.Roblox.ExperimentationService;
  }

  return service;
};
