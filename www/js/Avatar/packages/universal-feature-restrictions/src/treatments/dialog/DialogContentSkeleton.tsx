/**
 * Loading skeleton for dialog content that mirrors the ready layout (body, card, actions) so the
 * visual jump when real content arrives is minimized.
 */
const DialogContentSkeleton = () => {
  return (
    <div className="flex flex-col gap-medium height-full min-height-0">
      <div className="flex flex-col gap-medium grow-1 scroll-y min-height-0">
        <div className="bg-shift-100 height-[40px] width-full radius-medium" />
        <div className="bg-shift-100 height-[180px] width-full radius-large" />
      </div>

      <div className="shrink-0 bg-shift-100 height-[40px] width-full radius-medium" />
    </div>
  );
};

export default DialogContentSkeleton;
