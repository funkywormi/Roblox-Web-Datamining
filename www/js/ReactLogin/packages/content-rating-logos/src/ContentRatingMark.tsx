import { JSX } from "react";
import BrazilContentRatingLogo from "./BrazilContentRatingLogo";
import ItalyContentRatingLogo from "./ItalyContentRatingLogo";
import useContentRatingLogos from "./useContentRatingLogos";

export type ContentRatingMarkProps = {
  /** Click handler applied to the Italy mark, the only one with a guide to open. */
  onMarkClick?: () => void;
};

/**
 * The content rating mark (Brazil CLASSIND or Italy PEGI) the visitor's country legally
 * requires, fetched from the content-rating-logo Guac policy. Renders nothing when the
 * policy displays neither mark.
 */
const ContentRatingMark = ({ onMarkClick }: ContentRatingMarkProps = {}): JSX.Element | null => {
  const { shouldDisplayBrazilRatingLogo, shouldDisplayItalyRatingLogo } = useContentRatingLogos();

  if (shouldDisplayBrazilRatingLogo) {
    // Brazil's mark leads nowhere, so it stays static artwork even when the host offers a
    // handler for the other mark.
    return <BrazilContentRatingLogo />;
  }
  if (shouldDisplayItalyRatingLogo) {
    return <ItalyContentRatingLogo onClick={onMarkClick} />;
  }
  return null;
};

export default ContentRatingMark;
