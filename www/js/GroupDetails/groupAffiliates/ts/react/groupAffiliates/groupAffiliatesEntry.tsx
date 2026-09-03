import Roblox from 'Roblox';
import React from 'react';
import { render } from 'react-dom';
import { queryClient, TranslationProvider } from 'react-utilities';
import { QueryClientProvider } from '@tanstack/react-query';
import groupAffiliatesConfig from './translation.config';
import GroupAffiliates from './components/GroupAffiliates';

interface RenderGroupAffiliatesProps {
  groupId: number;
  areEnemiesAllowed?: boolean;
}

const renderGroupAffiliates = (
  container: Element,
  { groupId, areEnemiesAllowed = false }: RenderGroupAffiliatesProps
): void => {
  render(
    <TranslationProvider config={groupAffiliatesConfig}>
      <QueryClientProvider client={queryClient}>
        <GroupAffiliates groupId={groupId} relationshipType='Allies' />
        {areEnemiesAllowed && <GroupAffiliates groupId={groupId} relationshipType='Enemies' />}
      </QueryClientProvider>
    </TranslationProvider>,
    container
  );
};

const GroupAffiliatesService = {
  renderGroupAffiliates
};

Object.assign(Roblox, {
  GroupAffiliatesService
});

export default renderGroupAffiliates;
