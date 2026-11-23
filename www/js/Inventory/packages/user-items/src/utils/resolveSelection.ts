import type { Category, Subcategory } from "../constants/types";
import { makeUrlFriendly, type HashRoute } from "./hashRoute";

const byUrlName =
  (urlName: string) =>
  (element: { name: string }): boolean =>
    makeUrlFriendly(element.name) === makeUrlFriendly(urlName);

export const resolveSelection = (
  categories: readonly Category[],
  route: HashRoute,
  defaultCategoryName = "",
): { category: Category; subcategory: Subcategory } | null => {
  const category =
    categories.find(byUrlName(route.categoryName)) ??
    categories.find(byUrlName(defaultCategoryName)) ??
    categories[0];
  if (!category) {
    return null;
  }
  const subcategory =
    (route.subcategoryName ? category.items.find(byUrlName(route.subcategoryName)) : undefined) ??
    category.items[0];
  if (!subcategory) {
    return null;
  }
  return { category, subcategory };
};
