// Shared between the Angular configureGroup service/controller and the React
// configureGroupMembers tab so the left-nav badge and the React tab label stay
// in sync. Imported from Angular .js via relative path; see
// js/angular/groupDetails/controllers/groupController.js for prior art.

export const JOIN_REQUESTS_CHANGED_EVENT = 'groups:joinRequestsChanged';

export const JOIN_REQUEST_COUNT_PAGE_SIZE = 50;

export const JOIN_REQUEST_COUNT_OVERFLOW_LABEL = `${JOIN_REQUEST_COUNT_PAGE_SIZE}+`;

export const formatJoinRequestCountText = (count: number, hasMore: boolean): string =>
  hasMore && count >= JOIN_REQUEST_COUNT_PAGE_SIZE
    ? JOIN_REQUEST_COUNT_OVERFLOW_LABEL
    : String(count);
