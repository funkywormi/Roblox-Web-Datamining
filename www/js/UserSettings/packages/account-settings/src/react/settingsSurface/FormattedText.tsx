import type { JSX, ReactNode } from "react";
import { Link } from "@rbx/foundation-ui";

export type FormattedTextValue = {
  /** Server-translated text with placeholders left in, e.g. "… {linkStart}Learn more{linkEnd}". */
  readonly text: string;
  /** Links that wrap the words between an `opening` and a `closing` placeholder. */
  readonly links: readonly {
    readonly opening: string;
    readonly closing: string;
    readonly url: string;
  }[];
};

// Splitting on a capture group puts the placeholder names at the odd indexes.
const placeholderPattern = /\{([^{}\s]+)\}/;

/**
 * Renders a server-translated `FormattedText`. The words between a link's opening and closing
 * placeholders become an https link that opens in a new tab. Other placeholders are removed, and
 * a link whose closing placeholder never comes leaves its words as plain text.
 */
export const FormattedText = ({
  text: { text, links },
}: {
  text: FormattedTextValue;
}): JSX.Element => {
  const nodes: ReactNode[] = [];
  let openLink: FormattedTextValue["links"][number] | undefined;
  let linkWords = "";

  text.split(placeholderPattern).forEach((part, index) => {
    if (index % 2 === 0) {
      if (openLink) linkWords += part;
      else nodes.push(part);
    } else if (!openLink) {
      openLink = links.find(link => link.opening === part && link.url.startsWith("https://"));
      linkWords = "";
    } else if (part === openLink.closing) {
      nodes.push(
        <Link
          // eslint-disable-next-line react/no-array-index-key -- the parts of a served text don't reorder
          key={index}
          href={openLink.url}
          target="_blank"
          rel="noreferrer"
          variant="Inline"
          color="Standard"
          underline="always"
        >
          {linkWords}
        </Link>,
      );
      openLink = undefined;
    }
  });
  if (openLink) nodes.push(linkWords);

  return <span>{nodes}</span>;
};
