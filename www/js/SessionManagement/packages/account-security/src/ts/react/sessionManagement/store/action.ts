import { DelaySummaryGroup } from "../constants/delaySummary";
import { TokenMetadataItemCollated } from "../constants/types";
import ModalState from "./modalState";

export enum SessionManagementActionType {
  SET_SESSIONS,
  SHOW_MORE,
  SET_MODAL_STATE,
  REMOVE_SESSION,
  REMOVE_ALL_OTHER_SESSIONS,
  REMOVE_UNKNOWN_SESSIONS,
  SET_CONSOLE_SESSION_STATUS,
}

export type SessionManagementAction =
  | {
      type: SessionManagementActionType.SET_SESSIONS;
      sessions: TokenMetadataItemCollated[];
      unknownSessions: TokenMetadataItemCollated[];
      hasMore: boolean;
      nextCursor: string;
      delaySummaries: DelaySummaryGroup[];
    }
  | {
      type: SessionManagementActionType.SHOW_MORE;
      nextCursor: string;
      hasMore: boolean;
      sessionsToAdd: TokenMetadataItemCollated[] | null;
      amountToShowMore: number;
    }
  | {
      type: SessionManagementActionType.SET_MODAL_STATE;
      modalState: ModalState;
      session: TokenMetadataItemCollated | null;
    }
  | {
      type: SessionManagementActionType.REMOVE_SESSION;
      session: TokenMetadataItemCollated;
    }
  | {
      type: SessionManagementActionType.REMOVE_ALL_OTHER_SESSIONS;
    }
  | {
      type: SessionManagementActionType.REMOVE_UNKNOWN_SESSIONS;
      tokensToRemove: Set<string>;
    }
  | {
      type: SessionManagementActionType.SET_CONSOLE_SESSION_STATUS;
      userHasConsoleSession: boolean;
    };
