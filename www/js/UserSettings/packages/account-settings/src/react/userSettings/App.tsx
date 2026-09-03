import React from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { SnackbarProvider } from "@rbx/user-settings";
import UserSettingsBaseContainer from "./containers/UserSettingsBaseContainer";
import commonTranslationConstants from "./constants/contentConstants/commonTranslationConstants";

export const App = (): JSX.Element => {
  const { translate } = useTranslation();

  return (
    <SnackbarProvider translatedCloseLabel={translate(commonTranslationConstants.modal.closeBtn)}>
      <UserSettingsBaseContainer />
    </SnackbarProvider>
  );
};

export default App;
