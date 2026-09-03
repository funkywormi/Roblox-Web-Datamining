import { useTranslation } from '@rbx/core-scripts/react';
import { Badge, Icon, List, ListItem, ProgressCircle } from '@rbx/foundation-ui';
import type { TTailwindIconClass } from '@rbx/foundation-tailwind/classes';
import {
  accountStatusUrl,
  helpUrl,
  supportUrl,
  supportCenterUrl,
  reportInboxUrl
} from '../../utils/urls';
import useContactUsVisibility from '../../hooks/useContactUsVisibility';
import useSupportCenterVisibility from '../../hooks/useSupportCenterVisibility';
import ProfileHeader from './ProfileHeader';
import useSafetyDashboardIxp from '../../hooks/useSafetyDashboardIxp';

interface SupportLinkListItemProps {
  href: string;
  iconName: TTailwindIconClass;
  title: string;
  description: string;
  trailing?: React.ReactNode;
}

/**
 * Renders a single tappable row in the support links list. Wraps a Foundation `ListItem` in an
 * anchor so the whole row navigates to `href`, displays a leading icon, title, and description, and
 * always renders a trailing chevron. An optional `trailing` node (e.g. a badge) is rendered before
 * the chevron.
 */
const SupportLinkListItem = ({
  href,
  iconName,
  title,
  description,
  trailing
}: SupportLinkListItemProps) => (
  <a href={href} rel='noopener noreferrer'>
    <ListItem
      leading={<Icon name={iconName} size='Large' className='margin-right-[8px]' />}
      title={title}
      description={description}
      trailing={
        <div className='flex items-center gap-small'>
          {trailing}
          <Icon name='icon-regular-chevron-large-right' size='Medium' className='shrink-0' />
        </div>
      }
      divider='Inset'
      isContained
      // We need to provide a dummy onSelect to enable the hover state styling for the ListItem.
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onSelect={() => {}}
    />
  </a>
);

/**
 * Displays link to other pages such as Account Status, Help, Support Center, and Contact Us.
 */
const MainPage = () => {
  const { translate } = useTranslation();
  const isContactUsVisible = useContactUsVisibility();
  const { isVisible: isSupportCenterVisible, isLoading } = useSupportCenterVisibility();

  const safetyDashboardIxpQuery = useSafetyDashboardIxp();
  const isReportInboxEnabled = safetyDashboardIxpQuery.data?.EnableReportInbox === true;

  return (
    <div className='flex flex-col gap-xxlarge'>
      <h1 className='text-heading-large'>{translate('Heading.HelpAndSafety')}</h1>
      <ProfileHeader />

      {isLoading || safetyDashboardIxpQuery.isLoading ? (
        <div className='flex items-center justify-center padding-large'>
          <ProgressCircle
            ariaLabel={translate('Label.Loading')}
            size='Medium'
            variant='Indeterminate'
          />
        </div>
      ) : (
        <List>
          <SupportLinkListItem
            href={accountStatusUrl}
            iconName='icon-regular-circle-person'
            title={translate('Heading.AccountStatus.Upper')}
            description={translate('Description.AccountStatus')}
          />
          {isReportInboxEnabled && (
            <SupportLinkListItem
              href={reportInboxUrl}
              iconName='icon-regular-flag'
              title='Your reports' // TODO: @andrewxu localize
              description='Report inbox description' // TODO: @andrewxu localize
            />
          )}
          <SupportLinkListItem
            href={helpUrl}
            iconName='icon-regular-circle-question'
            title={translate('Label.HelpCenter')}
            description={translate('Label.HelpCenterSub')}
          />
          {isSupportCenterVisible && (
            <SupportLinkListItem
              href={supportCenterUrl}
              iconName='icon-regular-file-box'
              title={translate('Label.SupportCenter')}
              description={translate('Label.SupportCenterSub')}
              trailing={<Badge label={translate('Label.Beta')} />}
            />
          )}
          {isContactUsVisible && (
            <SupportLinkListItem
              href={supportUrl}
              iconName='icon-regular-envelope'
              title={translate('Label.ContactUs')}
              description={translate('Label.ContactUsSub')}
            />
          )}
        </List>
      )}
    </div>
  );
};

export default MainPage;
