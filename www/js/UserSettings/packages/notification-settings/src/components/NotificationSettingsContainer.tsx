import { JSX, useEffect, useMemo } from "react";
import { NavLink, Route, Switch } from "react-router-dom";
import { useLazyLoadQuery, useFragment } from "react-relay";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { useTranslation } from "@rbx/core-scripts/react";
import { SettingListItem, useSnackbar } from "@rbx/user-settings";
import { PageList } from "./PageList";
import { CategoryPage } from "./CategoryPage";
import { SettingPage } from "./SettingPage";
import { CommunitiesCategoryPage } from "./communities/CommunitiesCategoryPage";
import { MyCommunitiesPage } from "./communities/MyCommunitiesPage";
import { CommunitySettingsPage } from "./communities/CommunitySettingsPage";
import { ExperiencesCategoryPage } from "./experiences/ExperiencesCategoryPage";
import { MyExperiencesPage } from "./experiences/MyExperiencesPage";
import { DeviceNotificationsPage } from "./deviceNotifications/DeviceNotificationsPage";
import { EnableNotificationsPrompt } from "./EnableNotificationsPrompt";
import { CATEGORY_KEYS } from "../constants/notificationConstants";
import translationConstants from "../constants/translationConstants";
import { ROUTES, buildCategoryPages, buildCategoryPath } from "../utils/routingUtils";
import { notificationTypeHasAvailableOptions } from "../utils/presentationUtils";
import { notificationSettingsHelpUrl } from "../constants/urlConstants";
import type { NotificationSettingsContainerQuery as QueryType } from "./__generated__/NotificationSettingsContainerQuery.graphql";
import NotificationSettingsContainerQueryNode from "./__generated__/NotificationSettingsContainerQuery.graphql";
import type { NotificationCategoriesListFragment$key } from "./__generated__/NotificationCategoriesListFragment.graphql";
import NotificationCategoriesListFragmentNode from "./__generated__/NotificationCategoriesListFragment.graphql";

const COMMUNITIES_CATEGORY_PATH = buildCategoryPath(CATEGORY_KEYS.communities);
const EXPERIENCES_CATEGORY_PATH = buildCategoryPath(CATEGORY_KEYS.experiences);

export const NotificationSettingsContainer = (): JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const data = useLazyLoadQuery<QueryType>(NotificationSettingsContainerQueryNode, {
    userId: String(authenticatedUser.id),
  });

  const notificationsRef = data.userById?.settings?.notifications;

  const notifications = useFragment<NotificationCategoriesListFragment$key>(
    NotificationCategoriesListFragmentNode,
    notificationsRef ?? null,
  );

  useEffect(() => {
    if (!notifications) {
      snackbarService.warning(translate(translationConstants.unknownError));
    }
  }, [notifications, snackbarService, translate]);

  const categories = useMemo(() => notifications?.categories ?? [], [notifications]);
  // Hide categories that have no notification types with available options.
  // Communities and Experiences are exceptions; they always appear in the list
  // because they host the "My communities" / "My experiences" sections.
  const visibleCategoryPages = useMemo(() => {
    const visibleCategories = categories.filter(category => {
      const categoryKey = category.category.value;
      if (categoryKey === CATEGORY_KEYS.communities || categoryKey === CATEGORY_KEYS.experiences) {
        return true;
      }
      return category.notificationTypes.some(notificationTypeHasAvailableOptions);
    });
    return buildCategoryPages(visibleCategories);
  }, [categories]);

  if (!notifications) {
    return <div />;
  }

  return (
    <Switch>
      <Route exact path={ROUTES.categories}>
        <span className="text-body-medium">
          {translate(translationConstants.notificationsDescription)}
        </span>

        {/* Enable Notifications Prompt - Only show if push notifications are not enabled */}
        <EnableNotificationsPrompt />

        {/* Device Notifications */}
        <nav>
          <NavLink to={ROUTES.deviceNotifications}>
            <SettingListItem
              id="device-notifications"
              title={translate(translationConstants.deviceNotificationsHeading)}
              description={translate(translationConstants.deviceNotificationsDescription)}
              showArrow
            />
          </NavLink>
        </nav>

        <div className="rbx-divider" />

        {/* Notification category list */}
        <PageList pages={visibleCategoryPages} />

        {/* Learn more about notification settings link */}
        <div
          className="text-body-small margin-top-medium"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: translate(translationConstants.learnMoreNotificationSettings, {
              linkStart: `<a class="text-link" target="_blank" rel="noreferrer" href="${notificationSettingsHelpUrl}">`,
              linkEnd: "</a>",
            }),
          }}
        />
      </Route>

      <Route exact path={ROUTES.deviceNotifications}>
        <DeviceNotificationsPage notificationsRef={notifications} />
      </Route>

      {/* Communities category: notification types + "My communities" link */}
      <Route exact path={COMMUNITIES_CATEGORY_PATH}>
        <CommunitiesCategoryPage categories={categories} />
      </Route>
      {/* List of user's communities */}
      <Route exact path={ROUTES.myCommunities}>
        <MyCommunitiesPage />
      </Route>
      {/* Individual community settings */}
      <Route exact path={ROUTES.communitySettings}>
        <CommunitySettingsPage categories={categories} />
      </Route>

      {/* Experiences category + My experiences list */}
      <Route exact path={EXPERIENCES_CATEGORY_PATH}>
        <ExperiencesCategoryPage categories={categories} />
      </Route>
      <Route exact path={ROUTES.myExperiences}>
        <MyExperiencesPage />
      </Route>

      {/* Generic category/setting routes */}
      <Route exact path={ROUTES.category}>
        <CategoryPage categories={categories} />
      </Route>
      <Route exact path={ROUTES.setting}>
        <SettingPage categories={categories} />
      </Route>
    </Switch>
  );
};

export default NotificationSettingsContainer;
