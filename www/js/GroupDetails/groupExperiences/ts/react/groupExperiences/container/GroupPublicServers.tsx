import { DeviceMeta, EnvironmentUrls } from 'Roblox';
import { seoName } from 'core-utilities';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSystemFeedback } from 'react-style-guide';
import { useTranslation } from 'react-utilities';
import CommunityEventStream, {
  CommunityMetric,
  getImpressionId
} from '../../shared/utils/eventStream';
import LazyItemCarousel, { LazyItemCarouselHandle } from '../../shared/components/LazyItemCarousel';
import { getCommonParams } from '../../shared/utils/pageInfo';
import GameInstanceCard from '../components/GameInstanceCard';
import groupExperiencesService from '../services/groupExperiencesService';
import { PrimaryExperiencePublicServersData, PublicServersPage } from '../types';

export interface GroupPublicServersProps {
  groupId: number;
}

const { formatSeoName } = seoName;

const getCommonEventParams = (
  fallbackGroupId: number
): { groupId: number; locationTab: string; pageRoute: string } => {
  const { groupId, locationTab, pageRoute } = getCommonParams(
    window.location.hash,
    window.location.pathname
  );

  return {
    groupId: groupId || fallbackGroupId,
    locationTab,
    pageRoute
  };
};

const GroupPublicServers = ({ groupId }: GroupPublicServersProps): JSX.Element | null => {
  const [
    publicServersData,
    setPublicServersData
  ] = useState<PrimaryExperiencePublicServersData | null>(null);
  const { translate } = useTranslation();
  const { systemFeedbackService } = useSystemFeedback();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const publicServersCarouselRef = useRef<LazyItemCarouselHandle>(null);
  const prevIsRefreshingRef = useRef(false);
  const hasLoggedShownRef = useRef(false);

  const refreshPublicServers = useCallback(
    async (showInitialLoader = false) => {
      if (showInitialLoader) {
        setIsLoaded(false);
      } else {
        setIsRefreshing(true);
      }

      try {
        const response = await groupExperiencesService.getPrimaryExperiencePublicServers(groupId);
        setPublicServersData(response);
      } catch {
        // Do not overwrite existing server data if the request fails
        if (showInitialLoader) {
          setPublicServersData(null);
        } else {
          systemFeedbackService.warning(translate('NetworkError'));
        }
      } finally {
        if (showInitialLoader) {
          setIsLoaded(true);
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [groupId]
  );

  const loadMorePublicServers = useCallback(async () => {
    if (
      isRefreshing ||
      !publicServersData?.experience.rootPlace.id ||
      !publicServersData.nextPageCursor
    ) {
      return;
    }

    try {
      const response: PublicServersPage = await groupExperiencesService.getPublicServers(
        publicServersData.experience.rootPlace.id,
        {
          cursor: publicServersData.nextPageCursor
        }
      );

      setPublicServersData(currentData => {
        if (!currentData) {
          return currentData;
        }

        return {
          ...currentData,
          servers: [...currentData.servers, ...response.servers],
          nextPageCursor: response.nextPageCursor
        };
      });
    } catch {
      setPublicServersData(currentData =>
        currentData
          ? {
              ...currentData,
              nextPageCursor: undefined
            }
          : currentData
      );
    }
  }, [isRefreshing, publicServersData]);

  const onRefreshPublicServers = useCallback(() => {
    if (!publicServersData?.experience) {
      return;
    }

    const commonEventParams = getCommonEventParams(groupId);

    CommunityEventStream.sendEvent(
      CommunityMetric.ExperienceServerSectionClick({
        ...commonEventParams,
        sessionId: getImpressionId(),
        buttonClicked: 'refresh'
      })
    );
    // eslint-disable-next-line no-void
    void refreshPublicServers();
  }, [groupId, publicServersData, refreshPublicServers]);

  // eslint-disable-next-line no-void
  useEffect(() => void refreshPublicServers(true), [refreshPublicServers]);

  useEffect(() => {
    if (isLoaded && publicServersData && !hasLoggedShownRef.current) {
      const commonEventParams = getCommonEventParams(groupId);
      hasLoggedShownRef.current = true;
      CommunityEventStream.sendEvent(
        CommunityMetric.ExperienceServerSectionShown({
          ...commonEventParams,
          sessionId: getImpressionId()
        })
      );
    }
  }, [isLoaded, publicServersData, groupId]);

  useEffect(() => {
    if (prevIsRefreshingRef.current && !isRefreshing) {
      publicServersCarouselRef.current?.resetScroll();
    }
    prevIsRefreshingRef.current = isRefreshing;
  }, [isRefreshing]);

  if (!isLoaded) {
    return (
      <div className='group-public-servers-container group-section-content-transparent'>
        <div className='container-header group-public-servers-header' />
        <div className='group-public-servers-body'>
          <span className='spinner spinner-default' />
        </div>
      </div>
    );
  }

  if (!publicServersData) {
    return null;
  }

  const isInApp = DeviceMeta?.()?.isInApp ?? false;
  const seeAllUrl = isInApp
    ? `/games/servers-section/${publicServersData.experience.id}`
    : `${EnvironmentUrls.websiteUrl}/games/${
        publicServersData.experience.rootPlace.id
      }/${formatSeoName(publicServersData.experience.name)}#!/game-instances`;
  const logSeeAllClick = () => {
    const commonEventParams = getCommonEventParams(groupId);

    CommunityEventStream.sendEvent(
      CommunityMetric.ExperienceServerSectionClick({
        ...commonEventParams,
        sessionId: getImpressionId(),
        buttonClicked: 'see_all'
      })
    );
  };

  return (
    <div className='group-public-servers-container'>
      <div className='container-header group-public-servers-header'>
        <h2 className='group-public-servers-header-title'>
          {translate('Label.ExperienceServers', {
            experience: publicServersData.experience.name
          })}
        </h2>
        <div className='group-public-servers-header-actions'>
          <button
            type='button'
            className='btn-secondary-xs btn-more rbx-refresh refresh-link-icon'
            onClick={onRefreshPublicServers}
            disabled={isRefreshing}>
            {translate('Action.Refresh')}
          </button>
          <a
            className='btn-secondary-xs btn-more see-all-link-icon'
            href={seeAllUrl}
            onClick={logSeeAllClick}>
            {translate('Action.SeeAll')}
          </a>
        </div>
      </div>
      <div className='group-public-servers-body'>
        {isRefreshing ? (
          <span className='spinner spinner-default group-section-content-transparent' />
        ) : (
          <LazyItemCarousel
            ref={publicServersCarouselRef}
            className='group-public-servers-grid rbx-public-game-server-item-container group-section-content-transparent'
            onLoadMore={loadMorePublicServers}
            hasMore={!!publicServersData.nextPageCursor}>
            {publicServersData.servers.map(server => (
              <GameInstanceCard
                key={server.id}
                groupId={groupId}
                experienceId={publicServersData.experience.id}
                placeId={publicServersData.experience.rootPlace.id}
                server={server}
              />
            ))}
          </LazyItemCarousel>
        )}
      </div>
    </div>
  );
};

export default GroupPublicServers;
