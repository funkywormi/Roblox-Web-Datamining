import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSystemFeedback } from 'react-style-guide';
import { IconButton, Tooltip, TooltipTrigger } from '@rbx/foundation-ui';
import { useTranslation, withTranslations, WithTranslationsProps } from 'react-utilities';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { groupsConfig } from '../translation.config';
import CategoriesList from './CategoriesList';
import groupForumsConstants from '../constants/groupForumsConstants';
import PostPreviewList from './PostPreviewList';
import SearchResultsList from './SearchResultsList';
import CreatePostButton from '../components/CreatePostButton';
import NativeFooter from '../../shared/components/NativeFooter';
import ForumsSearch from '../components/ForumsSearch';
import { useForumPermissions } from '../contexts/ForumPermissionsContext';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import { useCommunityFeatureFreezes } from '../../shared/contexts/CommunityFeatureFreezesContext';
import SectionDisclaimer from '../../shared/components/SectionDisclaimer';
import useForumStore from '../hooks/useForumStore';
import { ForumsSearchProvider, useForumsSearchContext } from '../contexts/ForumsSearchContext';
import { ForumsMode } from '../types/search';
import { buildSearchString, isAllCategories } from '../utils/forumsSearchUrl';
import useRouteValidation from '../hooks/useRouteValidation';
import { BaseRouteParams } from '../store/reduceNextRoute';
import { logGroupForumsClickEvent } from '../../shared/utils/logging';
import useGuacConfig from '../../shared/hooks/useGuacConfig';
import useForumTierGate from '../hooks/useForumTierGate';
import ForumTierGateMessage from '../components/ForumTierGateMessage';
import AgeCheckWrapper from '../components/AgeCheckWrapper';
import RoleRestrictedCategoryDialog from '../components/dialogs/RoleRestrictedCategoryDialog';
import { EventTriggerReason } from '../../shared/constants/eventConstants';
import AgeRestrictedCategoryUpsell from '../components/AgeRestrictedCategoryUpsell';

export type CategoriesProps = {} & WithTranslationsProps;

/**
 * The heading above the list: the browsed category while browsing, or the scope the results
 * cover while searching ("All categories", or the single category the search is scoped to).
 */
const CategoriesHeaderTitle = (): JSX.Element => {
  const { translate } = useTranslation();
  const categoryName = useForumStore.use.categoryName()!;
  const { mode, urlState, categories } = useForumsSearchContext();

  const title = useMemo(() => {
    if (mode !== ForumsMode.Search) return categoryName;
    const { categoryId: scopeId } = urlState;
    if (isAllCategories(scopeId)) {
      return translate('Label.AllCategories');
    }
    return categories.find(category => category.id === scopeId)?.name ?? categoryName;
  }, [mode, urlState, categories, categoryName, translate]);

  return <h2 className='group-forums-categories-header-category-name'>{title}</h2>;
};

/**
 * Search results while a search is active, otherwise the normal post list plus its create-post
 * footer.
 */
const CategoriesMainContent = ({
  isTierGated,
  isTierGateResolving,
  onCreatePost
}: {
  isTierGated: boolean;
  isTierGateResolving: boolean;
  onCreatePost: () => void;
}): JSX.Element => {
  const { translate } = useTranslation();
  const { isSearchActive } = useForumsSearchContext();
  const { canCreatePost } = useForumPermissions();
  const { forumsWrite } = useCommunityFeatureFreezes();
  const isCategoryArchived = useForumStore.use.isCategoryArchived();

  if (isSearchActive) return <SearchResultsList />;

  return (
    <React.Fragment>
      <PostPreviewList />
      <NativeFooter fixed>
        <div className='groups-native-footer-container'>
          {isTierGated ? (
            <ForumTierGateMessage testId='forum-post-tier-gate' />
          ) : (
            <AgeCheckWrapper trigger={EventTriggerReason.CreatePost}>
              <CreatePostButton
                disabled={
                  !canCreatePost ||
                  isCategoryArchived ||
                  forumsWrite.isDisabled ||
                  isTierGateResolving
                }
                label={translate('Action.CreatePost')}
                onClick={onCreatePost}
              />
            </AgeCheckWrapper>
          )}
        </div>
      </NativeFooter>
    </React.Fragment>
  );
};

