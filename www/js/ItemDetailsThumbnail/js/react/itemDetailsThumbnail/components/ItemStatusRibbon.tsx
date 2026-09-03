import React from 'react';
import { TranslateFunction } from 'react-utilities';
import { TItemStatus } from 'react-style-guide';

export function ItemRestrictionRibbon({
  itemStatuses,
  translate
}: {
  itemStatuses: Array<TItemStatus>;
  translate: TranslateFunction;
}): JSX.Element {
  if (itemStatuses === undefined || itemStatuses.length === 0) {
    return <React.Fragment />;
  }

  // Statuses that carry their own pre-rendered element opt out of the
  // right-aligned `.asset-status-icon` container so they can position themselves
  // freely (e.g. IsFae anchors top-left via inline absolute positioning).
  const elementStatuses = itemStatuses.filter(status => status.element);
  const legacyStatuses = itemStatuses.filter(status => !status.element);

  return (
    <React.Fragment>
      {elementStatuses.map((status: TItemStatus) => (
        <React.Fragment key={status.type}>{status.element}</React.Fragment>
      ))}
      {legacyStatuses.length > 0 && (
        <div className='asset-status-icon'>
          {legacyStatuses.map((status: TItemStatus) => (
            <div
              className={`${status.isIcon ? 'has-icon' : ''} ${status.class} asset-status-text`}
              key={status.type}>
              {status.isIcon && <span className={status.type} />}
              {!!status.label && <span>{translate(status.label)}</span>}
            </div>
          ))}
        </div>
      )}
    </React.Fragment>
  );
}

export default ItemRestrictionRibbon;
