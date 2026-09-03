import Skeleton from "../../shared/components/Skeleton";

const ROW_KEYS = ["a", "b", "c"];

/**
 * A single placeholder row shaped like a `ViolationRow` (`ListItem`): a stacked
 * title + timestamp on the left and a trailing chevron-sized box on the right,
 * separated from the next row by a full-width divider.
 */
const ViolationRowSkeleton = () => (
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
 * Loading placeholder for the full violations page. Mimics the real layout: the
 * support-form description paragraph followed by a divider-separated list of
 * violation rows. Three rows are shown as a representative sample since the real
 * count isn't known until the data loads.
 */
const ViolationsListSkeleton = () => (
  <div className="flex flex-col gap-[30px]" role="progressbar" aria-busy="true">
    <Skeleton className="height-300 width-[300px] radius-small" />
    <div className="flex flex-col gap-small">
      {ROW_KEYS.map(key => (
        <ViolationRowSkeleton key={key} />
      ))}
    </div>
  </div>
);

export default ViolationsListSkeleton;
