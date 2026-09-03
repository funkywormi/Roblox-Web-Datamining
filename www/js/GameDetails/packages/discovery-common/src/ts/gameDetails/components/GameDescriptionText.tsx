import { useRef } from "react";
import regex from "@rbx/core-scripts/util/regex";
import { TDiscoverySessionInfo } from "../../common/constants/eventStreamConstants";
import useGameDescriptionImpressionTracker from "../hooks/useGameDescriptionImpressionTracker";

type TGameDescriptionTextProps = {
  descriptionText: string | undefined;
  universeId: string;
  referralSessionInfo: TDiscoverySessionInfo;
};

const GameDescriptionText = ({
  descriptionText,
  universeId,
  referralSessionInfo,
}: TGameDescriptionTextProps): JSX.Element => {
  const descriptionRef = useRef<HTMLPreElement>(null);

  useGameDescriptionImpressionTracker(descriptionRef, {
    universeId,
    referralSessionInfo,
    descriptionText,
  });

  return (
    <pre className="text game-description" ref={descriptionRef}>
      {descriptionText?.split(regex.url).map((text, index) => {
        if (text.search(regex.url) > -1) {
          return (
            // eslint-disable-next-line react/no-array-index-key
            <a key={index} data-testid="game-description-link" className="text-link" href={text}>
              {text}
            </a>
          );
        }
        return text;
      })}
    </pre>
  );
};

export default GameDescriptionText;
