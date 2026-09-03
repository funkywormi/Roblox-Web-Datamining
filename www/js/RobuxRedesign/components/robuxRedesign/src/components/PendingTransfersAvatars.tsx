import { Icon } from "@rbx/foundation-ui";
import { PendingTransfer } from "../types/buyRobuxPageData";
import { UserAvatar } from "./UserAvatar";

const MAX_VISIBLE = 3;

// Mirrors `AvatarGroup type=Stack, _size=ControlSize.XSmall` from the
// Foundation Design Kit. Each non-first item has a circular bite cut out of
// its left side at the previous neighbour's centre (10px left of our box, on
// our 24px diameter), expanded by 2px so the visible 2px ring is the real
// parent surface showing through. We use a CSS mask cutout instead of the
// usual border/box-shadow ring because the parent surface (`bg-shift-100`)
// is translucent -- a painted ring would show the back avatar through it.
const MASK = "radial-gradient(circle at -10px 12px, transparent 14px, black 14px)";

export function PendingTransfersAvatars({
  pendingTransfers,
}: {
  pendingTransfers: PendingTransfer[];
}) {
  if (pendingTransfers.length === 0) return null;

  const overflow = pendingTransfers.length > MAX_VISIBLE;
  const visible = pendingTransfers.slice(0, overflow ? MAX_VISIBLE - 1 : MAX_VISIBLE);
  const total = visible.length + (overflow ? 1 : 0);

  const stackStyle = (index: number) => ({
    position: "relative" as const,
    marginLeft: index === 0 ? 0 : -2,
    zIndex: total - index,
    ...(index > 0 && { maskImage: MASK, WebkitMaskImage: MASK }),
  });

  return (
    <div className="flex flex-row items-center shrink-0">
      {visible.map((transfer, index) => (
        <div key={transfer.transferRequestId} style={stackStyle(index)}>
          <UserAvatar
            thumbnailUrl={transfer.sender.thumbnailUrl}
            displayName={transfer.sender.displayName}
            size="XSmall"
            className="bg-shift-200"
          />
        </div>
      ))}
      {overflow && (
        <div style={stackStyle(visible.length)}>
          <div
            aria-hidden="true"
            className="height-600 width-600 radius-circle bg-shift-200 flex items-center justify-center shrink-0"
          >
            <Icon name="icon-filled-three-dots-horizontal" size="XSmall" />
          </div>
        </div>
      )}
    </div>
  );
}
