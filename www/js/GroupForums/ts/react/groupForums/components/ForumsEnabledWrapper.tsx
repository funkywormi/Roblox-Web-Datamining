import React, { ReactNode } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { groupsConfig } from '../../shared/translation.config';
import { Group } from '../../shared/types';
import { useCommunityFeatureFreezes } from '../../shared/contexts/CommunityFeatureFreezesContext';
import SplashIcon from './SplashIcon';

type ForumsEnabledWrapperProps = {
  children: ReactNode;
  userId: number;
  group: Group;
} & WithTranslationsProps;

const ForumsEnabledWrapper: React.FC<ForumsEnabledWrapperProps> = ({
  children,
  userId,
  group,
  translate
}: ForumsEnabledWrapperProps) => {
  const { isLoading, forumsRead } = useCommunityFeatureFreezes();
  const isOwner = group.owner?.userId === userId;

  if (isLoading) {
    return (
      <div className='section-disclaimer section-content-off flex flex-col items-center justify-center grow' />
    );
  }

  if (forumsRead.isDisabled && !isOwner) {
    return (
      <div className='section-disclaimer section-content-off flex flex-col items-center justify-center grow'>
        <SplashIcon iconName='icon-regular-lock-closed' />
        <h2>{translate('Title.ForumsUnavailable')}</h2>
        <p>{translate('Description.ForumsUnavailable')}</p>
      </div>
    );
  }

  return <React.Fragment>{children}</React.Fragment>;
};

export default withTranslations(ForumsEnabledWrapper, groupsConfig);
