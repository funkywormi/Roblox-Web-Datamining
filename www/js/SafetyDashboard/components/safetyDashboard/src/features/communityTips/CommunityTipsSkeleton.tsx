import Skeleton from "../../shared/components/Skeleton";

const SKELETON_CARD_COUNT = 3;

/**
 * Loading placeholder for {@link CommunityTipsSection}. Mirrors the loaded section's shape (header,
 * subtitle, and a row of educational cards with their title/description) so the layout doesn't shift
 * once the account-standing request resolves. The indicator dots are intentionally omitted.
 */
const CommunityTipsSkeleton = () => (
  <div data-testid="community-tips-loading" className="flex flex-col gap-medium" aria-busy="true">
    <div className="flex flex-col gap-small">
      <Skeleton className="height-[24px] width-[200px] max-width-[50%] radius-small" />
      <Skeleton className="height-[14px] width-[320px] max-width-[80%] radius-small" />
    </div>

    <div
      className="flex gap-medium scroll-x padding-bottom-small"
      style={{ scrollbarWidth: "none" }}
    >
      {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
        <div key={index} className="flex flex-col gap-small shrink-0 width-[280px]">
          <Skeleton className="radius-medium height-[160px]" />
          <div className="flex flex-col gap-xsmall">
            <Skeleton className="height-[18px] width-[160px] radius-small" />
            <Skeleton className="height-[14px] width-[220px] radius-small" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default CommunityTipsSkeleton;
