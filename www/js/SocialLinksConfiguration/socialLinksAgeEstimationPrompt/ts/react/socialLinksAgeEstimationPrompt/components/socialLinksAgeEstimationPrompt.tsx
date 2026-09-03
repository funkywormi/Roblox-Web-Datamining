import React from 'react';
import { UIThemeProvider, Alert, Button, AlertTitle, Link, Typography } from '@rbx/ui';
import { useTheme, useTranslation } from 'react-utilities';
import { ageVerificationRedirectPath, socialLinksExperienceGuidelinesUrl } from '../urlConstants';
import socialLinksVerificationStatuses from '../../shared/constants';

const SocialLinksAgeEstimationPrompt = ({
  socialLinksVerificationStatus
}: {
  socialLinksVerificationStatus: string;
}): JSX.Element => {
  const theme = useTheme();
  const { translate } = useTranslation();

  const CommunityLinksVisibilityUnlocked =
    socialLinksVerificationStatus === socialLinksVerificationStatuses.VERIFIED_FOR_COMMUNITY ||
    socialLinksVerificationStatus === socialLinksVerificationStatuses.VERIFIED_FOR_ALL;

  const title = CommunityLinksVisibilityUnlocked
    ? 'Header.ManageSocialLinks'
    : 'Header.SocialLinkVisibility';

  const redirectUrl = ageVerificationRedirectPath;
  return (
    <UIThemeProvider theme={theme} cssBaselineMode='disabled'>
      <div className='face-age-estimation-upsell'>
        <Alert
          severity='info'
          variant='filled'
          action={
            <Button
              key='getStarted'
              href={redirectUrl}
              color='inherit'
              size='small'
              className='get-started'>
              {translate('Action.GetStarted')}
            </Button>
          }>
          <AlertTitle className='alert-title'>{translate(title)}</AlertTitle>
          <Typography variant='body2'>
            {translate('Description.ManageSocialLinksRequirement')}
          </Typography>
          &nbsp;
          <Link
            href={socialLinksExperienceGuidelinesUrl}
            target='_blank'
            color='inherit'
            className='view-details'>
            {translate('Label.ViewDetails')}
          </Link>
        </Alert>
      </div>
    </UIThemeProvider>
  );
};

export default SocialLinksAgeEstimationPrompt;
