import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  IconButton,
  List,
  ListItem,
  TDialogSize,
  Tooltip,
  TooltipTrigger,
} from "@rbx/foundation-ui";
import { DEFAULT_NUM_SESSIONS_TO_DISPLAY } from "../app.config";
import { getFullPageOfSessions } from "../commonHelpers";
import ModalLogOutConfirmation from "../components/modal/logOutConfirmation";
import ModalLogOutOfAllSessions from "../components/modal/logOutOfAllSessions";
import ModalLogOutOfUnknownSessions from "../components/modal/logOutOfUnknownSessions";
import ModalSecurityDelays from "../components/modal/securityDelays";
import ModalSessionInfo from "../components/modal/sessionInfo";
import SessionRow from "../components/sessionRow";
import UnknownRow from "../components/unknownRow";
import { ModalFragmentProps, TokenMetadataItemCollated } from "../constants/types";
import useSessionManagementContext from "../hooks/useSessionManagementContext";
import { SessionManagementActionType } from "../store/action";
import ModalState from "../store/modalState";

type ModalSchema = {
  innerFragment: React.FC<ModalFragmentProps>;
  size: TDialogSize;
  hasCloseAffordance: boolean;
};

const getModalSchema = (modalState: ModalState): ModalSchema | null => {
  switch (modalState) {
    case ModalState.SESSION_INFO:
      return {
        innerFragment: ModalSessionInfo,
        size: "Large",
        hasCloseAffordance: true,
      };
    case ModalState.LOG_OUT_CONFIRMATION:
      return {
        innerFragment: ModalLogOutConfirmation,
        size: "Large",
        hasCloseAffordance: false,
      };
    case ModalState.LOG_OUT_OF_ALL_SESSIONS:
      return {
        innerFragment: ModalLogOutOfAllSessions,
        size: "Large",
        hasCloseAffordance: false,
      };
    case ModalState.LOG_OUT_OF_UNKNOWN_SESSIONS:
      return {
        innerFragment: ModalLogOutOfUnknownSessions,
        size: "Large",
        hasCloseAffordance: false,
      };
    case ModalState.SECURITY_DELAYS:
      return {
        innerFragment: ModalSecurityDelays,
        size: "Large",
        hasCloseAffordance: true,
      };
    default:
      return null;
  }
};

