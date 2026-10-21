import type { Ref } from "react";
import { usePlayButtonTranslate } from "../hooks/usePlayButtonTranslate";
import playButtonConstants from "../constants/playButtonConstants";
import { PlayabilityStatus } from "../constants/playabilityStatus";
import { TPlayabilityStatusWithUnplayableError } from "../types/playButtonTypes";

const { playButtonErrorStatusTranslationMap } = playButtonConstants;

export type TErrorProps = {
  playabilityStatus: TPlayabilityStatusWithUnplayableError;
  errorClassName?: string;
  containerRef?: Ref<HTMLSpanElement>;
};

/**
 * @deprecated Use ContextualMessage.tsx instead
 */
export const Error = ({
  playabilityStatus,
  errorClassName = "error-message",
  containerRef,
}: TErrorProps): React.JSX.Element => {
  const translate = usePlayButtonTranslate();
  const text = Object.hasOwn(playButtonErrorStatusTranslationMap, playabilityStatus)
    ? translate(playButtonErrorStatusTranslationMap[playabilityStatus])
    : translate(playButtonErrorStatusTranslationMap[PlayabilityStatus.UnplayableOtherReason]);

  return (
    <span data-testid="play-error" className={errorClassName} ref={containerRef}>
      {text}
    </span>
  );
};

export default Error;
