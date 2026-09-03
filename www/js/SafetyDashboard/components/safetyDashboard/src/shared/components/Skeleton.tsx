import classNames from "classnames";

type SkeletonProps = {
  className?: string;
};

/**
 * Animated loading placeholder. Applies the neutral `bg-shift-100` fill plus a
 * shimmer sweep; callers pass layout classes to size and shape each block. Can
 * be deleted once Foundation UI adds a native skeleton component.
 */
const Skeleton = ({ className }: SkeletonProps) => (
  <div className={classNames("bg-shift-100 sd-skeleton", className)} />
);

export default Skeleton;
