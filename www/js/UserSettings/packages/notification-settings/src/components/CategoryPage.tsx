import { JSX } from "react";
import { Redirect, useParams } from "react-router-dom";
import { useFragment } from "react-relay";
import { useTranslation } from "@rbx/core-scripts/react";
import { BackLink } from "./BackLink";
import { NotificationTypePageList } from "./NotificationTypePageList";
import { ROUTES, buildCategoryPath } from "../utils/routingUtils";
import {
  notificationTypeHasAvailableOptions,
  resolveCategoryPresentation,
} from "../utils/presentationUtils";
import type { CategoryPageFragment$key } from "./__generated__/CategoryPageFragment.graphql";
import CategoryPageFragmentNode from "./__generated__/CategoryPageFragment.graphql";
import type { NotificationCategory, CategoryParams } from "../types";

type CategoryPageProps = {
  categories: readonly NotificationCategory[];
};

export const CategoryPage = ({ categories }: CategoryPageProps): JSX.Element => {
  const { categoryKey } = useParams<CategoryParams>();
  const { translate } = useTranslation();

  const categoryRef = categories.find(c => c.category.value === categoryKey);

  const notificationCategory = useFragment<CategoryPageFragment$key>(
    CategoryPageFragmentNode,
    categoryRef ?? null,
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
    </div>
  );
};

export default CategoryPage;
