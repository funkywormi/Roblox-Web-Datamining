import classNames from 'classnames';
import React from 'react';

/* 
  Pass translated text to this component
  Consumers can provide a component to render the current value
*/
export const SpendingSettingListItem = ({
  title,
  description,
  currentSettingValueComponent,
  metadata,
  showArrow,
  onClick,
  footer,
  disabled
}: {
  title: string;
  description?: string;
  currentSettingValueComponent?: React.ReactNode;
  metadata?: JSX.Element;
  showArrow?: boolean;
  onClick?: () => void;
  footer?: string;
  disabled?: boolean;
}): JSX.Element => {
  const btnClassNames = classNames('spending-settings-list-item-container', {
    'text-disabled': disabled
  });

  const listItemClassNames = classNames('spending-settings-list-item-info', {
    'text-disabled': disabled
  });

  const listItemValueArrowClassNames = classNames('spending-settings-list-item-value-arrow', {
    'text-disabled': disabled
  });

  return (
    <div>
      <button className={btnClassNames} type='button' onClick={onClick} disabled={disabled}>
        <div className={listItemClassNames}>
          <span className='spending-setting-name font-body '>{title}</span>
          {description && <span className='small text'>{description}</span>}
        </div>
        {metadata}
        {(currentSettingValueComponent || showArrow) && (
          <div className={listItemValueArrowClassNames}>
            {currentSettingValueComponent}
            {showArrow && (
              <div>
                <span className='icon-chevron-heavy-right' />
              </div>
            )}
          </div>
        )}
      </button>
      {footer && (
        <p
          className='spending-settings-list-item-footer small text'
          dangerouslySetInnerHTML={{ __html: footer }}
        />
      )}
    </div>
  );
};

SpendingSettingListItem.defaultProps = {
  description: undefined,
  currentSettingValueComponent: undefined,
  metadata: undefined,
  showArrow: false,
  onClick: undefined,
  footer: undefined,
  disabled: false
};

export default SpendingSettingListItem;
