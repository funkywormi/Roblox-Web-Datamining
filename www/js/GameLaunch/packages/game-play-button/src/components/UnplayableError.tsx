import type { Ref } from "react";
import { TranslateFunction, withTranslations } from "@rbx/core-scripts/legacy/react-utilities";
import { translations } from "../constants/translations";
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
  translate,
  playabilityStatus,
  errorClassName = "error-message",
  containerRef,
}: TErrorProps & {
  translate: TranslateFunction;
}): React.JSX.Element => {
  const text = Object.hasOwn(playButtonErrorStatusTranslationMap, playabilityStatus)
    ? translate(playButtonErrorStatusTranslationMap[playabilityStatus])
    : translate(playButtonErrorStatusTranslationMap[PlayabilityStatus.UnplayableOtherReason]);

  return (
    <span data-testid="play-error" className={errorClassName} ref={containerRef}>
      {text}
    </span>
  );
};

export default withTranslations<TErrorProps>(Error, translations);
