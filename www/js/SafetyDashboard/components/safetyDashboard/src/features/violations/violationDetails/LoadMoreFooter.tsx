import { Button, IconButton, ProgressCircle } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";

type LoadMoreFooterProps = {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onClose: () => void;
};

/**
 * Compact feedback for infinite-scroll pagination on the violations list. While the
 * next page is in flight it shows a centered progress circle; when a page fetch fails
 * it switches to an error snackbar with Retry and Close actions.
 */
const LoadMoreFooter = ({ isLoading, isError, onRetry, onClose }: LoadMoreFooterProps) => {
  const { translate } = useTranslation();

  /**
   * We only want to show the content if it's valid but we still want to render the container
   * no matter what in order to reserve space and minimze layout shifts.
   */
  const hasContent = isLoading || isError;

  return (
    <div className="flex items-center justify-center min-height-[56px] margin-y-medium">
      {hasContent &&
        (isLoading ? (
          <ProgressCircle
            ariaLabel={translate("Label.Loading")}
            size="Medium"
            variant="Indeterminate"
          />
        ) : (
          <div
            role="status"
            className="flex items-center justify-between gap-medium width-full max-width-[500px] radius-medium bg-inverse-surface-0 padding-x-medium padding-y-small"
          >
            <span className="text-body-medium text-wrap content-inverse-emphasis">
              {translate("Label.LoadingViolationsError")}
            </span>

            <div className="flex items-center">
              <Button variant="Utility" size="Medium" onClick={onRetry}>
                <span
                  className="text-body-medium content-inverse-emphasis underline"
                  style={{ textUnderlineOffset: "3px" }}
                >
                  {translate("Action.Retry")}
                </span>
              </Button>

              <IconButton
                icon="icon-regular-x"
                ariaLabel={translate("Action.Close")}
                variant="Utility"
                size="Medium"
                iconColor="Inverse"
                onClick={onClose}
              />
            </div>
          </div>
        ))}
    </div>
  );
};

export default LoadMoreFooter;
