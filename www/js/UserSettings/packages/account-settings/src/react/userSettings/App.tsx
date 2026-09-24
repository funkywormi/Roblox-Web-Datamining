import React, { useLayoutEffect } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { SnackbarProvider } from "@rbx/user-settings";
import UserSettingsBaseContainer from "./containers/UserSettingsBaseContainer";
import commonTranslationConstants from "./constants/contentConstants/commonTranslationConstants";
import settingsJourneyService from "./services/journeys/settingsJourneyService";

export const App = (): JSX.Element => {
  const { translate } = useTranslation();
  // Start capture before screen observers run, and clear it when Settings unmounts.
  useLayoutEffect(() => {
    settingsJourneyService.setEnabled(true);
    return () => settingsJourneyService.setEnabled(false);
  }, []);

  return (
    <SnackbarProvider translatedCloseLabel={translate(commonTranslationConstants.modal.closeBtn)}>
      <UserSettingsBaseContainer />
    </SnackbarProvider>
  );
};

export default App;
