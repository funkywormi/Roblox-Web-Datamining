import React from "react";

/*
  Pass translated text to this component
  Consumers can provide a component to render the current value
  Todo: Merge description and descriptionWithLink into a single prop (React.JSX.Element) and update downstream consumers
*/
export const SettingListItem = ({
  title,
  description,
  descriptionWithLink,
  thumbnail,
  currentSettingValueComponent,
  metadata,
  showArrow,
  id,
}: {
  title: string;
  description?: string;
  descriptionWithLink?: React.JSX.Element;
  thumbnail?: React.ReactNode;
  currentSettingValueComponent?: React.JSX.Element;
  metadata?: React.JSX.Element;
  showArrow?: boolean;
  id?: string;
}): React.JSX.Element => {
  return (
    <button
      id={id}
      className="settings-list-item-container"
      type="button"
      data-testid="setting-list-item-edit-btn"
    >
      <div className="flex gap-small">
        {thumbnail && (
          <div className="settings-list-item-thumbnail size-[50px] shrink-0 clip radius-small">
            {thumbnail}
          </div>
        )}
        <div className="settings-list-item-info">
          <span className="setting-name font-body">{title}</span>
          {description && <span className="small text">{description}</span>}
          {descriptionWithLink}
        </div>
      </div>
      {metadata}
      {(currentSettingValueComponent ?? showArrow) && (
        <div className="font-body settings-list-item-value-arrow">
          {currentSettingValueComponent}
          {showArrow && (
            <div>
              <span className="icon-chevron-heavy-right" />
            </div>
          )}
        </div>
      )}
    </button>
  );
};

SettingListItem.defaultProps = {
  description: undefined,
  descriptionWithLink: undefined,
  thumbnail: undefined,
  currentSettingValueComponent: undefined,
  metadata: undefined,
  showArrow: false,
  id: undefined,
};

export default SettingListItem;
