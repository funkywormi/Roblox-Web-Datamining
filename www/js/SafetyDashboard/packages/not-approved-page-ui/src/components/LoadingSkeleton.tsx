/**
 * Header slot skeleton: the title bar plus a square placeholder for the header's right-side
 * if read-only mode is false since the logout menu is hidden in read-only mode.
 */
export const LoadingSkeletonHeader = ({ readOnly }: { readOnly: boolean }) => {
  return (
    <div className="shrink-0 flex flex-row justify-between items-center gap-medium">
      <div className="bg-shift-100 height-[45px] width-[300px] max-width-[85%] radius-medium" />
      {!readOnly && (
        <div className="bg-shift-100 height-[35px] width-[35px] radius-medium shrink-0" />
      )}
    </div>
  );
};

/**
 * Body slot skeleton: the scrollable content placeholders. The outer scroll wrapper is omitted
 * because the host body provides it; only the inner placeholder layout lives here.
 */
export const LoadingSkeletonBody = () => {
  return (
    <div className="flex flex-col gap-large" data-testid="loading-skeleton-content">
      <div className="bg-shift-100 height-[20px] width-full max-width-[450px] radius-medium" />

      <div className="flex flex-col gap-medium">
        <div className="bg-shift-100 height-[30px] width-[125px] radius-medium" />
        <div className="bg-shift-100 height-[120px] width-full radius-medium" />
      </div>

      <div className="flex flex-col gap-medium">
        <div className="bg-shift-100 height-[30px] width-[200px] radius-medium" />
        <div className="bg-shift-100 height-[160px] width-full radius-medium" />
      </div>
    </div>
  );
};

/**
 * CTA slot skeleton: a single button placeholder.
 */
export const LoadingSkeletonCtas = () => {
  return (
    <div className="shrink-0 flex width-full justify-end medium:flex-row">
      <div className="bg-shift-100 height-[40px] width-full medium:width-[90px] radius-medium" />
    </div>
  );
};
