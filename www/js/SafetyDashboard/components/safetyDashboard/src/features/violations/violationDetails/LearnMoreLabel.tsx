import { Fragment } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { translateHtml } from "@rbx/translation-utils";
import { CONTENT_MODERATION_HELP_URL } from "../../../shared/url";

/**
 * A simple label that renders a link to the Appeals Help Article.
 */
const LearnMoreLabel = () => {
  const { translate } = useTranslation();
  return (
    <Fragment>
      {translateHtml(translate, "Description.LearnMore.V2", [
        {
          opening: "link",
          closing: "linkEnd",
          render: children => (
            // We own the help pages, so we don't need noreferrer
            // eslint-disable-next-line react/jsx-no-target-blank
            <a href={CONTENT_MODERATION_HELP_URL} target="_blank" className="content-link">
              {children}
            </a>
          ),
        },
      ])}
    </Fragment>
  );
};

export default LearnMoreLabel;
