import { ForumPost, ForumComment } from '../types';
import { ForumsSearchResultType } from '../../shared/constants/eventConstants';

export enum ContentType {
  Any = 'Any',
  Post = 'Post',
  Comment = 'Comment'
}

export enum TimeRange {
  Day = 'day',
  Week = 'week',
  Month = 'month',
  All = 'all'
}

// Derived purely from URL state (see deriveMode): Browse = no text and no filters;
// FilteredBrowse = filters only; Search = a text query.
export enum ForumsMode {
  Browse = 'Browse',
  FilteredBrowse = 'FilteredBrowse',
  Search = 'Search'
}

export interface ForumSearchRequest {
  query?: string;
  contentType?: ContentType;
  categoryIds?: string[];
  authorIds?: number[];
  fromTime?: string;
  toTime?: string;
  cursor?: string;
  limit?: number;
}

export interface SearchHighlights {
  body?: string;
  title?: string;
}

export interface ForumSearchResult {
  post: ForumPost;
  comment?: ForumComment;
  highlights?: SearchHighlights;
  contentType: string;
}

// Coordinates derived from the assembled pages, so a click reports what the impression did.
export interface ForumSearchRow extends ForumSearchResult {
  searchId: string;
  resultType: ForumsSearchResultType;
  positionInList: number;
  positionOnPage: number;
  pageIndex: number;
}

// A row with its own category resolved: results can come from any category, so the category
// travels with the row rather than being read off the browsed one.
export interface ForumSearchResultView extends ForumSearchRow {
  categoryName: string;
  categoryShortId: string;
}

export interface ForumSearchResponse {
  results: ForumSearchResult[];
  nextCursor: string | null;
  hasMore: boolean;
  totalResults: number;
}

// The full executed-search state as carried by the URL query string.
export interface ForumsUrlState {
  query: string;
  // `undefined` means the searchType param is absent (no content filter), as distinct from an
  // explicit `Any`, which is a first-class "all content" filter that persists in the URL.
  contentType?: ContentType;
  timeRange: TimeRange;
  categoryId?: string;
}