const SessionManagementContainer: React.FC = () => {
  const {
    state: {
      resources,
      requestService,
      sessions,
      unknownSessions,
      hasMore,
      nextCursor,
      numSessionsToDisplay,
      userHasConsoleSession,
      modalState,
    },
    dispatch,
  } = useSessionManagementContext();

  /*
   * Component State
   */

  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);
  const [scrolledIntoView, setScrolledIntoView] = useState<boolean>(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const containerRef = useRef<HTMLUListElement>(null);

  /*
   * Event Handlers
   */

  const closeModal = () => {
    dispatch({
      type: SessionManagementActionType.SET_MODAL_STATE,
      modalState: ModalState.NONE,
      session: null,
    });
  };

  const handleShowMore = async () => {
    let newNextCursor = nextCursor;
    let newHasMore = hasMore;
    let newSessions: TokenMetadataItemCollated[] | null = null;
    const amountToShowMore = DEFAULT_NUM_SESSIONS_TO_DISPLAY;
    if (hasMore && sessions.length < numSessionsToDisplay + amountToShowMore) {
      setRequestInFlight(true);
      const getSessionsResult = await getFullPageOfSessions(requestService, nextCursor);

      if (getSessionsResult.isError) {
        setRequestInFlight(false);
        setRequestError(`${resources.Message.Error.Default} ${resources.Action.PleaseTryAgain}`);
        return;
      }
      newSessions = getSessionsResult.sessions;
      newNextCursor = getSessionsResult.nextCursor;
      newHasMore = getSessionsResult.hasMore;
    }
    setRequestInFlight(false);
    setRequestError(null);
    dispatch({
      type: SessionManagementActionType.SHOW_MORE,
      sessionsToAdd: newSessions,
      nextCursor: newNextCursor,
      hasMore: newHasMore,
      amountToShowMore,
    });
  };

  const showLogOutOfAllSessionsModal = () => {
    dispatch({
      type: SessionManagementActionType.SET_MODAL_STATE,
      modalState: ModalState.LOG_OUT_OF_ALL_SESSIONS,
      session: null,
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      // eslint-disable-next-line no-void
      void handleShowMore();
    }
  };

  /**
   * Component-level effects.
   */

  useEffect(() => {
    const { current } = containerRef;

    if (
      current === null ||
      scrolledIntoView ||
      !window.location.search.includes("scroll-to-session-management")
    ) {
      return;
    }

    setScrolledIntoView(true);
    // HACK:
    // Wait for everything to render. This is a hack to avoid sibling components not using
    // placeholders and rendering speed affecting effects that depend on position. At some point
    // when we redesign settings we should have placeholder elements to avoid screen jitter.
    setTimeout(() => current.scrollIntoView({ behavior: "smooth", block: "start" }), 1750);
  }, [scrolledIntoView]);

  /*
   * Component Markup
   */

  const sessionsToDisplay = sessions.slice(0, numSessionsToDisplay);
  const sessionsToDisplayElements = sessionsToDisplay.map((session, index) => (
    <SessionRow
      key={session.token}
      session={session}
      isLastSessionToDisplay={
        index === sessions.length - 1 && !hasMore && unknownSessions.length === 0
      }
    />
  ));

  const showShowMoreButton = sessions.length > sessionsToDisplay.length || hasMore;
  if (unknownSessions.length > 0) {
    sessionsToDisplayElements.push(<UnknownRow isLastSessionToDisplay={!showShowMoreButton} />);
  }

  const modalSchema = getModalSchema(modalState);

  return (
    <List className="flex flex-col padding-large" ref={containerRef}>
      <ListItem
        title={resources.Header.DevicesWhereYouAreLoggedIn}
        description={resources.Description.ConfidenceTrusted}
        trailing={
          <Tooltip
            position="top-start"
            title={resources.Label.TooltipTitle}
            description={resources.Label.ApproximateLocationAndTimestamp}
            open={tooltipOpen}
            onOpenChange={setTooltipOpen}
          >
            <TooltipTrigger asChild>
              <IconButton
                icon="icon-regular-circle-question"
                size="Small"
                variant="Utility"
                ariaLabel={resources.Label.ApproximateLocationAndTimestamp}
                isCircular
                onClick={() => setTooltipOpen(prev => !prev)}
              />
            </TooltipTrigger>
          </Tooltip>
        }
        isContained
        divider="Full"
        className="padding-y-large"
      />
      {sessions.length === 0 ? (
        // Page still loading:
        <span className="spinner spinner-default spinner-no-margin modal-margin-bottom-large" />
      ) : (
        <React.Fragment>
          {sessionsToDisplayElements}
          {showShowMoreButton &&
            (requestInFlight ? (
              <span className="spinner spinner-xs spinner-no-margin" />
            ) : (
              <div>
                <div
                  className="show-more text-new-line modal-margin-bottom"
                  role="button"
                  onClick={handleShowMore}
                  onKeyDown={handleKeyDown}
                  tabIndex={0}
                >
                  {resources.Action.ShowMore}
                </div>
                <p className="text-error xsmall">{requestError}</p>
                {requestError && <div className="text-new-line" />}
              </div>
            ))}
          <Button
            className="margin-y-medium"
            onClick={showLogOutOfAllSessionsModal}
            size="Large"
            variant="Standard"
            isDisabled={requestInFlight}
          >
            {resources.Action.LogOutAllSessions}
          </Button>
        </React.Fragment>
      )}
      {modalSchema && (
        <Dialog
          open
          onOpenChange={isOpen => {
            if (!isOpen) closeModal();
          }}
          size={modalSchema.size}
          isModal
          {...(modalSchema.hasCloseAffordance
            ? { hasCloseAffordance: true, closeLabel: resources.Action.Cancel }
            : { hasCloseAffordance: false as const })}
        >
          <DialogContent className="width-full">
            <DialogBody>
              <modalSchema.innerFragment closeModal={closeModal} />
            </DialogBody>
          </DialogContent>
        </Dialog>
      )}
    </List>
  );
};

export default SessionManagementContainer;
