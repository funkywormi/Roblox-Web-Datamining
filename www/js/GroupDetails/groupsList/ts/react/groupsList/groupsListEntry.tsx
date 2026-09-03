import Roblox from 'Roblox';
import React from 'react';
import { render } from 'react-dom';
import { TranslationProvider } from 'react-utilities';
import '../../../css/tailwind.css';
import '../../../css/groupsList/groupsList.scss';
import { groupsConfig } from './translation.config';
import GroupsList, { GroupsListProps } from './components/GroupsList';

const renderGroupsList = (container: Element, props: GroupsListProps) => {
  render(
    <TranslationProvider config={groupsConfig}>
      <GroupsList {...props} />
    </TranslationProvider>,
    container
  );
};

const GroupsListService = {
  renderGroupsList
};

Object.assign(Roblox, {
  GroupsListService
});
