import React from "react";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";

import "./SingleArticleSuggestion.scss";
import { HelpArticle } from "../../core/types/common";

type SingleArticleSuggestionProps = {
  article: HelpArticle;
  hcArticleClickHandler?: () => void;
};

const SingleArticleSuggestion = ({
  article,
  hcArticleClickHandler,
}: SingleArticleSuggestionProps) => {
  // Android in-app webviews receive `_blank` as a new-window request rather than a
  // navigation and drop it, so the article never opens. Navigate in place there only;
  // keep the new-tab behavior on web and other app shells until those are confirmed.
  const target = getDeviceMeta()?.isAndroidApp ? "_self" : "_blank";

  return (
    <a
      className="cc-hc-article-suggestion"
      data-testid={`cc-hc-article-suggestion-${article.id}`}
      href={article.url}
      onClick={hcArticleClickHandler}
      target={target}
      rel="noopener noreferrer"
    >
      {article.title}
    </a>
  );
};

export default SingleArticleSuggestion;
