import Roblox from 'Roblox';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { SystemFeedbackProvider } from 'react-style-guide';
import GroupContentModerationSection, {
  GroupContentModerationSectionProps
} from './components/GroupContentModerationSection';
import '../../../css/tailwind.css';
import '../../../css/groupContentModeration/groupContentModeration.scss';

const renderGroupContentModerationSection = (
  container: Element,
  props: GroupContentModerationSectionProps
) => {
  unmountComponentAtNode(container); // make sure we aren't double-rendering components
  render(
    <SystemFeedbackProvider>
      <GroupContentModerationSection {...props} />
    </SystemFeedbackProvider>,
    container
  );
};

const GroupContentModerationService = {
  renderGroupContentModerationSection
};

Object.assign(Roblox, {
  GroupContentModerationService
});
