import Roblox from 'Roblox';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import GroupEventsSection, { GroupEventsSectionProps } from './containers/GroupEventsSection';
import '../../../css/tailwind.css';
import '../../../css/groupEvents/groupEvents.scss';

const renderGroupEventsSection = (container: Element, props: GroupEventsSectionProps) => {
  unmountComponentAtNode(container); // make sure we aren't double-rendering components
  render(<GroupEventsSection {...props} />, container);
};

const GroupEventsService = {
  renderGroupEventsSection
};

Object.assign(Roblox, {
  GroupEventsService
});
