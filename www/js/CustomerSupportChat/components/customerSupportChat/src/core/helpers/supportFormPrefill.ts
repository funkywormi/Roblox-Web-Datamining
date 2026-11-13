import { defaultMaxIssueDescriptionFieldLength } from "../constants/supportTicketConstants";
import { Item } from "../types/common";
import { Category } from "../types/serviceResponse";

/** What the new support experience hands the classic form when it swaps to it. */
export type SupportFormPrefill = {
  message: string;
  category?: string;
  subcategory?: string;
  fromSupportAsk?: boolean;
  /** The landing fallback had to shorten the text to fit the description field. */
  messageWasShortened?: boolean;
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

const FALLBACK_SEPARATOR = "\n\n";

/**
 * Fits a landing fallback into the classic form's description field. The follow-up was typed
 * while the create was pending and never sent, so it is kept whole and the first message is
 * what gets shortened. A follow-up that is itself over the limit keeps its newest characters.
 */
export const fitSupportFormFallbackMessage = (
  firstMessage: string,
  followUp: string,
): { message: string; wasShortened: boolean } => {
  const limit = defaultMaxIssueDescriptionFieldLength;
  const extra = followUp.trim();
  const combined = extra ? `${firstMessage}${FALLBACK_SEPARATOR}${extra}` : firstMessage;
  if (combined.length <= limit) {
    return { message: combined, wasShortened: false };
  }
  if (!extra) {
    return { message: firstMessage.slice(0, limit), wasShortened: true };
  }
  if (extra.length >= limit) {
    return { message: extra.slice(extra.length - limit), wasShortened: true };
  }
  const room = limit - FALLBACK_SEPARATOR.length - extra.length;
  const head = firstMessage.slice(0, Math.max(room, 0)).trimEnd();
  return {
    message: head ? `${head}${FALLBACK_SEPARATOR}${extra}` : extra,
    wasShortened: true,
  };
};
