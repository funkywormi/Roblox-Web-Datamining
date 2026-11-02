import { JSX, KeyboardEvent } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import pegi7 from "./images/pegi_7.png";
import fearIcon from "./images/fear_icon_it.png";
import violenceIcon from "./images/violence_icon_it.png";
import purchasesIcon from "./images/purchases_icon_it.png";

export type ItalyContentRatingLogoProps = {
  /** Click handler; hosts open the PEGI guide behind a leave-site confirmation. */
  onClick?: () => void;
  /** DOM ids, supplied by page-level marks that need the cypress selectors. */
  id?: string;
  iconIds?: { peg: string; fear: string; violence: string; purchases: string };
};

// Kept in sync with the pre-migration
// reactLanding.css mark (250px black card, four icons, white caption strip). The colors, sizes,
// and spacing are fixed by the legal mark, hence the literal-value arbitrary properties instead
// of theme tokens.
const ItalyContentRatingLogo = ({
  onClick,
  id,
  iconIds,
}: ItalyContentRatingLogoProps): JSX.Element => {
  const { translate } = useTranslation();
  // Only a mark with somewhere to go is a control; without a handler it stays presentational,
  // so it neither takes a tab stop nor announces an action that cannot happen.
  const interactiveProps = onClick
    ? {
        role: "button",
        tabIndex: 0,
        // The mark's visible text is a list of descriptors, so name the control by its title;
        // a slug here would be announced to screen readers in place of the translation.
        "aria-label": translate("Label.ItalyContentRatingLogoTitle"),
        onClick,
        onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            // A role="button" div does not get the browser's native Space activation, and
            // without this Space would scroll the page as well as opening the confirmation.
            event.preventDefault();
            onClick();
          }
        },
      }
    : {};
  return (
    <div
      {...interactiveProps}
      id={id}
      className="flex flex-col [width:250px] [height:96px] [margin:40px_auto] [background:rgb(0,0,0)] [text-align:center] [border-color:rgba(255,255,255,0.7)] [border-style:solid] [border-width:1px]"
    >
      <div className="flex flex-row justify-between [padding:4px]">
        <img id={iconIds?.peg} src={pegi7} alt="" className="[height:68px] [width:56px]" />
        <img id={iconIds?.fear} src={fearIcon} alt="" className="[height:56px] [width:56px]" />
        <img
          id={iconIds?.violence}
          src={violenceIcon}
          alt=""
          className="[height:56px] [width:56px]"
        />
        <img
          id={iconIds?.purchases}
          src={purchasesIcon}
          alt=""
          className="[height:56px] [width:56px]"
        />
      </div>
      <div className="[border-top:1px_rgb(255,255,255)_solid] [color:rgb(255,255,255)] [font-size:10px] [line-height:20px] [text-transform:capitalize]">
        {translate("Label.ItalyContentRatingLogoTitle")}
      </div>
    </div>
  );
};

export default ItalyContentRatingLogo;
