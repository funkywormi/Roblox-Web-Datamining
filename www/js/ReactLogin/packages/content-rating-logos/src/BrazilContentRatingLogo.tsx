import { JSX } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import classind16 from "./images/classind_16.png";
import "@fontsource/roboto-condensed";

// Due to legal requirements, the rating logo must be displayed with the Roboto Condensed font
// Please reference details at https://docs.google.com/document/d/1VD0qFEtZiNExZnU7-S50BNKUe9GYJMB5vk4ajLWBxP4/edit?tab=t.0
// The page marks pass id="brazil-rating-logo", a cypress selector (loginCompliance.cy.ts). It is
// opt-in because the same mark also renders inside the birthday-compliance modal, which can be
// open over a page that already shows one.
// Kept in sync with the pre-migration reactLanding.css mark (282px black card, white content row,
// black footer). The colors, sizes, and spacing are fixed by the legal mark, hence the
// literal-value arbitrary properties instead of theme tokens.
export type BrazilContentRatingLogoProps = {
  /** DOM id, supplied by page-level marks that need the cypress selector. */
  id?: string;
};

export default function BrazilContentRatingLogo({
  id,
}: BrazilContentRatingLogoProps = {}): JSX.Element {
  const { translate } = useTranslation();
  return (
    <div className="flex justify-center">
      <div
        id={id}
        className="flex flex-col [width:282px] [padding:2px] [margin:40px_auto] [border-radius:8px] [background:rgb(0,0,0)] [text-align:left]"
      >
        <div className="flex justify-center [color:rgb(255,255,255)] [text-align:center] [padding:8px] [font-family:Roboto_Condensed,sans-serif] [font-size:12px] [font-weight:600] [text-transform:uppercase]">
          {translate("Label.BrazilContentRatingLogoTitleSixteen")}
        </div>
        <div className="flex items-center [background-color:rgb(255,255,255)] [padding:2px] [margin:2px] [gap:2px] [border-radius:8px]">
          <img src={classind16} alt="" className="shrink-0 [height:70px] [width:70px]" />
          <div className="flex flex-col justify-center grow [text-align:center] [color:rgb(0,0,0)] [font-family:Roboto_Condensed,sans-serif]">
            <span className="[font-size:12px] [line-height:16px] [font-weight:400]">
              {translate("Label.BrazilContentDescriptorViolence")}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center [background:rgb(0,0,0)] [color:rgb(255,255,255)] [padding:8px_12px] [text-align:center] [border-radius:0_0_6px_6px] [font-family:Roboto_Condensed,sans-serif]">
          <span className="[font-size:12px] [line-height:16px] [font-weight:400]">
            {translate("Label.BrazilInteractiveElementDescriptorUsersInteract")}
          </span>
          <span className="[font-size:12px] [line-height:16px] [font-weight:400]">
            {translate("Label.BrazilInteractiveElementDescriptorInGamePurchases")}
          </span>
        </div>
      </div>
    </div>
  );
}
