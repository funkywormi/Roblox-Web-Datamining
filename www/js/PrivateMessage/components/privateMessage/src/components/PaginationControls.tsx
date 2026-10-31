import { Button } from "@rbx/foundation-ui";
import { PAGE_SEPARATOR } from "../constants";
import type { CursorPagination, MessagePagination, PageTarget, Translate } from "../types";
import PagerButton from "./PagerButton";

type ChangePage = (target: PageTarget) => void;

const OffsetPagination = ({
  translate,
  currentPage,
  totalPages,
  onChangePage,
}: {
  translate: Translate;
  currentPage: number;
  totalPages: number;
  onChangePage: ChangePage;
}): React.ReactElement | null => {
  if (totalPages <= 1) {
    return null;
  }

  const toPage = (pageNumber: number): PageTarget => ({ pageNumber, pageToken: null });
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex items-center gap-xsmall justify-end">
      <PagerButton
        icon="icon-filled-chevron-large-left-to-line"
        ariaLabel={translate("Action.FirstPage")}
        target={hasPrevious ? toPage(1) : null}
        onChangePage={onChangePage}
      />
      <PagerButton
        icon="icon-filled-chevron-large-left"
        ariaLabel={translate("Action.Previous")}
        target={hasPrevious ? toPage(currentPage - 1) : null}
        onChangePage={onChangePage}
      />
      <span className="text-body-large content-muted padding-x-small">
        {currentPage}
        {PAGE_SEPARATOR}
        {totalPages}
      </span>
      <PagerButton
        icon="icon-filled-chevron-large-right"
        ariaLabel={translate("Action.Next")}
        target={hasNext ? toPage(currentPage + 1) : null}
        onChangePage={onChangePage}
      />
      <PagerButton
        icon="icon-filled-chevron-large-right-to-line"
        ariaLabel={translate("Action.LastPage")}
        target={hasNext ? toPage(totalPages) : null}
        onChangePage={onChangePage}
      />
    </div>
  );
};

/**
 * Pager for cursor mode: First, Prev, the server's numbered page window, and Next. There is no
 * total and no Last control because the server does not count the mailbox. Prev and Next use the
 * window's neighbors of the current page, so they are disabled when the window has no neighbor.
 */
const CursorPaginationControls = ({
  translate,
  pageNumber,
  pageWindow,
  firstPageToken,
  hasMore,
  onChangePage,
}: CursorPagination & {
  translate: Translate;
  onChangePage: ChangePage;
}): React.ReactElement | null => {
  const findTarget = (targetPage: number): PageTarget | null => {
    const entry = pageWindow.find(candidate => candidate.pageNumber === targetPage);
    return entry ? { pageNumber: entry.pageNumber, pageToken: entry.pageToken } : null;
  };
  const previous = pageNumber > 1 ? findTarget(pageNumber - 1) : null;
  const next = hasMore ? findTarget(pageNumber + 1) : null;

  if (pageNumber <= 1 && next == null) {
    return null;
  }

  return (
    <div className="flex items-center gap-xsmall justify-end">
      <PagerButton
        icon="icon-filled-chevron-large-left-to-line"
        ariaLabel={translate("Action.FirstPage")}
        target={pageNumber > 1 ? { pageNumber: 1, pageToken: firstPageToken } : null}
        onChangePage={onChangePage}
      />
      <PagerButton
        icon="icon-filled-chevron-large-left"
        ariaLabel={translate("Action.Previous")}
        target={previous}
        onChangePage={onChangePage}
      />
      {pageWindow.map(entry => {
        const isCurrent = entry.pageNumber === pageNumber;
        return (
          <Button
            key={entry.pageNumber}
            variant={isCurrent ? "SoftEmphasis" : "Utility"}
            size="Medium"
            aria-current={isCurrent ? "page" : undefined}
            onClick={() => {
              if (!isCurrent) {
                onChangePage({ pageNumber: entry.pageNumber, pageToken: entry.pageToken });
              }
            }}
          >
            {entry.pageNumber}
          </Button>
        );
      })}
      <PagerButton
        icon="icon-filled-chevron-large-right"
        ariaLabel={translate("Action.Next")}
        target={next}
        onChangePage={onChangePage}
      />
    </div>
  );
};

const PaginationControls = ({
  translate,
  pagination,
  onChangePage,
}: {
  translate: Translate;
  pagination: MessagePagination;
  onChangePage: ChangePage;
}): React.ReactElement | null =>
  pagination.kind === "cursor" ? (
    <CursorPaginationControls
      translate={translate}
      pageNumber={pagination.pageNumber}
      pageWindow={pagination.pageWindow}
      firstPageToken={pagination.firstPageToken}
      hasMore={pagination.hasMore}
      onChangePage={onChangePage}
    />
  ) : (
    <OffsetPagination
      translate={translate}
      currentPage={pagination.currentPage}
      totalPages={pagination.totalPages}
      onChangePage={onChangePage}
    />
  );

export default PaginationControls;