const CategoriesContent = ({ translate }: CategoriesProps): JSX.Element => {
  const groupId = useForumStore.use.groupId();
  const categoryId = useForumStore.use.categoryId();
  const categoryShortId = useForumStore.use.categoryShortId()!;
  const categories = useForumStore.use.categories();
  const archivedCategories = useForumStore.use.archivedCategories();
  const categoriesLoaded = useForumStore.use.categoriesLoaded();
  const categoryName = useForumStore.use.categoryName()!;
  const isCategoryArchived = useForumStore.use.isCategoryArchived();
  const { features } = useCommunityProductFeatures();
  const isCategoryRestricted = useMemo(
    () =>
      features.ForumsRestrictedCategories &&
      ([...categories, ...archivedCategories].find(category => category.shortId === categoryShortId)
        ?.isRestricted ??
        false),
    [features.ForumsRestrictedCategories, categories, archivedCategories, categoryShortId]
  );
  const { data: groupDetailsUi } = useGuacConfig('group-details-ui');
  const showAgeRestrictedCategoryUpsell =
    isCategoryRestricted && groupDetailsUi?.eligibleForRestrictedCommunications !== 'Eligible';
  const { isTierGated, isResolving: isTierGateResolving } = useForumTierGate();
  const loadCategories = useForumStore.use.loadCategories();
  useRouteValidation(categoriesLoaded);
  const match = useRouteMatch<BaseRouteParams>();
  const history = useHistory();
  const { canCreatePost } = useForumPermissions();
  const { forumsWrite } = useCommunityFeatureFreezes();
  const { SystemFeedbackComponent } = useSystemFeedback();
  const [isRoleRestrictedDialogOpen, setIsRoleRestrictedDialogOpen] = useState(false);

  const { isEnabled: isForumsSearchEnabled, mode, urlState } = useForumsSearchContext();

  const openRoleRestrictedDialog = useCallback(() => {
    if (groupDetailsUi?.eligibleForRestrictedCommunications === 'Eligible') {
      setIsRoleRestrictedDialogOpen(true);
    }
  }, [groupDetailsUi?.eligibleForRestrictedCommunications]);

  const closeRoleRestrictedDialog = useCallback(() => {
    setIsRoleRestrictedDialogOpen(false);
  }, []);

  const setActiveCategory = useCallback(
    (nextShortId: string, nextCategoryName: string): void => {
      const pathname = groupForumsConstants.router.getCategoryRoute(nextShortId, nextCategoryName);
      // FilteredBrowse keeps the content-type/recency filters but drops the category param: the
      // new route path is itself the scope, so searchCategory would wrongly count as a filter.
      // From Browse or Search, a category click returns to plain browsing. Path and query are
      // set in one nav so they never disagree.
      const search =
        isForumsSearchEnabled && mode === ForumsMode.FilteredBrowse
          ? buildSearchString({ ...urlState, categoryId: undefined })
          : '';
      history[categoryShortId === nextShortId ? 'replace' : 'push']({ pathname, search });
      logGroupForumsClickEvent({
        groupId,
        clickTargetType: 'changeCategory',
        clickTargetId: nextShortId
      });
    },
    [groupId, categoryShortId, history, isForumsSearchEnabled, mode, urlState]
  );

  useEffect(() => {
    if (categoryShortId && match.path === groupForumsConstants.router.defaultRoute) {
      // redirect to first category
      setActiveCategory(categoryShortId, categoryName);
    }
  }, [categoryName, categoryShortId, match, setActiveCategory]);

  const fetchForumCategories = useCallback(() => {
    // eslint-disable-next-line no-void
    void loadCategories();
  }, [loadCategories]);

  const onCreatePost = useCallback(() => {
    if (categoryId) {
      history.push(groupForumsConstants.router.getPostCreateRoute(categoryShortId));
      logGroupForumsClickEvent({
        groupId,
        clickTargetType: 'goToPostComposerCreate',
        clickTargetId: categoryId
      });
    }
  }, [groupId, categoryId, history, categoryShortId]);

  if (categoriesLoaded && !categories.length && !archivedCategories.length) {
    return (
      <SectionDisclaimer
        iconClassName='icon-status-alert'
        heading={translate('Error.LoadCategoryTitle')}
        message={translate('Error.ReloadingSubtitle')}
        buttonText={translate('Action.RetryLoadingForums')}
        onClick={fetchForumCategories}
      />
    );
  }

  return (
    <div className='group-forums-categories'>
      <div className='group-forums-categories-list-container'>
        <CategoriesList onSetActiveCategory={setActiveCategory} />
        {isForumsSearchEnabled && <ForumsSearch />}
      </div>
      <div className='group-forums-categories-header'>
        <div className='group-forums-categories-header-title'>
          <CategoriesHeaderTitle />
          {isCategoryRestricted && (
            <Tooltip
              position='bottom-center'
              title={translate('Description.RoleRestrictedCategory')}>
              <TooltipTrigger asChild>
                <span className='group-forums-restricted-category-info-icon'>
                  <IconButton
                    as='button'
                    icon='icon-regular-circle-i'
                    variant='Utility'
                    size='Small'
                    ariaLabel={translate('Heading.RoleRestrictedCategory')}
                    onClick={openRoleRestrictedDialog}
                  />
                </span>
              </TooltipTrigger>
            </Tooltip>
          )}
        </div>
        {!showAgeRestrictedCategoryUpsell && (
          <AgeCheckWrapper trigger={EventTriggerReason.CreatePost}>
            <CreatePostButton
              disabled={
                !canCreatePost ||
                isCategoryArchived ||
                forumsWrite.isDisabled ||
                isTierGated ||
                isTierGateResolving
              }
              label={translate('Action.CreatePost')}
              onClick={onCreatePost}
            />
          </AgeCheckWrapper>
        )}
      </div>
      {showAgeRestrictedCategoryUpsell ? (
        <AgeRestrictedCategoryUpsell />
      ) : (
        <CategoriesMainContent
          isTierGated={isTierGated}
          isTierGateResolving={isTierGateResolving}
          onCreatePost={onCreatePost}
        />
      )}
      <SystemFeedbackComponent />
      {isRoleRestrictedDialogOpen && categoryId && (
        <RoleRestrictedCategoryDialog
          groupId={groupId}
          categoryId={categoryId}
          onClose={closeRoleRestrictedDialog}
        />
      )}
    </div>
  );
};

const TranslatedCategoriesContent = withTranslations(CategoriesContent, groupsConfig);

const Categories = (): JSX.Element => (
  <ForumsSearchProvider>
    <TranslatedCategoriesContent />
  </ForumsSearchProvider>
);

export default Categories;
