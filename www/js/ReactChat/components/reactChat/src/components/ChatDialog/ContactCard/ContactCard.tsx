import { useEffect } from "react";
import classNames from "classnames";
import { useQuery } from "@tanstack/react-query";
import { Button, IconButton } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { chatQueryKeys } from "../../../constants/queryKeys";
import { getProfileInsights } from "../../../services/profileInsightsService";
import { getCountryRegions } from "../../../services/localeService";
import { processProfileInsights } from "../../../utils/profileInsights";
import type { TChatConversation } from "../../../types/chat";
import AvatarHeadshot from "../../AvatarHeadshot";

/** Records "seen" this many ms after the contact card becomes visible (matches legacy chat). */
const SEEN_RECORD_DELAY_MS = 3_000;

type TContactCardProps = {
  conversation: TChatConversation;
  onClose: (layoutId: string) => void;
  /** Dismiss the FTUX (records the dismissed action + returns to the default screen). */
  onDismiss: () => void;
  /** Records the "seen" action once the card has been visible for the delay window. */
  onSeen: () => void;
  onRemoveTrustedConnection: (friendId: number) => void;
};

const ContactCard = ({
  conversation,
  onClose,
  onDismiss,
  onSeen,
  onRemoveTrustedConnection,
}: TContactCardProps) => {
  const { translate } = useTranslation();
  const friend = conversation.participants[0];

  // The card is only mounted while it is the visible screen (ChatDialog renders it conditionally
  // and returns null when the dialog is minimized), so a mount timer means "visible for N seconds".
  useEffect(() => {
    const timer = setTimeout(onSeen, SEEN_RECORD_DELAY_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [onSeen]);

  const insightsQuery = useQuery({
    queryKey: chatQueryKeys.profileInsights(friend?.id ?? 0),
    queryFn: () => getProfileInsights(friend?.id ?? 0),
    enabled: Boolean(friend),
    staleTime: Infinity,
  });

  const countryRegionsQuery = useQuery({
    queryKey: chatQueryKeys.countryRegions(),
    queryFn: getCountryRegions,
    staleTime: Infinity,
  });

  const { entries, ageCheckInsightText } = processProfileInsights(insightsQuery.data, {
    translate,
    countryRegions: countryRegionsQuery.data ?? {},
    nowMs: Date.now(),
  });

  const friendSecondaryLine = friend
    ? `@${friend.username}${ageCheckInsightText ? ` • ${ageCheckInsightText}` : ""}`
    : "";

  return (
    <div className="flex min-height-0 grow-1 flex-col">
      <div className="react-chat-top-radius flex width-full shrink-0 items-center gap-small bg-surface-100 padding-x-small padding-y-small">
        <IconButton
          ariaLabel={translate("Action.Back")}
          icon="icon-regular-chevron-large-left"
          size="Small"
          variant="Utility"
          isCircular
          onClick={onDismiss}
        />
        <span className="min-width-none grow-1 text-title-medium content-emphasis text-truncate-end">
          {translate("TrustedFriend.Info.Modal.Header")}
        </span>
        <IconButton
          ariaLabel={translate("Action.Close")}
          icon="icon-regular-x"
          size="Small"
          variant="Utility"
          isCircular
          onClick={() => {
            onClose(conversation.layoutId);
          }}
        />
      </div>
      <div className="react-chat-details-scroll flex min-height-0 grow-1 flex-col gap-medium scroll-y padding-medium">
        <span className="text-body-small content-default">
          {translate("TrustedFriend.Info.Modal.Description")}
        </span>

        {friend && (
          <div className="flex items-center gap-small">
            <a href={friend.profileUrl} className="shrink-0" aria-hidden="true">
              <AvatarHeadshot
                userId={friend.id}
                displayName={friend.displayName}
                containerClassName="size-1000 radius-circle bg-shift-300 clip"
              />
            </a>
            <div className="min-width-none grow-1">
              <div className="text-body-medium content-emphasis text-truncate-end">
                {friend.displayName}
              </div>
              <div className="text-caption-medium content-muted text-truncate-end">
                {friendSecondaryLine}
              </div>
            </div>
          </div>
        )}

        {entries.length > 0 && (
          <ul className="flex flex-col gap-xsmall">
            {entries.map(entry => (
              <li key={`${entry.iconClass}-${entry.text}`} className="flex items-center gap-small">
                <span
                  className={classNames("icon size-400 shrink-0 content-muted", entry.iconClass)}
                />
                <span className="text-caption-medium content-default">{entry.text}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-small padding-top-small">
          <Button variant="Emphasis" size="Medium" onClick={onDismiss}>
            {translate("Button.GotIt")}
          </Button>
          <Button
            variant="Standard"
            size="Medium"
            onClick={() => {
              if (friend) {
                // Match legacy chat: dismiss the card (records dismissed + back to default) first,
                // then sever the trusted connection.
                onDismiss();
                onRemoveTrustedConnection(friend.id);
              }
            }}
          >
            {translate("TrustedFriend.Action.RemoveTrustedFriend")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContactCard;
