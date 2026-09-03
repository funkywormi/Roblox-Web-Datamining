import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SystemFeedbackProvider } from 'react-style-guide';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import { GroupDetailsPolicies, LocationState } from '../types';
import { Group, GroupMetadata } from '../../shared/types';
import { groupAnnouncementsConfig } from '../translation.config';
import GroupAnnouncementsDisplay from './GroupAnnouncementsDisplay';
import AnnouncementComposer from '../components/AnnouncementComposer';
import groupAnnouncementsConstants from '../constants/groupAnnouncementsConstants';
import defaultQueryClientConfig from '../../shared/constants/reactQueryConstants';
import { CommunityProductFeaturesContextProvider } from '../../shared/contexts/CommunityProductFeaturesContext';
import { EmotesProvider } from '../../shared/contexts/EmoteContext';
import { RealtimeProvider } from '../../shared/contexts/RealtimeContext';

const SCROLL_DELAY_MS = 500;
const SCROLL_MARGIN_FALLBACK_PX = 56;

export type GroupAnnouncementsSectionProps = {
  group: Group;
  isOwner: boolean;
  joinGroup: () => Promise<boolean>;
  allowedToJoinGroup: boolean;
  policies: GroupDetailsPolicies;
  metadata: GroupMetadata;
  canCreateAnnouncements: boolean;
  onAnnouncementLoaded?: () => void;
  /**
   * Initial announcement id for the group, fetched by an outer (user-profile-scoped) service.
   * Used only as the seed for internal state; after mount the composer can push a new id back
   * (e.g. after publish) and the display refetches against that.
   */
  announcementsData?: { id: string } | null;
  /**
   * Refetches the Announcements component from profile-platform and resolves with the
   * new latest announcement id. Called after a delete so we can surface the next-most-recent
   * announcement (or empty state) instead of just clearing the local cache.
   */
  refreshAnnouncements?: () => Promise<{ id: string } | null>;
  initialRouteConfig?: { pathname: string; state?: LocationState };
  scrollOnMount?: boolean;
} & WithTranslationsProps;

const queryClient = new QueryClient(defaultQueryClientConfig);

const GroupAnnouncementsSection = ({
  group,
  isOwner,
  joinGroup,
  allowedToJoinGroup,
  policies,
  metadata,
  canCreateAnnouncements,
  onAnnouncementLoaded,
  announcementsData: initialAnnouncementsData,
  refreshAnnouncements,
  initialRouteConfig = { pathname: groupAnnouncementsConstants.routes.base },
  scrollOnMount = false,
  translate
}: GroupAnnouncementsSectionProps): JSX.Element | null => {
  // Seed from the outer (user-profile-scoped) prop, then own it as state so child routes
  // can update the id after publish without needing a round-trip through the outer tree.
  const [announcementsData, setAnnouncementsData] = useState<{ id: string } | null>(
    initialAnnouncementsData ?? null
  );

  const handlePublished = useCallback((id: string) => {
    setAnnouncementsData({ id });
  }, []);

  const handleDeleted = useCallback(async () => {
    if (!refreshAnnouncements) {
      setAnnouncementsData(null);
      return;
    }
    const next = await refreshAnnouncements();
    setAnnouncementsData(next ?? null);
  }, [refreshAnnouncements]);

  const sectionRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  const scrollMargin = useMemo(() => {
    const navbar = document.querySelector<HTMLElement>('#navigation .navbar');
    return navbar?.offsetHeight ?? SCROLL_MARGIN_FALLBACK_PX;
  }, []);

  useEffect(() => {
    if (!scrollOnMount || hasScrolledRef.current) return undefined;
    const timeout = setTimeout(() => {
      if (sectionRef.current) {
        hasScrolledRef.current = true;
        sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, SCROLL_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [scrollOnMount]);

  if (!policies.displayGroupAnnouncements) {
    return null;
  }

  if (!group.id) {
    return null;
  }

  const isDeepLink = initialRouteConfig.pathname !== groupAnnouncementsConstants.routes.base;

  return (
    <div
      ref={sectionRef}
      className='section group-announcements'
      style={{ scrollMarginTop: scrollMargin }}>
      <SystemFeedbackProvider>
        <RealtimeProvider>
          <QueryClientProvider client={queryClient}>
            <CommunityProductFeaturesContextProvider groupId={group.id}>
              <EmotesProvider groupId={group.id}>
                <MemoryRouter
                  initialEntries={
                    isDeepLink
                      ? [{ pathname: groupAnnouncementsConstants.routes.base }, initialRouteConfig]
                      : [initialRouteConfig]
                  }
                  initialIndex={isDeepLink ? 1 : 0}>
                  <Switch>
                    <Route exact path='/'>
                      <GroupAnnouncementsDisplay
                        group={group}
                        joinGroup={joinGroup}
                        allowedToJoinGroup={allowedToJoinGroup}
                        policies={policies}
                        metadata={metadata}
                        canCreateAnnouncements={canCreateAnnouncements}
                        onAnnouncementLoaded={onAnnouncementLoaded}
                        announcementsData={announcementsData}
                        onAnnouncementDeleted={handleDeleted}
                      />
                    </Route>
                    <Route path={groupAnnouncementsConstants.routes.createAnnouncement}>
                      <AnnouncementComposer groupId={group.id} onPublished={handlePublished} />
                    </Route>
                    <Route path={groupAnnouncementsConstants.routes.editAnnouncement}>
                      <AnnouncementComposer groupId={group.id} onPublished={handlePublished} />
                    </Route>
                  </Switch>
                </MemoryRouter>
              </EmotesProvider>
            </CommunityProductFeaturesContextProvider>
          </QueryClientProvider>
        </RealtimeProvider>
      </SystemFeedbackProvider>
    </div>
  );
};

export default withTranslations(GroupAnnouncementsSection, groupAnnouncementsConfig);
