import { ReactNode } from "react";
import { EventTypes } from "../telemetry/analytics";
import type { TranslateFunction } from "../providers/types";

const START_LINK_PLACEHOLDER = "{startLink}";
const END_LINK_PLACEHOLDER = "{endLink}";

type SendEventFn = (eventType: EventTypes) => void;

type TranslateWithLinkFunction = (
  key: string,
  href: string,
  params?: Record<string, string>,
  eventStreamEventName?: EventTypes,
) => ReactNode;

/**
 * This function is used to create a new function that can be used to translate a string with a link.
 * By default, the translated string has a placeholder for the start and end of the link.
 * The function will parse the translated string into the beforeLink, withinLink, and afterLink which
 * can then be used to create an actual, functional link component.
 *
 * Example:
 * "This is a test {startLink} and this is a test {endLink}"
 *
 * beforeLink: "This is a test "
 * withinLink: "and this is a test"
 * afterLink: ""
 */
const makeTranslateWithLink = (
  translate: TranslateFunction,
  sendEvent?: SendEventFn,
): TranslateWithLinkFunction => {
  const translateWithLink: TranslateWithLinkFunction = (
    key,
    href,
    params,
    eventStreamEventName,
  ) => {
    const translated = translate(key, {
      startLink: START_LINK_PLACEHOLDER,
      endLink: END_LINK_PLACEHOLDER,
      ...params,
    });

    const [beforeLink, withinAndAfterLink] = translated.split(START_LINK_PLACEHOLDER, 2);
    const [withinLink, afterLink] = withinAndAfterLink?.split(END_LINK_PLACEHOLDER, 2) ?? [];

    return (
      <p className="text-body-large">
        {beforeLink}
        <a
          href={href}
          className="content-link"
          rel="noreferrer"
          onClick={() => {
            if (eventStreamEventName != null && sendEvent) {
              sendEvent(eventStreamEventName);
            }
          }}
        >
          {withinLink}
        </a>
        {afterLink}
      </p>
    );
  };

  return translateWithLink;
};

export default makeTranslateWithLink;
