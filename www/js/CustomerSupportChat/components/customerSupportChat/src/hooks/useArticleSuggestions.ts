// import { ExperimentationService } from '@rbx/core-scripts/legacy/Roblox';
import { useQueries, UseQueryResult } from "@tanstack/react-query";
import { HelpArticle, ZendeskArticleTranslationsResponse } from "../core/types/common";
import { DEFAULT_LOCALE } from "./useGetUserLocale";
/**
 * @param locale a standard locale string, e.g. 'en-US', 'zh-CN' following ISO 639-1 and ISO 3166-1 alpha-2 standards.
 * Zendesk uses a slightly different format, so we need to normalize it to a 2-letter language code.
 * There are some exceptions for languages like Chinese or English, where we need to handle variants.
 * @returns
 */
const toZendeskLocale = (locale?: string): string | undefined => {
  if (!locale) return undefined;
  const normalized = locale.replace("-", "_").toLowerCase();

  // English
  if (normalized === "en" || normalized === "en_us") return "en-us";

  // Chinese variants
  if (normalized === "zh_cn") return "zh-cn";
  if (normalized === "zh_tw") return "zh-tw";
  if (normalized === "zh_hk") return "zh-hk";

  // General: use first part for most languages
  return normalized.split("_")[0];
};

/**
 *
 * @param articleId The ID of the article to fetch translations for.
 * This is the numeric ID used in the Zendesk API, e.g. '203313390'.
 * Function that fetches the article translations from Zendesk based on the user's locale.
 * example fetch URL: https://en.help.roblox.com/api/v2/help_center/articles/203313390/translations/fr.json
 * @returns the article information including ID, title, and URL.
 */
const fetchArticleInfo = async (
  articleId: string,
  userLocale: string,
): Promise<HelpArticle | null> => {
  try {
    if (!articleId) return null;

    const zendeskUserLocale = toZendeskLocale(userLocale);
    const requestedLocales = [DEFAULT_LOCALE];
    if (zendeskUserLocale && zendeskUserLocale !== DEFAULT_LOCALE) {
      requestedLocales.push(zendeskUserLocale);
    }

    const response = await fetch(
      `https://en.help.roblox.com/api/v2/help_center/articles/${articleId}/translations?locales=${requestedLocales.join(
        ",",
      )}`,
    );
    if (!response.ok) return null;

    const translationList = (await response.json()) as ZendeskArticleTranslationsResponse;
    if (!translationList.translations?.length) return null;

    const translation =
      translationList.translations.find(t => t.locale === zendeskUserLocale) ||
      translationList.translations.find(t => t.locale === DEFAULT_LOCALE);

    if (!translation) return null;

    return {
      id: articleId,
      title: translation.title,
      url: `${translation.html_url}?src=contact_us`,
    };
  } catch {
    return null;
  }
};

export default function useArticleSuggestions(
  articleIds: string[],
  disable: boolean,
  userLocale: string,
): {
  data: HelpArticle[];
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
} {
  const queryResults: UseQueryResult<HelpArticle | null>[] = useQueries({
    queries: articleIds
      ? articleIds.map(articleId => ({
          queryKey: ["zendeskArticleTranslation", articleId, userLocale],
          queryFn: () => fetchArticleInfo(articleId, userLocale),
          enabled: articleIds.length > 0 && !disable,
        }))
      : [],
  });

  // aggregate results from multiple queries
  const isSuccess = queryResults.every(result => result.isSuccess);
  const isError = queryResults.some(result => result.isError);
  const isLoading = queryResults.some(result => result.isLoading);
  const data = queryResults
    .filter(result => result.isSuccess)
    .map(result => result.data)
    .filter(article => article && article.url) as HelpArticle[];

  return {
    data,
    isSuccess,
    isError,
    isLoading,
  };
}
