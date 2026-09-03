import { callBehaviour } from "@rbx/core-scripts/guac";

export const getVoicePolicy = async () => {
  const data = await callBehaviour<{ requireExplicitVoiceConsent: boolean }>(
    "free-communication-infographics",
  );
  return data;
};
