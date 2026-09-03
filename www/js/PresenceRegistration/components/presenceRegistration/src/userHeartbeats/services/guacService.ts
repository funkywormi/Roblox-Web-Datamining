import { callBehaviour } from "@rbx/core-scripts/guac";

import { defaultIntervalMs } from "../constants/constants";

type GuacResponse = {
  isEnabled?: boolean;
  rolloutPercentage?: number;
  intervalTimeMs?: number;
};

export type PulseGuacConfig = {
  isEnabled: boolean;
  rolloutPercentage: number;
  intervalTimeMs: number;
};

async function loadGuacConfig(): Promise<PulseGuacConfig> {
  try {
    const data = await callBehaviour<GuacResponse>("user-heartbeats");

    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!data) {
      return {
        isEnabled: false,
        rolloutPercentage: 0,
        intervalTimeMs: defaultIntervalMs,
      };
    }

    return {
      isEnabled: Boolean(data.isEnabled),
      rolloutPercentage: data.rolloutPercentage ?? 0,
      intervalTimeMs: data.intervalTimeMs ?? defaultIntervalMs,
    };
  } catch (e) {
    console.error(e);

    return {
      isEnabled: false,
      rolloutPercentage: 0,
      intervalTimeMs: defaultIntervalMs,
    };
  }
}

export default {
  loadGuacConfig,
};
