import React, { useEffect, useRef, useState } from "react";
import { Button, Icon, ProgressCircle } from "@rbx/foundation-ui";
import "../../../../../css/challenge/rostile/rostile.css";
import { Solution } from "../../../../common/request/types/rostile";
import sleep from "../../../../common/sleep";
import { checkAnswerDelay } from "../constants/challengeConfig";
import { AnswerState } from "../constants/types";
import useMousePositionHistory from "../hooks/useMousePositionHistory";
import useRostileContext from "../hooks/useRostileContext";
import { RostileActionType } from "../store/action";

/**
 * A component that provides the UI and signal collection for
 * a visible Rostile puzzle.
 */
const VisiblePuzzle: React.FC<{
  answerState: AnswerState;
  checkAnswer: (solution: Solution) => Promise<void>;
}> = ({ answerState, checkAnswer }) => {
  const {
    state: { isModalVisible, renderInline, resources },
    dispatch,
  } = useRostileContext();

  /*
   * Challenge State
   */

  const [waitingToCheckAnswer, setWaitingToCheckAnswer] = useState(false);

  /*
   * Refs
   */

  const verifyButtonBoundingRef = useRef<HTMLSpanElement>(null);

  /*
   * User Behavior Signal State
   */

  const [initialRenderTime, setInitialRenderTime] = useState<number | null>(null);
  const [mouseDownTimestamp, setMouseDownTimestamp] = useState<number | null>(null);
  const mouseMovements = useMousePositionHistory();

  /*
   * Event Handlers
   */

  const closeModal = () => {
    dispatch({
      type: RostileActionType.HIDE_MODAL_CHALLENGE,
    });
  };

  const isMobile = () => {
    const match = window.matchMedia;
    if (match) {
      const matchPointer = match("(pointer:coarse)");
      return matchPointer.matches;
    }
    return false;
  };

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    const curTime = performance.now();
    const screenSize = { width: window.screen.width, height: window.screen.height };
    const windowSize = { width: window.innerWidth, height: window.innerHeight };
    if (!verifyButtonBoundingRef.current) return;
    const buttonBoundingBox = verifyButtonBoundingRef.current.getBoundingClientRect();
    const buttonLocation = {
      x: buttonBoundingBox.x,
      y: buttonBoundingBox.y,
      width: buttonBoundingBox.width,
      height: buttonBoundingBox.height,
    };

    if (initialRenderTime != null && mouseDownTimestamp != null) {
      setWaitingToCheckAnswer(true);
      await sleep(checkAnswerDelay);
      checkAnswer({
        buttonClicked: true,
        click: {
          x: e.clientX,
          y: e.clientY,
          timestamp: e.timeStamp,
          duration: e.timeStamp - mouseDownTimestamp,
        },
        completionTime: curTime - initialRenderTime,
        mouseMovements: mouseMovements.current,
        screenSize,
        buttonLocation,
        windowSize,
        isMobile: isMobile(),
      }).then(
        () => setWaitingToCheckAnswer(false),
        () => setWaitingToCheckAnswer(false),
      );
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setMouseDownTimestamp(e.timeStamp);
  };

  /*
   * Effects
   */

  // Set initial render time.
  useEffect(() => {
    if (isModalVisible) {
      setInitialRenderTime(performance.now());
    }
  }, [isModalVisible]);

  /*
   * Rendering Helpers
   */

  const getContent = () => {
    if (waitingToCheckAnswer) {
      // For additional collection of data before submitting answer.
      return (
        <ProgressCircle
          variant="Indeterminate"
          size="Small"
          ariaLabel={resources.Description.VerificationHeader}
        />
      );
    }
    switch (answerState) {
      case AnswerState.INITIAL:
        return (
          <React.Fragment>
            <span>{resources.Description.VerificationPrompt}</span>
            <br />
            <span ref={verifyButtonBoundingRef}>
              <Button
                variant="Emphasis"
                size="Medium"
                className="rostile-verify-button !bg-[var(--color-content-emphasis)] !content-[var(--color-surface-0)]"
                onClick={onClick}
                onMouseDown={onMouseDown}
              >
                {resources.Description.ImAHuman}
              </Button>
            </span>
          </React.Fragment>
        );
      case AnswerState.COMPLETED_UNRESOLVED:
        return (
          <ProgressCircle
            variant="Indeterminate"
            size="Small"
            ariaLabel={resources.Description.VerificationHeader}
          />
        );
      case AnswerState.COMPLETED_SUCCESS:
        return (
          <React.Fragment>
            <Icon name="icon-filled-circle-check" size="XLarge" />
            <br />
            <span>{resources.Description.VerificationSuccess}</span>
          </React.Fragment>
        );
      case AnswerState.COMPLETED_ERROR:
        return (
          <React.Fragment>
            <span>{resources.Description.VerificationError}</span>
            <br />
            {!renderInline && (
              <Button
                variant="Emphasis"
                size="Medium"
                className="rostile-verify-button !bg-[var(--color-content-emphasis)] !content-[var(--color-surface-0)]"
                onClick={closeModal}
              >
                {resources.Description.Ok}
              </Button>
            )}
          </React.Fragment>
        );
      default:
        return null;
    }
  };

  return <div className="rostile-visible-puzzle">{getContent()}</div>;
};
export default VisiblePuzzle;
