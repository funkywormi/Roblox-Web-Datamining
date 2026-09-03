import React, { useMemo } from "react";
import { useTranslation } from "@rbx/core-scripts/legacy/react-utilities";
import subcategoryHelpArticleMap from "../../core/constants/subcategoryHelpArticleMap";
import useArticleSuggestions from "../../hooks/useArticleSuggestions";
import SingleArticleSuggestion from "./SingleArticleSuggestion";
import useGetUserLocale, { DEFAULT_LOCALE } from "../../hooks/useGetUserLocale";
import useGetIXPResult from "../../hooks/useGetIXPResult";
import { SubCategory } from "../../core/types/serviceMetadataResponse";

import "./ArticleSuggestions.scss";

// Maximum number of article suggestions to display
const MAX_HC_ARTICLE_SUGGESTIONS = 3;
const IXP_EXPERIMENT_LAYER = "CustomerCare.SupportForm.HelpArticleSuggestions";
const IXP_EXPERIMENT_PARAMETER = "show_hc_article_suggestions";

const APPEAL_SUBCATEGORIES: string[] = [
  SubCategory.AppealAccount,
  SubCategory.AppealContent,
  SubCategory.AppealForChild,
  SubCategory.AppealNonAssetContent,
];

interface ArticleSuggestionsProps {
  helpSubCategoryType?: string;
  hcArticleClickHandler?: () => void;
}

const ArticleSuggestions: React.FC<ArticleSuggestionsProps> = ({
  helpSubCategoryType,
  hcArticleClickHandler,
}) => {
  // Check if the feature is enabled based on the IXP layer
  const { data: showHcArticleSuggestions, isLoading: isIxpResultLoading } = useGetIXPResult(
    IXP_EXPERIMENT_LAYER,
    IXP_EXPERIMENT_PARAMETER,
  );

  const articleIds = useMemo(
    () =>
      helpSubCategoryType
        ? (subcategoryHelpArticleMap[helpSubCategoryType]?.slice(0, MAX_HC_ARTICLE_SUGGESTIONS) ??
          [])
        : [],
    [helpSubCategoryType],
  );

  const { translate: t } = useTranslation();
  const { data: userLocale, isLoading: isUserLocaleLoading } = useGetUserLocale(
    !!showHcArticleSuggestions && !!helpSubCategoryType,
  );

  const disableSuggestions =
    !showHcArticleSuggestions || !helpSubCategoryType || isUserLocaleLoading || isIxpResultLoading;

  const {
    data: articles,
    isLoading: isArticleSuggestionsLoading,
    isError: isArticleSuggestionsError,
  } = useArticleSuggestions(articleIds, disableSuggestions, userLocale || DEFAULT_LOCALE);

  if (
    disableSuggestions ||
    !articles.length ||
    isArticleSuggestionsLoading ||
    isArticleSuggestionsError
  ) {
    return null;
  }

  let helpSuggestionLabel =
    articles.length === 1 ? t("Label.HelpSuggestionSingular") : t("Label.HelpSuggestion");

  /**
   * For appeal subcategories, we update the suggestion label to ensure the user understands that the
   * link is both for appeal help and also for appeal disclosure information (required by UK OSA).
   *
   * This will be updated again though once we remove these options from the Support Form and into the
   * Violations & Appeals Portal.
   */
  if (APPEAL_SUBCATEGORIES.includes(helpSubCategoryType ?? "")) {
    helpSuggestionLabel = t("Description.LearnMore.V2", { link: "", linkEnd: "" });
  }

  return (
    <div className="cc-hc-article-suggestions">
      <span>{helpSuggestionLabel}</span>
      {articles.map(articleInfo => (
        <SingleArticleSuggestion
          key={articleInfo.id}
          article={articleInfo}
          hcArticleClickHandler={hcArticleClickHandler}
        />
      ))}
    </div>
  );
};

export default ArticleSuggestions;
