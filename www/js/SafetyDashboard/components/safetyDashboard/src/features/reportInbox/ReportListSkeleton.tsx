import Skeleton from "../../shared/components/Skeleton";

const ROW_KEYS = ["a", "b", "c"];

/**
 * A single placeholder row shaped like a report `ListItem`.
 */
const ReportRowSkeleton = () => (
  <div className="flex flex-col gap-small">
    <div className="flex items-center justify-between gap-medium padding-y-medium">
      <div className="flex flex-col gap-xsmall">
        <Skeleton className="height-350 width-1500 radius-small" />
        <Skeleton className="height-300 width-[150px] radius-small" />
      </div>
      <Skeleton className="size-500 radius-small shrink-0 margin-right-[4px]" />
    </div>

    <div className="width-full height-[1px] bg-shift-100" />
  </div>
);

/**
 * Loading placeholder for the report inbox list.
 */
const ReportListSkeleton = () => (
  <div className="flex flex-col gap-small" role="progressbar" aria-busy="true">
    {ROW_KEYS.map(key => (
      <ReportRowSkeleton key={key} />
    ))}
  </div>
);

export default ReportListSkeleton;
