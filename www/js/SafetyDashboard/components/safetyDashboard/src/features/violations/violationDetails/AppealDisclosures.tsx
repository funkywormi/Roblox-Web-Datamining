import { useTranslation } from "@rbx/core-scripts/react";
import { translateHtml } from "@rbx/translation-utils";
import { CONTENT_MODERATION_HELP_URL } from "../../../shared/url";

/**
 * A simple component that renders text telling users where to go for more
 * information about the appeals process and other disclosures (required by
 * UK OSA).
 */
const AppealDisclosures = () => {
  const { translate } = useTranslation();

  return (
    <p className="text-body-small">
      {translateHtml(translate, "Description.AppealDisclosures", [
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
    </p>
  );
};

export default AppealDisclosures;
