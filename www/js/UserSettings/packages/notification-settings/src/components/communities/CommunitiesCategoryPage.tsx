import { JSX } from "react";
import { Link, Redirect } from "react-router-dom";
import { useFragment } from "react-relay";
import { useTranslation } from "@rbx/core-scripts/react";
import { SettingListItem } from "@rbx/user-settings";
import { BackLink } from "../BackLink";
import { NotificationTypePageList } from "../NotificationTypePageList";
import { CATEGORY_KEYS } from "../../constants/notificationConstants";
import translationConstants from "../../constants/translationConstants";
import { ROUTES, buildCategoryPath } from "../../utils/routingUtils";
import {
  notificationTypeHasAvailableOptions,
  resolveCategoryPresentation,
} from "../../utils/presentationUtils";
import type { CategoryPageFragment$key } from "../__generated__/CategoryPageFragment.graphql";
import CategoryPageFragmentNode from "../__generated__/CategoryPageFragment.graphql";
import type { NotificationCategory } from "../../types";

type CommunitiesCategoryPageProps = {
  categories: readonly NotificationCategory[];
};

// Mostly the same as CategoryPage, but with "My communities" menu link added at the bottom
// to navigate to the list of user's communities
export const CommunitiesCategoryPage = ({
  categories,
}: CommunitiesCategoryPageProps): JSX.Element => {
  const { translate } = useTranslation();

  const categoryRow = categories.find(c => c.category.value === CATEGORY_KEYS.communities);

  const notificationCategory = useFragment<CategoryPageFragment$key>(
    CategoryPageFragmentNode,
    categoryRow ?? null,
  );

  if (!notificationCategory) {
    return <Redirect to={ROUTES.categories} />;
  }

  const { titleTranslationKey, descriptionTranslationKey } = resolveCategoryPresentation(
    notificationCategory.category.value,
  );
  const description = descriptionTranslationKey ? translate(descriptionTranslationKey) : undefined;

  const visibleNotificationTypes = notificationCategory.notificationTypes.filter(
    notificationTypeHasAvailableOptions,
  );
  const hasVisibleNotificationTypes = visibleNotificationTypes.length > 0;

  return (
    <div className="category-page">
      <BackLink
        currentPagePath={buildCategoryPath(notificationCategory.category.value)}
        titleTranslationKey={titleTranslationKey}
      />
      {description && <p className="text-body-medium">{description}</p>}
      <NotificationTypePageList
        categoryKey={notificationCategory.category.value}
        notificationTypes={visibleNotificationTypes}
      />
      {hasVisibleNotificationTypes && <div className="rbx-divider" />}
      <div className="settings-list">
        <Link to={ROUTES.myCommunities} className="settings-list-link">
          <SettingListItem
            id="my-communities-link"
            title={translate(translationConstants.myCommunities)}
            description={translate(translationConstants.myCommunitiesDescription)}
            showArrow
          />
        </Link>
      </div>
    </div>
  );
};

export default CommunitiesCategoryPage;
