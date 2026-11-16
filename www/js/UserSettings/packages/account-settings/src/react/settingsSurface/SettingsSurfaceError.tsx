import type { JSX } from "react";
import { useTranslation } from "react-utilities";
import { Alert } from "@rbx/foundation-ui";

// Feature.AccountSettings keys. The surface's own copy is translated by the server; these are only
// the client's chrome around it, with English fallbacks for hosts whose namespace lacks them.
const translationKeys = {
  body: "Response.Dialog.DefaultErrorMessage",
  tryAgain: "Action.TryAgain",
};

export type SettingsSurfaceErrorProps = {
  /** Shows a "Try again" action that calls this. Omit it where the host can't retry. */
  onRetry?: () => void;
  /** Layout classes for the host, e.g. the account settings page container. */
  className?: string;
};

/**
 * Shown when a settings surface can't be shown: the query failed, or the server sent no surface or
 * no copy for it. Generic so every in-context host (account settings tabs, parental controls,
 * modals) shows the same error.
 */
export const SettingsSurfaceError = ({
  onRetry,
  className,
}: SettingsSurfaceErrorProps): JSX.Element => {
  const { translate } = useTranslation();
  return (
    <div className={className} data-testid="settings-surface-error">
      <Alert
        variant="Feedback"
        severity="Error"
        hasCloseAffordance={false}
        primaryActionLabel={
          onRetry ? translate(translationKeys.tryAgain, undefined, "Try again") : undefined
        }
        onPrimaryAction={onRetry}
      >
        {translate(translationKeys.body, undefined, "Something went wrong. Please try again.")}
      </Alert>
    </div>
  );
};

export default SettingsSurfaceError;
