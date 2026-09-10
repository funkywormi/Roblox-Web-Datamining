import classNames from "classnames";
import React, { useEffect, useRef } from "react";
import { Icon } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { useDialog } from "../../hooks/useDialog";
import { useChatKeystrokeTelemetry } from "../../hooks/useChatKeystrokeTelemetry";
import { useChatUiPolicies } from "../../hooks/useChatUiPolicies";
import { useConversationOverlay } from "../../hooks/useConversationOverlay";
import { useConsentModal } from "../../hooks/useConsentModal";
import { useOsaInlineCard } from "../../hooks/useOsaInlineCard";
import { resolveConsentVariant } from "../../utils/consent";
import {
  getConversationIdForAnalytics,
  sendWebChatConversationRendered,
} from "../../utils/chatAnalytics";
import type { TChatConversation, TDialogScreen } from "../../types/chat";
import ChatDetails from "../ChatDetails/ChatDetails";
import ChatTimeoutTimer from "../ChatTimeoutTimer";
import AbuseReportConfirmation from "./AbuseReportConfirmation";
import ConsentModal from "./ConsentModal/ConsentModal";
import ContactCard from "./ContactCard/ContactCard";
import DialogHeader from "./DialogHeader";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import OsaInlineCard from "./OsaInlineCard/OsaInlineCard";

type TChatDialogProps = {
  conversation: TChatConversation;
  onClose: (layoutId: string) => void;
  onLeaveGroupConversation: (layoutId: string) => void;
  onToggleCollapsed: (layoutId: string) => void;
  onRenameConversation: (layoutId: string, title: string) => void;
  onAddFriends: (conversationId: string, userIds: number[]) => void;
  onRemoveParticipant: (conversationId: string, userId: number) => void;
  onSetScreen: (layoutId: string, screen: TDialogScreen) => void;
  /** Routes the dialog to the in-app abuse-report confirmation screen for a participant. */
  onReportParticipant: (layoutId: string, participantId: number) => void;
  onPromoteFriendPlaceholder?: (layoutId: string, newConversationId: string) => void;
  onRemoveTrustedConnection: (friendId: number) => void;
  /** Opens the current Party Chat feature restriction when the disabled input bar is clicked. */
  onOpenPartyChatRestriction: () => void;
  /** Clears the blocking consent flags after the user accepts the group-OSA / U13 modal. */
  onConsentResolved: (layoutId: string) => void;
  /** True once the chat settings metadata (and thus the event sampling decision) has resolved. */
  isMetadataLoaded: boolean;
  /** True while the realtime connection is lost — disables the message input in place (legacy parity). */
  isConnectionLost: boolean;
};

const fallbackScreenTranslationKeys: Record<
  Exclude<TDialogScreen, "Default" | "Details" | "ContactCard" | "AbuseReportConfirmation">,
  string
> = {
  Pending: "Label.Pending",
};

