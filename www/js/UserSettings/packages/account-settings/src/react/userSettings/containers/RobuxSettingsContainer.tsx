import { TranslationProvider } from "@rbx/core-scripts/react";
import TransferLimitsContainer from "@rbx/transfer-platform-common/transferManagement/containers/TransferLimitsContainer";
import translationConfig from "@rbx/transfer-platform-common/transferManagement/translation.config";

export const RobuxSettingsContainer = (): JSX.Element => {
  return (
    <TranslationProvider config={translationConfig}>
      <TransferLimitsContainer />
    </TranslationProvider>
  );
};
