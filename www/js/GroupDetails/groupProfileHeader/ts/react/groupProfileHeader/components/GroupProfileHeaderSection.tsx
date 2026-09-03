import React from 'react';
import { UIThemeProvider } from '@rbx/ui';
import { useSystemFeedback } from 'react-style-guide';
import { useTheme, useTranslation } from 'react-utilities';
import Actions from './Actions';
import ProfileHeaderDetails from './ProfileHeaderDetails';
import ProfileInsights from './ProfileInsights';
import Description from './Description';
import BugReportingHomeUpsell from './BugReportingHomeUpsell';
import VerificationModal from './VerificationModal';
import { CommunityCompletionCarousel } from '../../communityCompletion';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import { VerificationModalProvider } from '../context/VerificationModalContext';
import { useGroupProfileHeaderContext } from '../context/GroupProfileHeaderContext';
import Banner from '../../shared/components/Banner';

const GroupProfileHeaderSection: React.FC = () => {
  const theme = useTheme();
  const { SystemFeedbackComponent } = useSystemFeedback();
  const { isGracefulDegradationEnabled, permissions } = useGroupProfileHeaderContext();
  const { features } = useCommunityProductFeatures();
  const { translate } = useTranslation();
  const isAdmin = !!permissions?.groupMembershipPermissions.changeRank;

  return (
    <UIThemeProvider
      theme={theme === 'dark' ? 'foundation-dark' : 'foundation-light'}
      cssBaselineMode='disabled'>
      <VerificationModalProvider>
        <div className='group-profile-header flex flex-col gap-large'>
          {isGracefulDegradationEnabled && (
            <Banner
              title={translate('Message.GracefulDegradationTitle')}
              content={translate('Message.GracefulDegradationCommunities')}
              onClickButton={() => undefined}
            />
          )}
          <div className='group-profile-header-info flex justify-between items-center'>
            <ProfileHeaderDetails />
            <Actions className='actions-desktop' />
          </div>
          <ProfileInsights />
          <Description />
          {features.CommunityCompletionCarousel && <CommunityCompletionCarousel />}
          {isAdmin && <BugReportingHomeUpsell />}
          <Actions className='actions-mobile' includeContextualMenu={false} showTooltipAsText />
        </div>
        <VerificationModal />
        <SystemFeedbackComponent />
      </VerificationModalProvider>
    </UIThemeProvider>
  );
};

export default GroupProfileHeaderSection;
