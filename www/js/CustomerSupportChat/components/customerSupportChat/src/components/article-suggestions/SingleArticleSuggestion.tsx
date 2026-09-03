import React from "react";

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
  return (
    <a
      className="cc-hc-article-suggestion"
      data-testid={`cc-hc-article-suggestion-${article.id}`}
      href={article.url}
      onClick={hcArticleClickHandler}
      target="_blank"
      rel="noopener noreferrer"
    >
      {article.title}
    </a>
  );
};

export default SingleArticleSuggestion;
