import React, { createContext, useContext } from 'react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { CommunityProductFeatures } from '../types';
import communityProductFeaturesService from '../services/communityProductFeaturesService';

type CommunityProductFeaturesState = {
  isLoading: boolean;
  features: CommunityProductFeatures;
  refetch: UseQueryResult['refetch'];
};

export const defaultCommunityProductFeatures: CommunityProductFeatures = {
  ForumsAgeCheck: false,
  ForumsRestrictedCategories: false,
  ForumsSearch: false,
  ForumsUnrestrictedMessages: false,
  RealtimeMessaging: false,
  AnnouncementPolls: false,
  AnnouncementsRichTextRead: false,
  AnnouncementsRichTextWrite: false,
  IsOwnerRolesetDeprecated: false,
  ForumsAttachmentsCreate: false,
  ForumsAttachmentsView: false,
  CommunityTiers: false,
  CommunityTiersDisclosureBanner: false,
  AnnouncementAnalytics: false,
  IsUnifiedUIEnabled: false,
  CommunityCompletionCarousel: false,
  ForumConcealment: false,
  ForumPreventSimilar: false
};

const SafeDefaultState: CommunityProductFeaturesState = {
  isLoading: true,
  features: defaultCommunityProductFeatures,
  refetch: (((): Promise<undefined> =>
    Promise.resolve(undefined)) as unknown) as UseQueryResult['refetch']
};

export const CommunityProductFeaturesContext = createContext<CommunityProductFeaturesState>(
  SafeDefaultState
);

export const useCommunityProductFeatures = (): CommunityProductFeaturesState => {
  const resource = useContext(CommunityProductFeaturesContext);
  if (resource === SafeDefaultState) {
    throw new Error(
      'useCommunityProductFeatures must be used within a CommunityProductFeaturesContext'
    );
  }

  return resource;
};

export type Props = {
  groupId: number;
  children: React.ReactNode;
};

export function CommunityProductFeaturesContextProvider({ groupId, children }: Props): JSX.Element {
  const { data = {} as CommunityProductFeatures, isLoading, refetch } = useQuery({
    queryKey: ['communityProductFeatures', groupId],
    queryFn: () => communityProductFeaturesService.fetchCommunityProductFeatures(groupId),
    refetchOnWindowFocus: false,
    retry: 1
  });

  return (
    <CommunityProductFeaturesContext.Provider
      value={{
        isLoading,
        features: data,
        refetch
      }}>
      {children}
    </CommunityProductFeaturesContext.Provider>
  );
}
