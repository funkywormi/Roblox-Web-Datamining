import React, { useEffect, useRef } from 'react';
import { useSystemFeedback } from 'react-style-guide';
import { Route, Switch } from 'react-router-dom';
import { Group, GroupPermissions, GroupChannelPermissions } from '../../shared/types';
import Categories from './Categories';
import PostComposer from './PostComposer';
import Providers from './Providers';
import groupForumsConstants from '../constants/groupForumsConstants';
import Post from './Post';
import BlockUserModal from '../../shared/components/dialogs/BlockUserDialog';
import BanUserModal from '../../shared/components/dialogs/BanUserDialog';
import KickUserModal from '../../shared/components/dialogs/KickUserDialog';
import AgeAssuranceUpsell from '../components/AgeAssuranceUpsell';
import ForumsEnabledWrapper from '../components/ForumsEnabledWrapper';
import HideForumEntityModal from '../../shared/components/dialogs/HideForumEntityDialog';
import DeleteForumEntityModal from '../../shared/components/dialogs/DeleteForumEntityDialog';
import { logGroupPageExposureEvent } from '../../shared/utils/logging';
import { EventContext, EventType } from '../../shared/constants/eventConstants';
import ForumsDisabledOwnerBanner from '../components/ForumsDisabledOwnerBanner';

export type GroupForumsProps = {
  group: Group;
  permissions: GroupPermissions;
  channelsPermissions: GroupChannelPermissions[];
  userId: number;
  isGroupMember: boolean;
  isEnabled: boolean;
};

const SystemFeedbackOutlet: React.FC = () => {
  const { SystemFeedbackComponent } = useSystemFeedback();
  return <SystemFeedbackComponent />;
};

const GroupForums = ({
  group,
  permissions,
  channelsPermissions,
  userId,
  isGroupMember,
  isEnabled
}: GroupForumsProps): JSX.Element | null => {
  const hasLoggedExposure = useRef(false);
  const isOwner = group.owner?.userId === userId;

  useEffect(() => {
    if (!hasLoggedExposure.current && isEnabled && group?.id) {
      hasLoggedExposure.current = true;
      logGroupPageExposureEvent({
        groupId: group.id,
        exposureType: EventType.GroupForumsExposureEvent,
        context: EventContext.GroupForums
      });
    }
  }, [isEnabled, group?.id]);

  if (!isEnabled) return null;
  if (!group?.id) return null;

  return (
    <Providers
      permissions={permissions}
      channelsPermissions={channelsPermissions}
      groupId={group.id}
      userId={userId}
      isOwner={isOwner}
      isGroupMember={isGroupMember}>
      <ForumsEnabledWrapper userId={userId} group={group}>
        <div className='section group-forums'>
          {isOwner && <ForumsDisabledOwnerBanner />}

          <AgeAssuranceUpsell />
          <Switch>
            <Route
              path={groupForumsConstants.router.postEditRoute}
              render={(routeProps: {
                match: { params: { categoryId: string; postId: string } };
              }) => {
                return (
                  <PostComposer
                    defaultCategoryId={routeProps.match.params.categoryId}
                    editingPostId={routeProps.match.params.postId}
                  />
                );
              }}
            />
            <Route
              path={groupForumsConstants.router.postCreateRoute}
              render={(routeProps: { match: { params: { categoryId: string } } }) => {
                return <PostComposer defaultCategoryId={routeProps.match.params.categoryId} />;
              }}
            />
            <Route path={groupForumsConstants.router.postCommentRoute}>
              <div className='group-forums-post-wrapper'>
                <Post />
              </div>
            </Route>
            <Route path={groupForumsConstants.router.postRoute}>
              <div className='group-forums-post-wrapper'>
                <Post />
              </div>
            </Route>
            <Route path={groupForumsConstants.router.categoryRoute}>
              <Categories />
            </Route>
            <Route path={groupForumsConstants.router.defaultRoute}>
              <Categories />
            </Route>
          </Switch>
          <SystemFeedbackOutlet />
        </div>
        <BlockUserModal />
        <BanUserModal />
        <KickUserModal />
        <HideForumEntityModal />
        <DeleteForumEntityModal />
      </ForumsEnabledWrapper>
    </Providers>
  );
};

export default GroupForums;
