import React, { FC, ReactNode, useState } from 'react';
import { IconButton, Icon } from '@rbx/foundation-ui';
import type { TIconProps } from '@rbx/foundation-ui';
import { localStorageService } from 'core-roblox-utilities';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { groupsConfig } from '../translation.config';

export type BannerProps = {
  title: string;
  content: string;
  testId?: string;
  alert?: ReactNode;
  children?: ReactNode;
  iconName?: TIconProps['name'];
  isDismissedLocalStorageKey?: string;
  onDismiss?: () => void;
} & WithTranslationsProps;

const ActionableBanner: FC<BannerProps> = ({
  title,
  content,
  testId = 'actionable-banner',
  alert,
  children,
  iconName = 'icon-regular-speech-bubble-align-center',
  isDismissedLocalStorageKey,
  translate,
  onDismiss
}) => {
  const dismissible = !!onDismiss;
  const [isDismissed, setIsDismissed] = useState(() => {
    if (!isDismissedLocalStorageKey) {
      return false;
    }
    return !!localStorageService.getLocalStorage(isDismissedLocalStorageKey);
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    if (isDismissedLocalStorageKey) {
      localStorageService.setLocalStorage(isDismissedLocalStorageKey, true);
    }
    onDismiss?.();
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div data-testid={testId} className='actionable-banner flex margin-bottom-medium'>
      <div className='flex grow-1 radius-medium padding-large stroke-standard stroke-default bg-shift-100'>
        <div className='flex flex-col grow-1 gap-large'>
          <div className='flex flex-row width-full gap-large align-y-center'>
            <div className='actionable-banner-alert flex flex-row grow-1 gap-large '>{alert}</div>
            {dismissible && (
              <IconButton
                icon='icon-filled-x'
                className='size-600 shrink-0'
                style={
                  !alert
                    ? {
                        position: 'absolute',
                        top: '10px',
                        right: '10px'
                      }
                    : {}
                }
                ariaLabel={translate('Action.Close')}
                onClick={handleDismiss}
                variant='Utility'
                size='Medium'
              />
            )}
          </div>
          <div className='actionable-banner-body flex flex-row gap-medium'>
            <div className='height-full shrink-0'>
              <Icon name={iconName} size='Large' />
            </div>
            <div className='flex flex-col grow-1 gap-xsmall'>
              <div className='text-title-medium'>{title}</div>
              <div className='flex flex-col gap-large'>
                <div className='text-body-medium'>{content}</div>
                <div className='flex flex-row flex-wrap gap-small'>{children}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withTranslations(ActionableBanner, groupsConfig);
