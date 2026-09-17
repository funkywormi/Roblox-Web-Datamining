import React, { useEffect, useRef } from 'react';
import { Route, Switch } from 'react-router-dom';
import type { Group } from '../../shared/types';
import { logGroupPageExposureEvent } from '../../shared/utils/logging';
import { EventContext, EventType } from '../../shared/constants/eventConstants';
import AgeAssuranceUpsell from '../components/AgeAssuranceUpsell';
import ForumsDisabledOwnerBanner from '../components/ForumsDisabledOwnerBanner';
import ForumsEnabledWrapper from '../components/ForumsEnabledWrapper';
import groupForumsConstants from '../constants/groupForumsConstants';
import Categories from './Categories';
import type { CategoriesNavigationComponent } from './Categories';
import Post from './Post';
import PostComposer from './PostComposer';

type ForumRoutesProps = {
  group: Group;
  userId: number;
  isOwner: boolean;
  categoriesNavigation?: CategoriesNavigationComponent;
};

const ForumRoutes = ({
  group,
  userId,
  isOwner,
  categoriesNavigation
}: ForumRoutesProps): JSX.Element => {
  const hasLoggedExposure = useRef(false);

  useEffect(() => {
    if (!hasLoggedExposure.current) {
      hasLoggedExposure.current = true;
      logGroupPageExposureEvent({
        groupId: group.id,
        exposureType: EventType.GroupForumsExposureEvent,
        context: EventContext.GroupForums
      });
    }
  }, [group.id]);

  return (
    <ForumsEnabledWrapper userId={userId} group={group}>
      {isOwner && <ForumsDisabledOwnerBanner />}
      <AgeAssuranceUpsell />
      <Switch>
        <Route
          path={groupForumsConstants.router.postEditRoute}
          render={(routeProps: { match: { params: { categoryId: string; postId: string } } }) => (
            <PostComposer
              defaultCategoryId={routeProps.match.params.categoryId}
              editingPostId={routeProps.match.params.postId}
            />
          )}
        />
        <Route
          path={groupForumsConstants.router.postCreateRoute}
          render={(routeProps: { match: { params: { categoryId: string } } }) => (
            <PostComposer defaultCategoryId={routeProps.match.params.categoryId} />
          )}
        />
        <Route
          path={[
            groupForumsConstants.router.postCommentRoute,
            groupForumsConstants.router.postRoute
          ]}>
          <div className='group-forums-post-wrapper'>
            <Post />
          </div>
        </Route>
        <Route
          path={[
            groupForumsConstants.router.categoryRoute,
            groupForumsConstants.router.defaultRoute
          ]}>
          <Categories navigationComponent={categoriesNavigation} />
        </Route>
      </Switch>
    </ForumsEnabledWrapper>
  );
};

export default ForumRoutes;
