import { useState } from "react";
import type { RecommendedRule } from "../../types/api";
import TipIcon from "./TipIcon";

interface TipCardProps {
  tip: RecommendedRule;
  onPress: () => void;
}

/**
 * A single community tip card that displays the tip graphic, title, and subtitle.
 */
const TipCard = ({ tip, onPress }: TipCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      data-testid="tip-card"
      className="flex flex-col gap-small shrink-0 width-[280px] bg-none stroke-none padding-none"
      onClick={onPress}
      /**
       * Since we dont have the group utility from Tailwind, we'll use onMouseEnter and onMouseLeave to handle hover states on the entire
       * button so that the grey image card is highlighted when the user hovers over any part of the tip information (e.g. the title or subtitle).
       */
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      <div
        className={`${isHovered ? "bg-shift-300" : "bg-shift-200"} radius-medium width-full height-[160px] flex items-center justify-center transition-colors duration-200`}
      >
        <TipIcon imageName={tip.imageName} />
      </div>

      <div className="flex flex-col items-start width-full text-align-x-left">
        <h6 className="text-title-medium margin-none">{tip.ruleTitle}</h6>
        <p className="text-body-medium">{tip.ruleSubtitle}</p>
      </div>
    </button>
  );
};

export default TipCard;
