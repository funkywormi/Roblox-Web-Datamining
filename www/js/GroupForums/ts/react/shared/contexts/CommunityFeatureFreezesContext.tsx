import React, { createContext, useContext, useMemo } from 'react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  CommunityFeatureFreezeName,
  CommunityFeatureFreeze,
  CommunityFeatureFreezesResponse
} from '../types';
import communityFeatureFreezesService from '../services/communityFeatureFreezesService';

type CommunityFeatureFreezeState = {
  isDisabled: boolean;
  canReenable: boolean;
};

type CommunityFeatureFreezesState = {
  isLoading: boolean;
  isRefetching: boolean;
  forumsRead: CommunityFeatureFreezeState;
  forumsWrite: CommunityFeatureFreezeState;
  refetch: UseQueryResult['refetch'];
};

const SafeDefaultState: CommunityFeatureFreezesState = {
  isLoading: true,
  isRefetching: false,
  forumsRead: {
    isDisabled: false,
    canReenable: false
  },
  forumsWrite: {
    isDisabled: false,
    canReenable: false
  },
  refetch: (((): Promise<undefined> =>
    Promise.resolve(undefined)) as unknown) as UseQueryResult['refetch']
};

export const CommunityFeatureFreezesContext = createContext<CommunityFeatureFreezesState>(
  SafeDefaultState
);

export const useCommunityFeatureFreezes = (): CommunityFeatureFreezesState => {
  const resource = useContext(CommunityFeatureFreezesContext);
  if (resource === SafeDefaultState) {
    throw new Error(
      'useCommunityFeatureFreezes must be used within a CommunityFeatureFreezesContext'
    );
  }
  return resource;
};

export type Props = {
  groupId: number;
  isOwner: boolean;
  children: React.ReactNode;
};

export function CommunityFeatureFreezesContextProvider({
  groupId,
  isOwner,
  children
}: Props): JSX.Element {
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['communityFeatureFreezes', groupId, isOwner],
    queryFn: (): Promise<CommunityFeatureFreezesResponse> =>
      communityFeatureFreezesService.fetchCommunityFeatureFreezes(groupId, isOwner),
    refetchOnWindowFocus: false,
    retry: 1
  });
  const featureFreezesByName = useMemo(() => {
    return (data?.features || []).reduce((acc, feature) => {
      acc[feature.feature] = feature;
      return acc;
    }, {} as Record<CommunityFeatureFreezeName, CommunityFeatureFreeze>);
  }, [data?.features]);

  const value = useMemo(
    () => ({
      isLoading,
      isRefetching,
      forumsRead: {
        isDisabled:
          featureFreezesByName[CommunityFeatureFreezeName.ForumsRead]?.isDisabled || false,
        canReenable:
          featureFreezesByName[CommunityFeatureFreezeName.ForumsRead]?.canReenable || false
      },
      forumsWrite: {
        isDisabled:
          featureFreezesByName[CommunityFeatureFreezeName.ForumsWrite]?.isDisabled || false,
        canReenable:
          featureFreezesByName[CommunityFeatureFreezeName.ForumsWrite]?.canReenable || false
      },
      refetch
    }),
    [featureFreezesByName, isLoading, isRefetching, refetch]
  );

  return (
    <CommunityFeatureFreezesContext.Provider value={value}>
      {children}
    </CommunityFeatureFreezesContext.Provider>
  );
}
