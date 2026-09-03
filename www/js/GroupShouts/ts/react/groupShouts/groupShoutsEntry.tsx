import Roblox from 'Roblox';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { TranslationProvider } from 'react-utilities';
import GroupAnnouncementsSection, {
  GroupAnnouncementsSectionProps
} from './containers/GroupAnnouncementsSection';
import { groupAnnouncementsConfig } from './translation.config';
import '../../../css/tailwind.css';
import '../../../css/groupShouts/groupShouts.scss';

const renderGroupAnnouncementsSection = (
  container: Element,
  props: GroupAnnouncementsSectionProps
) => {
  unmountComponentAtNode(container); // make sure we aren't double-rendering components
  render(
    <TranslationProvider config={groupAnnouncementsConfig}>
      <GroupAnnouncementsSection {...props} />
    </TranslationProvider>,
    container
  );
};

const GroupAnnouncementsService = {
  renderGroupAnnouncementsSection
};

Object.assign(Roblox, {
  GroupAnnouncementsService
});
