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

type ExperiencesCategoryPageProps = {
  categories: readonly NotificationCategory[];
};

export const ExperiencesCategoryPage = ({
  categories,
}: ExperiencesCategoryPageProps): JSX.Element => {
  const { translate } = useTranslation();

  const categoryRow = categories.find(c => c.category.value === CATEGORY_KEYS.experiences);

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
        <Link to={ROUTES.myExperiences} className="settings-list-link">
          <SettingListItem
            id="my-experiences-link"
            title={translate(translationConstants.myExperiences)}
            description={translate(translationConstants.myExperiencesDescription)}
            showArrow
          />
        </Link>
      </div>
    </div>
  );
};

export default ExperiencesCategoryPage;
