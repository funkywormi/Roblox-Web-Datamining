import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';

/**
 * Whether polls may be created on, or voted in, an announcement.
 *
 * Polls were rolled out to everyone, so the `UserCommunities.Groups.Polls` IXP layer that used to
 * gate this alongside the product feature is gone. The remaining gate is the per-community
 * `AnnouncementPolls` product feature, which is owned by the backend.
 */
// eslint-disable-next-line import/prefer-default-export
export const useAnnouncementPollsEnabled = (): boolean => {
  const { isLoading, features } = useCommunityProductFeatures();
  return !isLoading && features.AnnouncementPolls === true;
};
