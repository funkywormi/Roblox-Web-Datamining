import Skeleton from "../../../shared/components/Skeleton";

/**
 * Loading placeholder for the recent violations section.
 */
const RecentViolationsSkeleton = () => (
  <div aria-busy="true">
    <Skeleton className="height-[150px] radius-large" />
  </div>
);

export default RecentViolationsSkeleton;
