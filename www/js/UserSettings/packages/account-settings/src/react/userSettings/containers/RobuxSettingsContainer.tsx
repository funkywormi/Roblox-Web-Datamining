import { TranslationProvider } from "@rbx/core-scripts/react";
import { toRobuxTransferLimitsInputFromSetting } from "@rbx/user-settings";
import TransferLimitsContainer from "@rbx/transfer-platform-common/transferManagement/containers/TransferLimitsContainer";
import translationConfig from "@rbx/transfer-platform-common/transferManagement/translation.config";
import useGetSettingsAndOptionsV2 from "../../apis/hooks/useGetSettingsAndOptionsV2";

export const RobuxSettingsContainer = (): JSX.Element => {
  const [settingsAndOptions, isLoading, isError] = useGetSettingsAndOptionsV2();

  return (
    <TranslationProvider config={translationConfig}>
      <TransferLimitsContainer
        storedLimits={{
          caps: settingsAndOptions
            ? toRobuxTransferLimitsInputFromSetting(settingsAndOptions.robuxTransferLimits)
            : undefined,
          isLoading,
          isError,
        }}
      />
    </TranslationProvider>
  );
};