const ChatDialog = ({
  conversation,
  onClose,
  onLeaveGroupConversation,
  onToggleCollapsed,
  onRenameConversation,
  onAddFriends,
  onRemoveParticipant,
  onSetScreen,
  onReportParticipant,
  onPromoteFriendPlaceholder,
  onRemoveTrustedConnection,
  onOpenPartyChatRestriction,
  onConsentResolved,
  isMetadataLoaded,
  isConnectionLost,
}: TChatDialogProps) => {
  const { translate } = useTranslation();
  const {
    messages,
    draftMessage,
    setDraftMessage,
    sendMessage,
    resendMessage,
    fetchNextPage,
    hasNextPage,
    isMessagesLoading,
  } = useDialog(conversation, {
    onPromoteFriendPlaceholder: newConversationId => {
      onPromoteFriendPlaceholder?.(conversation.layoutId, newConversationId);
    },
  });
  const {
    isWebChatTcEnabled,
    expandedChatEnabled,
    useOneToOneOsaContextCards,
    isWebChatAutotranslationEnabled,
  } = useChatUiPolicies();
  const recordKeystroke = useChatKeystrokeTelemetry();
  const { dismiss: dismissContactCard, recordSeen: recordContactCardSeen } = useConversationOverlay(
    conversation,
    isWebChatTcEnabled,
    onSetScreen,
  );

  // Blocking consent (group-OSA / U13 opt-in) is derived from the conversation's status flags — the
  // dialog is blocked as long as it is unacknowledged.
  const consentVariant = resolveConsentVariant(conversation, expandedChatEnabled);
  const {
    accept: acceptConsent,
    decline: declineConsent,
    dismiss: dismissConsent,
  } = useConsentModal(conversation, {
    variant: consentVariant,
    expandedChatEnabled,
    isVisible: conversation.isOpen && !conversation.isMinimized,
    onResolved: onConsentResolved,
    onClose,
  });

  // webChatConversationRendered — emitted once per open. Gated on isMetadataLoaded (the event
  // sampling decision is fixed from that same metadata) so a dialog mounted before settings resolve
  // — a restored/persisted or deep-link open, since conversations and metadata load in parallel —
  // does NOT latch the one-shot ref and silently drop the event; the effect re-runs and fires once
  // metadata is in. ChatDialog is keyed by conversation id, so a close+reopen remounts and re-emits.
  const conversationRenderedSentRef = useRef(false);
  useEffect(() => {
    if (!isMetadataLoaded || conversationRenderedSentRef.current) {
      return;
    }
    conversationRenderedSentRef.current = true;
    sendWebChatConversationRendered({
      conversationId: getConversationIdForAnalytics(conversation),
      isDialogOpen: conversation.isOpen && !conversation.isMinimized,
      conversationSource: conversation.source,
      moderationType: conversation.moderationType,
      userPendingStatus: conversation.isUserPending ? "Pending" : undefined,
    });
  }, [conversation, isMetadataLoaded]);

  // Collapse only applies on the Default screen; a pending consent modal takes over the panel and
  // needs the full height regardless.
  const isCollapsedInPlace =
    conversation.isCollapsed === true &&
    conversation.currentScreen === "Default" &&
    consentVariant == null;

  // Non-blocking 1:1 OSA inline context card. Only records "seen" while the card is actually
  // visible: open, not minimized, not collapsed, and the blocking consent modal isn't taking over.
  const isDialogVisible = conversation.isOpen && !conversation.isMinimized && !isCollapsedInPlace;
  const { showOsaInlineCard } = useOsaInlineCard(
    conversation,
    useOneToOneOsaContextCards && consentVariant == null && isDialogVisible,
    hasNextPage,
    isMessagesLoading,
  );

  if (!conversation.isOpen || conversation.isMinimized) {
    return null;
  }

  // A pending consent decision blocks the conversation entirely — render only the modal (a
  // full-screen overlay), not the dialog shell, matching the legacy conversation-invite dialog.
  if (consentVariant != null) {
    return (
      <ConsentModal
        conversation={conversation}
        expandedChatEnabled={expandedChatEnabled}
        onAccept={acceptConsent}
        onDecline={declineConsent}
        onClose={dismissConsent}
      />
    );
  }

  return (
    <section
      className={classNames(
        "react-chat-dialog-shell react-chat-top-radius flex width-[260px] pointer-events-auto flex-col overflow-hidden bg-surface-100 stroke-standard stroke-muted shadow-transient-high clip content-default",
        {
          "height-[360px]": !isCollapsedInPlace,
          "stroke-emphasis": conversation.isFocused,
        },
      )}
      aria-label={conversation.title}
    >
      {conversation.currentScreen === "Default" ? (
        <React.Fragment>
          <DialogHeader
            conversation={conversation}
            onClose={onClose}
            onToggleCollapsed={onToggleCollapsed}
            onOpenDetails={layoutId => {
              onSetScreen(layoutId, "Details");
            }}
          />
          {!isCollapsedInPlace && (
            <React.Fragment>
              <MessageList
                conversation={conversation}
                messages={messages}
                hasNextPage={hasNextPage}
                onLoadMore={fetchNextPage}
                onResend={resendMessage}
                isAutotranslationEnabled={isWebChatAutotranslationEnabled}
                shouldScrollFromTop={
                  useOneToOneOsaContextCards &&
                  conversation.isOneToOneOsaServerUnacknowledged === true
                }
                topContent={
                  showOsaInlineCard ? <OsaInlineCard conversation={conversation} /> : undefined
                }
              />
              {conversation.isConversationUnavailableWithUser ? (
                <div className="flex items-center justify-between gap-small bg-surface-200 padding-medium">
                  <span className="text-body-small content-muted">
                    {translate("Message.ChatUnavailableWithUser")}
                  </span>
                  <span className="icon icon-filled-circle-i size-400 content-system-alert" />
                </div>
              ) : conversation.isTimedOut ? (
                <button
                  type="button"
                  className="react-chat-timed-out flex items-center justify-between gap-small bg-surface-200 padding-medium cursor-pointer"
                  onClick={() => {
                    onOpenPartyChatRestriction();
                  }}
                  aria-label={translate("Label.ChatDisabled")}
                >
                  <span className="text-body-small content-muted">
                    {translate("Label.ChatDisabled")}
                  </span>
                  <span className="flex items-center gap-xsmall">
                    {conversation.timeoutExpiresAtMs != null && (
                      <ChatTimeoutTimer
                        expiresAtMs={conversation.timeoutExpiresAtMs}
                        className="text-body-small content-muted"
                      />
                    )}
                    <Icon name="icon-filled-clock" size="Small" className="content-system-alert" />
                  </span>
                </button>
              ) : (
                // Connection lost mirrors the legacy AngularJS chat (chatDialog.html
                // `ng-disabled="errorMaskEnable"`): the input stays rendered but disabled — greyed, with
                // the draft retained — rather than being replaced by a banner the legacy chat never showed
                // in-dialog. Unavailable / timed-out bars keep precedence over it, matching legacy.
                <MessageInput
                  value={draftMessage}
                  onChange={setDraftMessage}
                  onSend={sendMessage}
                  isDisabled={isConnectionLost}
                  onKeyEvent={recordKeystroke}
                  isFocused={conversation.isFocused}
                />
              )}
            </React.Fragment>
          )}
        </React.Fragment>
      ) : conversation.currentScreen === "Details" ? (
        <ChatDetails
          conversation={conversation}
          onClose={onClose}
          onLeaveGroupConversation={onLeaveGroupConversation}
          onRenameConversation={onRenameConversation}
          onAddFriends={onAddFriends}
          onRemoveParticipant={onRemoveParticipant}
          onSetScreen={onSetScreen}
          onReportParticipant={onReportParticipant}
        />
      ) : conversation.currentScreen === "AbuseReportConfirmation" ? (
        <AbuseReportConfirmation
          conversation={conversation}
          onClose={onClose}
          onSetScreen={onSetScreen}
        />
      ) : conversation.currentScreen === "ContactCard" ? (
        <ContactCard
          conversation={conversation}
          onClose={onClose}
          onDismiss={dismissContactCard}
          onSeen={recordContactCardSeen}
          onRemoveTrustedConnection={onRemoveTrustedConnection}
        />
      ) : (
        <div className="flex grow-1 items-center justify-center padding-large text-center">
          <span className="text-body-medium content-muted">
            {translate(fallbackScreenTranslationKeys[conversation.currentScreen])}
          </span>
        </div>
      )}
    </section>
  );
};

export default ChatDialog;
