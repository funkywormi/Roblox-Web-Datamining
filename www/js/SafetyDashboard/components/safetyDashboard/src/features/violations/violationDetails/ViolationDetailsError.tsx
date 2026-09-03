import { ReactElement } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import InlineError from "../../../shared/components/InlineError";
import { InvalidViolationError, isHTTPError, isMock404 } from "../util/violations";

interface ViolationDetailsErrorProps {
  error: unknown;
  onRefresh: () => unknown;
}

/**
 * Renders the error content for the violation detail page. When the violation
 * can't be found (invalid id, 404, or mock-404) we show a static "not found"
 * message; for any other (unexpected) error we show a refreshable inline error.
 */
const ViolationDetailsError = ({ error, onRefresh }: ViolationDetailsErrorProps): ReactElement => {
  const { translate } = useTranslation();

  const isNotFound =
    error instanceof InvalidViolationError ||
    (isHTTPError(error) && error.status === 404) ||
    isMock404(error);

  if (isNotFound) {
    return <InlineError errorMessage={translate("Description.AppealsNotFound")} />;
  }

  console.warn("Unknown useViolation error", error);
  return <InlineError onRefresh={onRefresh} />;
};

export default ViolationDetailsError;
