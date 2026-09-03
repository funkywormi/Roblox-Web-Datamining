import { Fragment, JSX } from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { ItemStatus, mapItemStatusIconsAndLabels } from "../utils";

function ItemCardStatus({
  itemStatus,
  translate,
}: {
  itemStatus: string[] | undefined;
  translate: TranslateFunction;
}): JSX.Element | null {
  const itemStatusLabels = mapItemStatusIconsAndLabels(itemStatus);

  // Statuses that carry their own pre-rendered element opt out of the
  // right-aligned `.asset-status-icon` container so they can position themselves
  // freely (e.g. IsFae anchors top-left via inline absolute positioning).
  const elementStatuses = itemStatusLabels.filter(s => s.element);
  const legacyStatuses = itemStatusLabels.filter(s => !s.element);

  return itemStatus?.length ? (
    <Fragment>
      {elementStatuses.map((status: ItemStatus) => (
        <Fragment key={status.type}>{status.element}</Fragment>
      ))}
      {legacyStatuses.length > 0 && (
        <div className="item-cards-stackable">
          <div className="asset-status-icon">
            {legacyStatuses.map((status: ItemStatus) => (
              <div
                className={`${status.isIcon ? "has-icon" : ""} ${status.class}`}
                key={status.type}
              >
                {status.isIcon && <span className={status.type} />}
                {status.label && <span>{translate(status.label)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </Fragment>
  ) : null;
}

export default ItemCardStatus;
