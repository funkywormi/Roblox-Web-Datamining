import { JSX } from "react";
import BrazilContentRatingLogo from "./BrazilContentRatingLogo";
import ItalyContentRatingLogo from "./ItalyContentRatingLogo";

export type CountryRatingLogosProps = {
  shouldDisplayBrazilRatingLogo: boolean;
  shouldDisplayItalyRatingLogo: boolean;
  /** Opens the PEGI guide behind the host's leave-site confirmation. */
  onItalyContentRatingLogoClick?: () => void;
};

/**
 * Both country marks for the signup and login forms, side by side. Brazil's mark has no rating
 * guide to open, so it renders as static artwork and never takes a handler.
 *
 * These are the page-level marks, so they carry the cypress selectors; the birthday-compliance
 * modal's mark deliberately does not, since the modal can sit over a page that already shows one.
 */
const CountryRatingLogos = ({
  shouldDisplayBrazilRatingLogo,
  shouldDisplayItalyRatingLogo,
  onItalyContentRatingLogoClick,
}: CountryRatingLogosProps): JSX.Element => (
  <div>
    {shouldDisplayBrazilRatingLogo && <BrazilContentRatingLogo id="brazil-rating-logo" />}
    {shouldDisplayItalyRatingLogo && (
      <ItalyContentRatingLogo
        id="italy-rating-logo"
        iconIds={{
          peg: "pegi-icon",
          fear: "fear-icon",
          violence: "violence-icon",
          purchases: "purchases-icon",
        }}
        onClick={onItalyContentRatingLogoClick}
      />
    )}
  </div>
);

export default CountryRatingLogos;
