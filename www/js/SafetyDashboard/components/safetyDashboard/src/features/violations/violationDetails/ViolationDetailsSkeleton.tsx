import Skeleton from "../../../shared/components/Skeleton";

/**
 * Loading placeholder for the violation details page. Mimics the real layout
 * (title + timestamp, the "What happened" and "Activity reviewed" sections, and
 * the appeal action).
 *
 * The timeline is intentionally omitted: its shape depends on how many appeals a
 * violation has, which isn't known until the data loads, so a placeholder for it
 * would more often mislead than match.
 */
const ViolationDetailsSkeleton = () => (
  <div className="flex flex-col gap-xxlarge" role="progressbar" aria-label="Loading content">
    {/* Title + timestamp */}
    <div className="flex flex-col gap-xsmall padding-bottom-small">
      <Skeleton className="height-[28px] width-[55%] radius-small" />
      <Skeleton className="height-[14px] width-[180px] radius-small" />
    </div>

    {/* What happened */}
    <div className="flex flex-col gap-medium">
      <Skeleton className="height-[22px] width-[160px] radius-small" />
      <Skeleton className="flex flex-col height-[150px] gap-small radius-medium padding-xlarge" />
    </div>

    {/* Activity reviewed */}
    <div className="flex flex-col gap-medium">
      <Skeleton className="height-[22px] width-[180px] radius-small" />
      <Skeleton className="flex flex-col height-[150px] gap-small radius-medium padding-xlarge" />
    </div>

    {/* Send appeal */}
    <div className="flex flex-col gap-medium medium:items-start padding-top-small">
      <Skeleton className="height-[40px] width-full medium:width-[140px] radius-medium" />
      <Skeleton className="height-[12px] width-[220px] radius-small" />
    </div>
  </div>
);

export default ViolationDetailsSkeleton;
