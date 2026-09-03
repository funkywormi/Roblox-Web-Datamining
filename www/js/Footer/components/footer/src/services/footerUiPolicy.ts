import { callBehaviour } from "@rbx/core-scripts/guac";

const getIsYourPrivacyChoicesModalAsync = async (): Promise<boolean> => {
  try {
    const data = await callBehaviour<{ IsPrivacyChoiceModalEnabled: boolean }>("footer-ui");
    return data.IsPrivacyChoiceModalEnabled;
  } catch {
    return false;
  }
};

export { getIsYourPrivacyChoicesModalAsync };
