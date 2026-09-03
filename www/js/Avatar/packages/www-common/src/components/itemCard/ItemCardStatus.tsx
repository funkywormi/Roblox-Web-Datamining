import type { JSX } from "react";
import { Icon } from "@rbx/foundation-ui";
import FaeStatusBadge from "./FaeStatusBadge";
import { mapItemStatusIconsAndLabels } from "./utils";
import type { ItemCardTranslate, ItemStatus } from "./types";

function ItemCardStatus({
  itemStatus,
  translate,
}: {
  itemStatus: string[] | undefined;
  translate: ItemCardTranslate;
}): JSX.Element | null {
  const statuses = mapItemStatusIconsAndLabels(itemStatus);
  if (!statuses.length) {
    return null;
  }

  // FAE carries its own absolute positioning (top-left); everything else stacks
  // top-right over the thumbnail.
  const faeStatuses = statuses.filter((s: ItemStatus) => s.isFae);
  const overlayStatuses = statuses.filter((s: ItemStatus) => !s.isFae);

  return (
    <>
      {faeStatuses.map((status: ItemStatus) => (
        <FaeStatusBadge key={status.type} />
      ))}
      {overlayStatuses.length > 0 && (
        <div className="www-item-card-status flex flex-col items-end gap-xxsmall">
          {overlayStatuses.map((status: ItemStatus) => (
            <span
              key={status.type}
              className="inline-flex items-center gap-xxsmall padding-y-xxsmall padding-x-xsmall radius-circle bg-surface-0 content-emphasis"
            >
              {status.iconName && <Icon name={status.iconName} size="XSmall" />}
              {status.label && <span>{translate(status.label)}</span>}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

export default ItemCardStatus;
