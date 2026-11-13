/**
 * The content items a C3 bot message can carry next to its markdown `message`. Items come from
 * the server unchecked, so anything of an unknown type or the wrong shape is left out, and a
 * message with nothing left shows its `message` instead.
 */

export type C3ArticleCard = { id: string; title: string };
export type C3SelectOption = { value: string; label: string };

export type C3ContentItem =
  | { type: "markdown"; text: string }
  | { type: "tag"; text: string }
  | { type: "article_cards"; text?: string; articles: C3ArticleCard[] }
  | {
      type: "single_select";
      id: string;
      text?: string;
      required: boolean;
      options: C3SelectOption[];
    }
  | {
      type: "confirm_reject";
      id: string;
      text?: string;
      confirmLabel: string;
      rejectLabel: string;
    };

export const CONFIRM_VALUE = "confirm";
export const REJECT_VALUE = "reject";

const HELP_CENTER_ARTICLE_URL = "https://en.help.roblox.com/hc/en-us/articles/";
const ARTICLE_ID = /^\d{1,20}$/;

/** Help Center links are built from the article id, so the server never supplies a URL. */
export const helpCenterArticleUrl = (articleId: string): string =>
  `${HELP_CENTER_ARTICLE_URL}${articleId}`;

type Fields = Record<string, unknown>;

const isFields = (value: unknown): value is Fields =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const nonEmptyString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value : undefined;

const toArticle = (value: unknown): C3ArticleCard | undefined => {
  if (!isFields(value)) {
    return undefined;
  }
  const id = nonEmptyString(value.id);
  const title = nonEmptyString(value.title);
  return id && ARTICLE_ID.test(id) && title ? { id, title } : undefined;
};

const toOption = (value: unknown): C3SelectOption | undefined => {
  if (!isFields(value)) {
    return undefined;
  }
  const optionValue = nonEmptyString(value.value);
  const label = nonEmptyString(value.label);
  return optionValue && label ? { value: optionValue, label } : undefined;
};

const isDefined = <T>(value: T | undefined): value is T => value !== undefined;

const toContentItem = (value: unknown): C3ContentItem | undefined => {
  if (!isFields(value)) {
    return undefined;
  }
  const text = nonEmptyString(value.text);
  const id = nonEmptyString(value.id);
  switch (value.type) {
    case "markdown":
    case "tag":
      return text ? { type: value.type, text } : undefined;
    case "article_cards": {
      const articles = Array.isArray(value.articles)
        ? value.articles.map(toArticle).filter(isDefined)
        : [];
      return articles.length ? { type: "article_cards", text, articles } : undefined;
    }
    case "single_select": {
      const options = Array.isArray(value.options)
        ? value.options.map(toOption).filter(isDefined)
        : [];
      return id && options.length
        ? { type: "single_select", id, text, required: value.required === true, options }
        : undefined;
    }
    case "confirm_reject": {
      const confirmLabel = nonEmptyString(value.confirmLabel);
      const rejectLabel = nonEmptyString(value.rejectLabel);
      return id && confirmLabel && rejectLabel
        ? { type: "confirm_reject", id, text, confirmLabel, rejectLabel }
        : undefined;
    }
    default:
      return undefined;
  }
};

const isControl = (item: C3ContentItem): boolean =>
  item.type === "single_select" || item.type === "confirm_reject";

/** The items this client can show, in order, keeping only the first control. */
export const getC3ContentItems = (content: readonly unknown[] | undefined): C3ContentItem[] => {
  const items = (content ?? []).map(toContentItem).filter(isDefined);
  const firstControl = items.findIndex(isControl);
  return items.filter((item, index) => !isControl(item) || index === firstControl);
};

/** Whether the message asks a question that has to be answered with its control. */
export const hasRequiredControl = (content: readonly unknown[] | undefined): boolean =>
  getC3ContentItems(content).some(item => item.type === "single_select" && item.required);
