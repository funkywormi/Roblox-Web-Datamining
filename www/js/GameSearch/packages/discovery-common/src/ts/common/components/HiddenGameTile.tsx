import React, { Ref, useState, useCallback } from "react";
import { sendEvent } from "@rbx/core-scripts/event-stream";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { Button } from "@rbx/foundation-ui";
import { PageContext } from "../types/pageContext";
import { FeatureGameDetails } from "../constants/translationConstants";
import { userSignal } from "../constants/configConstants";
import eventStreamConstants, {
  EventStreamMetadata,
  TNotInterestedFeedbackFormAction,
  NotInterestedFeedbackFormActionType,
} from "../constants/eventStreamConstants";
import { getSessionInfoTypeFromPageContext } from "../utils/parsingUtils";
import { usePageSession } from "../utils/PageSessionContext";
import useSendNotInterestedUserSignalCallback from "./useSendNotInterestedUserSignalCallback";
import useSendNotInterestedFeedbackUserSignalCallback from "./useSendNotInterestedFeedbackUserSignalCallback";
import NotInterestedFeedbackForm from "./NotInterestedFeedbackForm";

export type THiddenGameTileProps = {
  setIsHidden?: (isHidden: boolean) => void;
  toggleIsHidden?: () => void;
  universeId: number;
  topicId?: string;
  isSponsored?: boolean;
  page?: PageContext;
  translate: TranslateFunction;
};

const HiddenGameTile = React.forwardRef(
  (
    {
      setIsHidden,
      toggleIsHidden,
      universeId,
      topicId,
      isSponsored,
      page,
      translate,
    }: THiddenGameTileProps,
    ref: Ref<HTMLDivElement>,
  ): JSX.Element => {
    const pageSession = usePageSession();

    const sendNotInterestedFeedbackFormAction = useCallback(
      (actionType: NotInterestedFeedbackFormActionType) => {
        const sessionInfoType = getSessionInfoTypeFromPageContext(page);

        const params: TNotInterestedFeedbackFormAction = {
          [EventStreamMetadata.UniverseId]: universeId.toString(),
          [EventStreamMetadata.SortId]: topicId,
          [EventStreamMetadata.ActionType]: actionType,
          ...(sessionInfoType && { [sessionInfoType]: pageSession }),
        };

        const eventParams = eventStreamConstants.notInterestedFeedbackFormAction(params, page);
        sendEvent(...eventParams);
      },
      [universeId, topicId, page, pageSession],
    );

    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const openFeedbackForm = useCallback(() => {
      setShowFeedbackForm(true);
      sendNotInterestedFeedbackFormAction(
        NotInterestedFeedbackFormActionType.NotInterestedFeedbackFormOpened,
      );
    }, [sendNotInterestedFeedbackFormAction]);
    const closeFeedbackForm = useCallback(
      (isCloseFromSubmit?: boolean) => {
        setShowFeedbackForm(false);
        if (!isCloseFromSubmit) {
          sendNotInterestedFeedbackFormAction(
            NotInterestedFeedbackFormActionType.NotInterestedFeedbackFormClosedWithoutSubmit,
          );
        }
      },
      [sendNotInterestedFeedbackFormAction],
    );

    const [showGiveFeedbackButton, setShowGiveFeedbackButton] = useState(true);
    const toggleShowGiveFeedbackButton = useCallback(() => {
      setShowGiveFeedbackButton(prev => !prev);
    }, []);

    const sendNotInterestedUserSignal = useSendNotInterestedUserSignalCallback(
      universeId,
      translate,
      page,
      topicId,
      isSponsored,
      toggleIsHidden,
    );
    const sendNotInterestedFeedbackUserSignal = useSendNotInterestedFeedbackUserSignalCallback(
      universeId,
      translate,
      toggleShowGiveFeedbackButton,
      page,
      topicId,
      isSponsored,
    );

    const onUndoClick: () => void = useCallback(() => {
      if (setIsHidden) {
        setIsHidden(false);
      } else {
        window.EventTracker?.fireEvent(userSignal.HiddenStateUndoFailedDueToMissingSetter);
      }
      sendNotInterestedUserSignal(false);
    }, [setIsHidden, sendNotInterestedUserSignal]);

    return (
      <li className="hover-game-tile grid-tile hidden-tile">
        <div className="featured-game-container">
          <div className="featured-game-icon-container placeholder-thumbnail" ref={ref}>
            <div className="hidden-game-tile-contents" id={universeId.toString()}>
              <span className="text-body-medium">
                {translate(FeatureGameDetails.MessageSuggestLessOften)}
              </span>
              <div className="hidden-game-tile-buttons">
                <Button
                  className="width-full"
                  variant="Standard"
                  size="XSmall"
                  onClick={onUndoClick}
                >
                  {translate(FeatureGameDetails.ActionUndo)}
                </Button>
                {showGiveFeedbackButton && (
                  <Button
                    className="width-full"
                    variant="Standard"
                    size="XSmall"
                    onClick={openFeedbackForm}
                  >
                    {translate(FeatureGameDetails.ActionGiveFeedback)}
                  </Button>
                )}
              </div>
              <NotInterestedFeedbackForm
                open={showFeedbackForm}
                onClose={closeFeedbackForm}
                sendActionEvent={sendNotInterestedFeedbackFormAction}
                sendSignal={sendNotInterestedFeedbackUserSignal}
                setShowGiveFeedbackButton={setShowGiveFeedbackButton}
                translate={translate}
              />
            </div>
          </div>
        </div>
      </li>
    );
  },
);

HiddenGameTile.displayName = "HiddenGameTile";
export default HiddenGameTile;
