import Skeleton from "../../shared/components/Skeleton";

/**
 * Loading placeholder for {@link StatusHero}. Mirrors the loaded card's shape
 * (heading, progress bar, description, link) so the layout doesn't shift once
 * the account-standing request resolves.
 */
const StatusHeroSkeleton = () => (
  <div
    data-testid="status-hero-loading"
    className="flex flex-col gap-xlarge padding-xxlarge bg-surface-100 radius-large items-start"
    aria-busy="true"
  >
    <Skeleton className="height-600 width-[200px] max-width-[50%] radius-small margin-y-[8px]" />

    <div className="flex flex-col gap-small width-full">
      <Skeleton className="height-250 width-full radius-small" />
      <div className="flex justify-between">
        <Skeleton className="height-250 width-1500 radius-small" />
        <Skeleton className="height-250 width-1500 radius-small" />
      </div>
    </div>

    <Skeleton className="height-1500 small:height-900 medium:height-400 width-full radius-small" />
    <Skeleton className="height-400 width-[275px] max-width-[75%] radius-small" />
  </div>
);

export default StatusHeroSkeleton;
