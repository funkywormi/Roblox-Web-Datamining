import { useRef } from "react";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@rbx/core-scripts/react";
import { uuidService } from "@rbx/core-scripts/legacy/core-utilities";
import {
  setShareUserIdPreference,
  updateUserTicket,
} from "../services/creatorCommunicationService";
import { getUserTicketDetailsQueryKey } from "./useUserTicketDetails";
import { userTicketSummariesQueryKey } from "./useUserTicketSummaries";
import {
  ListUserTicketSummariesResponse,
  ShareUserIdPreference,
  TicketActionError,
  UserTicket,
} from "../types";
import { updateTicketErrorCodes } from "../constants/errorCodes";
import {
  getHttpErrorCode,
  getHttpErrorStatus,
  shouldResetIdempotencyKey,
} from "../utils/httpError";

const useTicketActions = (ticket: UserTicket) => {
  const queryClient = useQueryClient();
  const { translate } = useTranslation();

  const { universeId, id: ticketId } = ticket.summary;

  // Each action keeps its own idempotency key so a retry of one action can't
  // collide with another. A key is reused while a request keeps failing
  // transiently (network/429/5xx) so retries stay idempotent, and cleared on
  // success or a non-retryable (4xx) rejection so the next attempt starts fresh.
  // The reply key is additionally tied to the message text (see submitResponse).
  const responseKeyRef = useRef<{ key: string; message: string } | null>(null);
  const shareUserIdKeyRef = useRef<string | null>(null);
  const doNotShareUserIdKeyRef = useRef<string | null>(null);

  const invalidateTicketDetailsQuery = async (): Promise<void> => {
    await queryClient.invalidateQueries({
      queryKey: getUserTicketDetailsQueryKey(universeId, ticketId),
    });
  };

  const updateTicketQueries = (ticket: UserTicket): void => {
    queryClient.setQueryData(getUserTicketDetailsQueryKey(universeId, ticketId), {
      userTicket: ticket,
    });

    queryClient.setQueryData<InfiniteData<ListUserTicketSummariesResponse>>(
      userTicketSummariesQueryKey,
      previousData => {
        if (!previousData) {
          return previousData;
        }

        return {
          ...previousData,
          pages: previousData.pages.map(page => ({
            ...page,
            userTicketSummaries: page.userTicketSummaries.map(summary =>
              summary.id === ticket.summary.id && summary.universeId === ticket.summary.universeId
                ? ticket.summary
                : summary,
            ),
          })),
        };
      },
    );
  };

  const submitResponse = async (message: string): Promise<void> => {
    // A new or edited message is a new logical request, so mint a fresh key;
    // otherwise the backend would coalesce the edit back to the original text.
    // Identical text (a React Query auto-retry or a plain resend) reuses the key
    // so the request stays idempotent against a write that may have landed.
    if (responseKeyRef.current?.message !== message) {
      responseKeyRef.current = { key: uuidService.generateRandomUuid(), message };
    }
    const idempotencyKey = responseKeyRef.current.key;

    try {
      const data = await updateUserTicket(universeId, ticketId, message, idempotencyKey);
      responseKeyRef.current = null;
      updateTicketQueries(data.userTicket);
    } catch (err) {
      if (shouldResetIdempotencyKey(err)) {
        responseKeyRef.current = null;
      }

      if (
        getHttpErrorStatus(err) === 400 &&
        getHttpErrorCode(err) === updateTicketErrorCodes.textModerated
      ) {
        throw new TicketActionError(translate("Error.MessageModerated"));
      }
      throw err;
    }
  };

  const acceptShareUserInfo = async () => {
    const idempotencyKey = shareUserIdKeyRef.current ?? uuidService.generateRandomUuid();
    shareUserIdKeyRef.current = idempotencyKey;

    try {
      await setShareUserIdPreference(
        universeId,
        ticketId,
        ShareUserIdPreference.Share,
        idempotencyKey,
      );
      shareUserIdKeyRef.current = null;
      await invalidateTicketDetailsQuery();
    } catch (err) {
      if (shouldResetIdempotencyKey(err)) {
        shareUserIdKeyRef.current = null;
      }
      throw err;
    }
  };

  const declineShareUserInfo = async () => {
    const idempotencyKey = doNotShareUserIdKeyRef.current ?? uuidService.generateRandomUuid();
    doNotShareUserIdKeyRef.current = idempotencyKey;

    try {
      await setShareUserIdPreference(
        universeId,
        ticketId,
        ShareUserIdPreference.DoNotShare,
        idempotencyKey,
      );
      doNotShareUserIdKeyRef.current = null;
      await invalidateTicketDetailsQuery();
    } catch (err) {
      if (shouldResetIdempotencyKey(err)) {
        doNotShareUserIdKeyRef.current = null;
      }
      throw err;
    }
  };

  return {
    submitResponse,
    acceptShareUserInfo,
    declineShareUserInfo,
  };
};

export default useTicketActions;
