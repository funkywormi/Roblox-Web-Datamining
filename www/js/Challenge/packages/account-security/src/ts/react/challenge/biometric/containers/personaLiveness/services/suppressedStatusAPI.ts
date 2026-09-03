import { EnvironmentUrls } from "Roblox";

const { userModerationApi } = EnvironmentUrls;

const NOT_APPROVED_URL = `${userModerationApi}/v2/not-approved`;

type NotApprovedV2Response = {
  restriction: unknown;
};

/**
 * Returns true while the user is suppressed, false once unlocked, and null
 * on transient failure so the caller can keep polling instead of terminating.
 */
export const getIsSuppressed = async (): Promise<boolean | null> => {
  try {
    const response = await fetch(NOT_APPROVED_URL, {
      method: "GET",
      credentials: "include",
      redirect: "manual",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.error("Suppressed status fetch failed", response.status);
      return null;
    }

    const data = (await response.json()) as NotApprovedV2Response;
    return data.restriction !== null;
  } catch (err) {
    console.error("Error fetching suppressed status", err);
    return null;
  }
};
