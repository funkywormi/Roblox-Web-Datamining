import { IconButton } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { PAGE_SEPARATOR } from "../constants";

const PaginationControls = ({
  currentPage,
  totalPages,
  onChangePage,
}: {
  currentPage: number;
  totalPages: number;
  onChangePage: (page: number) => void;
}): React.ReactElement | null => {
  const { translate } = useTranslation();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-xsmall justify-end">
      <IconButton
        icon="icon-filled-chevron-large-left-to-line"
        variant="Utility"
        size="Medium"
        isDisabled={currentPage <= 1}
        ariaLabel={translate("Action.FirstPage")}
        onClick={() => {
          onChangePage(1);
        }}
      />
      <IconButton
        icon="icon-filled-chevron-large-left"
        variant="Utility"
        size="Medium"
        isDisabled={currentPage <= 1}
        ariaLabel={translate("Action.Previous")}
        onClick={() => {
          onChangePage(currentPage - 1);
        }}
      />
      <span className="text-body-large content-muted padding-x-small">
        {currentPage}
        {PAGE_SEPARATOR}
        {totalPages}
      </span>
      <IconButton
        icon="icon-filled-chevron-large-right"
        variant="Utility"
        size="Medium"
        isDisabled={currentPage >= totalPages}
        ariaLabel={translate("Action.Next")}
        onClick={() => {
          onChangePage(currentPage + 1);
        }}
      />
      <IconButton
        icon="icon-filled-chevron-large-right-to-line"
        variant="Utility"
        size="Medium"
        isDisabled={currentPage >= totalPages}
        ariaLabel={translate("Action.LastPage")}
        onClick={() => {
          onChangePage(totalPages);
        }}
      />
    </div>
  );
};

export default PaginationControls;
