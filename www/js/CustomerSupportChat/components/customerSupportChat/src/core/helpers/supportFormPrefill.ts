import { defaultMaxIssueDescriptionFieldLength } from "../constants/supportTicketConstants";
import { Item } from "../types/common";
import { Category } from "../types/serviceResponse";

/** What the new support experience hands the classic form when it swaps to it. */
export type SupportFormPrefill = {
  message: string;
  category?: string;
  subcategory?: string;
};

export type SupportFormCategorySelection = {
  category: Item;
  subcategory: Item;
};

/**
 * The dropdowns key off the metadata identifier, while the ask reply names the pair.
 * Both have to be categories this user is offered, or neither is selected.
 */
export const supportFormSelectionFromPrefill = (
  prefill: SupportFormPrefill,
  categories: Category[],
): SupportFormCategorySelection | undefined => {
  if (!prefill.category || !prefill.subcategory) {
    return undefined;
  }
  const categoryIndex = categories.findIndex(
    category => category.mainCategory.name === prefill.category,
  );
  const category = categories[categoryIndex];
  if (!category) {
    return undefined;
  }
  const subcategoryIndex = category.subCategories.findIndex(
    subcategory => subcategory.name === prefill.subcategory,
  );
  const subcategory = category.subCategories[subcategoryIndex];
  if (!subcategory) {
    return undefined;
  }
  return {
    category: {
      id: category.mainCategory.identifier,
      name: category.mainCategory.description,
      val: category.mainCategory.name,
      intVal: categoryIndex,
    },
    subcategory: {
      id: subcategory.identifier,
      name: subcategory.description,
      val: subcategory.name,
      intVal: subcategoryIndex,
    },
  };
};

export const clipSupportFormMessage = (message: string): string =>
  message.slice(0, defaultMaxIssueDescriptionFieldLength);
