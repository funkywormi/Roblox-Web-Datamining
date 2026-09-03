import React from "react";
import { ParagraphLinksType } from "../utils/types";

interface ArwpParagraphProps {
  text: string;
  links?: ParagraphLinksType;
}

const ArwpParagraph = ({ text, links }: ArwpParagraphProps) => {
  // Split the text into partitions by the placeholders and map them to the correct JSX elements.
  const content = text.split(/({\S+})/g).map(partition => {
    const match = /{(\S+)}/.exec(partition);

    // If the current partition is not a placeholder, return the string as is.
    if (!match) {
      return partition;
    }

    // The first (1) index of the match is the content within the regex capture group i.e. the placeholder value itself.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const placeholderValue = match[1]!;
    const linkObject = links?.[placeholderValue];

    // If the placeholder value was found in the links object, return a Link component. Otherwise, return the string as is.
    return linkObject ? (
      <a key={partition} href={linkObject.url} className="text-link">
        {linkObject.label}
      </a>
    ) : (
      partition
    );
  });

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <React.Fragment>{content}</React.Fragment>;
};

export default ArwpParagraph;
