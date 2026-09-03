import React, { useState } from 'react';
import { Button, IconButton, Icon } from '@rbx/foundation-ui';
import type { TTailwindIconClass } from '@rbx/foundation-tailwind/classes';
import { localStorageService } from 'core-roblox-utilities';
import classNames from 'classnames';

export type BannerProps = {
  title?: string;
  content: string;
  flavor?: 'bordered' | 'flat' | 'creatorHub';
  iconName?: TTailwindIconClass;
  buttonText?: string;
  buttonHref?: string;
  buttonTarget?: string;
  onClickButton?: () => void;
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
  dismissable?: boolean;
  isDismissedLocalStorageKey?: string;
};

const Banner = ({
  title,
  content,
  flavor = 'bordered',
  iconName,
  buttonText,
  buttonHref,
  buttonTarget,
  onClickButton,
  buttonVariant = 'Standard',
  dismissable = true,
  isDismissedLocalStorageKey
}: BannerProps): JSX.Element | null => {
  const [isDismissed, setIsDismissed] = useState(() => {
    if (!isDismissedLocalStorageKey) {
      return false;
    }
    return !!localStorageService.getLocalStorage(isDismissedLocalStorageKey);
  });

  const onDismiss = () => {
    setIsDismissed(true);
    if (isDismissedLocalStorageKey) {
      localStorageService.setLocalStorage(isDismissedLocalStorageKey, true);
    }
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div
      className={classNames(
        'group-banner',
        `group-banner-${flavor}`,
        !dismissable && 'no-close',
        !iconName && 'no-icon'
      )}>
      {iconName && (
        <div className='group-banner-icon'>
          <Icon name={iconName} />
        </div>
      )}
      <div className='group-banner-main'>
        {title && <div className='group-banner-title text-title-medium'>{title}</div>}
        <div className='group-banner-content text-body-medium'>{content}</div>
      </div>
      {buttonText && (
        <Button
          as={buttonHref ? 'a' : 'button'}
          className='group-banner-button'
          variant={buttonVariant}
          size='Medium'
          href={buttonHref}
          target={buttonTarget}
          onClick={onClickButton}>
          {buttonText}
        </Button>
      )}
      {dismissable && (
        <IconButton
          icon='icon-filled-x'
          className='group-banner-close'
          ariaLabel='Close'
          onClick={onDismiss}
          variant='Utility'
          size='Small'
        />
      )}
    </div>
  );
};

export default Banner;
