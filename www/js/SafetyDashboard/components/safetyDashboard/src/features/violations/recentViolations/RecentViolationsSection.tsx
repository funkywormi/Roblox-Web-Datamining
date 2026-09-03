import { Link } from "react-router-dom";
import { Icon } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { useViolations } from "../../../api/useViolations";
import ViolationList from "../ViolationList";
import RecentViolationsSkeleton from "./RecentViolationsSkeleton";
import ViolationsDescription from "../ViolationsDescription";

const VIOLATION_LIMIT = 5;

/**
 * Shows the user's most recent violations up to the limit. The user can click on the header
 * to navigate towards the page with all of the violations listed.
 */
const RecentViolationsSection = () => {
  const { translate } = useTranslation();
  const { violations, isLoading, isLoadingError } = useViolations();

  const recentViolations = violations.slice(0, VIOLATION_LIMIT);
  const hasViolations = !isLoadingError && recentViolations.length > 0;

  /**
   * We only surface a description for the error and empty states; in the general case
   * (there are violations to list) we render nothing and save the Support form fallback
   * for the full violations page to encourage users to view ALL of their violations first.
   *
   * This query is shared with the full violations page, which paginates via
   * `fetchNextPage`. We gate on `isLoadingError` (error with no data) rather than
   * `isError` so a later next-page failure doesn't wipe out the good initial data
   * and swap it for an error message when the user returns to this surface.
   */
  let descriptionVariant: "error" | "empty" | undefined;
  if (isLoadingError) {
    descriptionVariant = "error";
  } else if (recentViolations.length === 0) {
    descriptionVariant = "empty";
  }

  return (
    <div data-testid="recent-violations-section" className="flex flex-col gap-medium">
      <div className="flex flex-col">
        <Link to="/violations" className="flex items-center width-fit gap-xsmall">
          <h2 className="text-heading-small content-emphasis">
            {translate("Heading.RecentViolations")}
          </h2>
          <Icon name="icon-filled-chevron-large-right" className="rtl:[transform:scaleX(-1)]" />
        </Link>

        {!isLoading && descriptionVariant && <ViolationsDescription variant={descriptionVariant} />}
      </div>

      {isLoading ? (
        <RecentViolationsSkeleton />
      ) : (
        hasViolations && <ViolationList violations={recentViolations} fromList={false} />
      )}
    </div>
  );
};

export default RecentViolationsSection;
