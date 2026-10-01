import { callBehaviour } from "@rbx/core-scripts/guac";
import { Result } from "../../result";
import * as UniversalAppConfiguration from "../types/universalAppConfiguration";

export const getSettingsUiPolicy = async (): Promise<
  Result<
    UniversalAppConfiguration.GetSettingsUIPolicyReturnType,
    UniversalAppConfiguration.GetSettingsUIPolicyError | null
  >
> => {
  try {
    const data =
      await callBehaviour<UniversalAppConfiguration.GetSettingsUIPolicyReturnType>(
        "account-settings-ui",
      );
    return { isError: false, value: data };
  } catch (error) {
    return {
      isError: true,
      error: UniversalAppConfiguration.GetSettingsUIPolicyError.INTERNAL_ERROR,
      errorRaw: error,
      errorStatusCode: null,
    };
  }
};
