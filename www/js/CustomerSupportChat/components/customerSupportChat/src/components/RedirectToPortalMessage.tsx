import React from "react";
import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import EnvironmentUrls from "@rbx/environment-urls";
import { translateHtml } from "@rbx/translation-utils";

const VIOLATIONS_AND_APPEALS_URL = `${EnvironmentUrls.websiteUrl}/safety-dashboard#/violations`;

/**
 * Dialog body shown when a support submission is redirected to the appeals portal.
 * These appeals are filed there instead of as a support ticket, so the message
 * includes a link to the Violations & Appeals page. Response.Dialog.RedirectToPortal
 * marks that link's label with {link} and {linkEnd}.
 */
const RedirectToPortalMessage = ({ translate }: { translate: TranslateFunction }) => (
  <React.Fragment>
    {translateHtml(translate, "Response.Dialog.RedirectToPortal", [
      {
        opening: "link",
        closing: "linkEnd",
        render: children => (
          <a
            className="text-blue-500 underline"
            href={VIOLATIONS_AND_APPEALS_URL}
            target="_blank"
            rel="noreferrer"
          >
            {children}
          </a>
        ),
      },
    ])}
  </React.Fragment>
);

export default RedirectToPortalMessage;
