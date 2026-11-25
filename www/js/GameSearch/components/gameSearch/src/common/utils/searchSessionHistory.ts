import { createHistorySessionStore } from "@rbx/discovery-common/session";

const gameSearchSessionHistory = createHistorySessionStore("robloxSearchSessions");

export const readSearchSessions = gameSearchSessionHistory.read;
export const saveSearchSessions = gameSearchSessionHistory.save;

// Tab switches carry only the search snapshot into their new history entry.
export const getSearchSessionHistoryState = gameSearchSessionHistory.getHistoryState;
