import React, { useCallback, useState } from 'react';
import { FeedbackBanner } from '@rbx/foundation-ui';
import { useTranslation } from 'react-utilities';
import { localStorageService } from 'core-roblox-utilities';

export type OwnerDeprecationBannerProps = {
  /** Used to scope the dismissed-state localStorage key so dismissal sticks per-community. */
  groupId: number;
};

const dismissedStorageKey = (groupId: number): string =>
  `Roblox.Groups.OwnerDeprecationBanner.Dismissed.${groupId}`;

const OwnerDeprecationBanner: React.FC<OwnerDeprecationBannerProps> = ({ groupId }) => {
  const { translate } = useTranslation();
  // Persist dismissal in localStorage scoped by groupId so the banner stays dismissed across
  // page reloads for a community the admin has already acknowledged. Matches the
  // `EducationalTooltip` localStorage pattern.
  const [isDismissed, setIsDismissed] = useState(
    () => !!localStorageService.getLocalStorage(dismissedStorageKey(groupId))
  );

  const onDismiss = useCallback(() => {
    setIsDismissed(true);
    localStorageService.setLocalStorage(dismissedStorageKey(groupId), true);
  }, [groupId]);

  if (isDismissed) {
    return null;
  }

  return (
    <FeedbackBanner
      className='margin-bottom-medium margin-top-medium'
      title={translate('Heading.OwnerRolesetDeprecation')}
      description={translate('Message.OwnerRolesetDeprecation')}
      severity='Info'
      layout='Stacked'
      showIcon
      onDismiss={onDismiss}
      dismissIconAriaLabel={translate('Action.Close')}
    />
  );
};

export default OwnerDeprecationBanner;
