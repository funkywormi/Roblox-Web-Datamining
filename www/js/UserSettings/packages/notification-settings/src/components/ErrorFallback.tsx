import { JSX, useEffect } from "react";
import { useSnackbar } from "@rbx/user-settings";
import { useTranslation } from "@rbx/core-scripts/react";
import translationConstants from "../constants/translationConstants";

export const ErrorFallback = (): JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();

  useEffect(() => {
    snackbarService.warning(translate(translationConstants.unknownError));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div data-testid="notification-settings-error-fallback">
      {translate(translationConstants.unknownError)}
    </div>
  );
};
