import React, { createContext, useContext, useMemo } from 'react';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import useForumStore from '../hooks/useForumStore';
import useForumsSearch, { UseForumsSearchResult } from '../hooks/useForumsSearch';
import useForumsSearchUrlState, {
  UseForumsSearchUrlStateResult
} from '../hooks/useForumsSearchUrlState';
import useForumsSearchExperiment from '../hooks/useForumsSearchExperiment';
import { useForumPermissions } from './ForumPermissionsContext';
import { ForumCategory } from '../types';
import { ForumsMode } from '../types/search';

export type ForumsSearchContextValue = {
  // Product feature AND IXP layer — both required.
  isEnabled: boolean;
  isSearchActive: boolean;
  groupId: number;
  // Non-archived only, for the filters sheet's picker. Search itself uses allCategories below.
  categories: ForumCategory[];
  canViewMembers: boolean;
} & UseForumsSearchUrlStateResult &
  UseForumsSearchResult;

const ForumsSearchContext = createContext<ForumsSearchContextValue | undefined>(undefined);

export const useForumsSearchContext = (): ForumsSearchContextValue => {
  const value = useContext(ForumsSearchContext);
  if (!value) {
    throw new Error('useForumsSearchContext must be used within a ForumsSearchProvider');
  }
  return value;
};

/**
 * Composes the URL half (useForumsSearchUrlState) with the networking half (useForumsSearch).
 * Owns no draft text — that stays in ForumsSearch, so typing cannot re-render the category page.
 */
export function ForumsSearchProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const groupId = useForumStore.use.groupId();
  const categoryId = useForumStore.use.categoryId();
  const categories = useForumStore.use.categories();
  const archivedCategories = useForumStore.use.archivedCategories();
  const { canViewMembers } = useForumPermissions();
  const { features } = useCommunityProductFeatures();
  // Enrolls the user, so it is read here: this provider mounts only where the search bar renders.
  const isSearchExperimentEnabled = useForumsSearchExperiment(!!features.ForumsSearch);

  const isEnabled = !!features.ForumsSearch && isSearchExperimentEnabled;

  const urlStateResult = useForumsSearchUrlState({ currentCategoryId: categoryId });

  // Results can come from any category, archived included.
  const allCategories = useMemo(() => [...categories, ...archivedCategories], [
    categories,
    archivedCategories
  ]);

  const searchResult = useForumsSearch({
    groupId,
    urlState: urlStateResult.urlState,
    mode: urlStateResult.mode,
    currentCategoryId: categoryId,
    canViewMembers,
    categories: allCategories,
    enabled: isEnabled,
    searchTrigger: urlStateResult.searchTrigger,
    navEntryKey: urlStateResult.navEntryKey
  });

  // Unmemoized on purpose: both hooks return a fresh object, so a useMemo here could never hit.
  const value: ForumsSearchContextValue = {
    isEnabled,
    isSearchActive: isEnabled && urlStateResult.mode !== ForumsMode.Browse,
    groupId,
    categories,
    canViewMembers,
    ...urlStateResult,
    ...searchResult
  };

  return <ForumsSearchContext.Provider value={value}>{children}</ForumsSearchContext.Provider>;
}

export default ForumsSearchContext;
