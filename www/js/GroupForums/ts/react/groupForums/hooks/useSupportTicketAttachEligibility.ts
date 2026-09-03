import { useMemo } from 'react';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import { GroupExperience } from '../../groupExperiences/types';
import { useForumPermissions } from '../contexts/ForumPermissionsContext';
import useForumStore from './useForumStore';
import useLinkedUniverses from './useLinkedUniverses';

type UseSupportTicketAttachEligibilityResult = {
  isAttachmentsFeatureEnabled: boolean;
  isSupportTicketOptionDisabled: boolean;
  hasLinkedUniverse: boolean;
  universes: GroupExperience[];
};

export default function useSupportTicketAttachEligibility(
  activeCategoryId: string
): UseSupportTicketAttachEligibilityResult {
  const groupId = useForumStore.use.groupId();
  const categories = useForumStore.use.categories();
  const { features } = useCommunityProductFeatures();
  const { canAttachSupportTicketInCategory } = useForumPermissions();

  const isAttachmentsFeatureEnabled = features.ForumsAttachmentsCreate;

  const activeCategory = useMemo(
    () => categories.find(category => category.shortId === activeCategoryId),
    [categories, activeCategoryId]
  );

  const { universes, hasLinkedUniverse } = useLinkedUniverses(groupId, isAttachmentsFeatureEnabled);

  const hasPermission = activeCategory
    ? canAttachSupportTicketInCategory(activeCategory.id)
    : false;

  // The (+) only renders when there is a linked universe (PostComposer gates on `hasLinkedUniverse`),
  // so the only state in which it shows but is unusable is "has a universe, lacks permission" — in
  // which case the menu option is greyed out (disabled).
  const isSupportTicketOptionDisabled = !hasPermission;

  return {
    isAttachmentsFeatureEnabled,
    isSupportTicketOptionDisabled,
    hasLinkedUniverse,
    universes
  };
}
