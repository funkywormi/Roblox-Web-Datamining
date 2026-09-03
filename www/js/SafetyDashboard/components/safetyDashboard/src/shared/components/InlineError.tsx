import { IconButton } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";

/**
 * Show an error message with an optional refresh button.
 */
const InlineError = ({
  errorMessage,
  onRefresh,
}: {
  errorMessage?: string;
  onRefresh?: () => unknown;
}): JSX.Element => {
  const { translate } = useTranslation();
  const actualMessage =
    errorMessage && errorMessage.length > 0 ? errorMessage : translate("Response.UnexpectedError");

  return (
    <div
      className="flex flex-col medium:flex-row gap-large items-center bg-surface-100 padding-xxlarge radius-medium"
      data-testid="InlineError"
      role="alert"
    >
      <span className="icon-spot-error-2xl shrink-0" />

      <div className="width-full flex gap-large justify-center medium:justify-between items-center">
        <p className="text-body-medium">{actualMessage}</p>
        {onRefresh && (
          <IconButton
            className="shrink-0"
            size="Medium"
            variant="Standard"
            icon="icon-regular-two-arrows-spin-clockwise"
            ariaLabel={translate("Action.Retry")}
            onClick={() => {
              onRefresh();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default InlineError;
