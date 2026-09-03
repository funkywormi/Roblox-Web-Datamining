import React from "react";
import { IconButton } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";

export interface PageControlsProps {
  pageIndex: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPageChanged?: (newPageIndex: number) => Promise<void>;
  disabled?: boolean;
}

const PageControls: React.FC<PageControlsProps> = ({
  pageIndex,
  hasPreviousPage,
  hasNextPage,
  onPageChanged,
  disabled,
}: PageControlsProps) => {
  const { translate } = useTranslation();

  const handlePageChange = async (newPageIndex: number) => {
    if (onPageChanged) {
      await onPageChanged(newPageIndex);
    }
  };

  return (
    <div className="flex items-center width-full justify-end padding-small">
      <IconButton
        icon="icon-filled-chevron-small-left"
        variant="Utility"
        size="Small"
        isDisabled={!hasPreviousPage || disabled}
        onClick={() => {
          // eslint-disable-next-line no-void
          void handlePageChange(pageIndex - 1);
        }}
        ariaLabel={translate("Action.Previous")}
      />
      <div className="padding-x-medium">{pageIndex + 1}</div>
      <IconButton
        icon="icon-filled-chevron-small-right"
        variant="Utility"
        size="Small"
        isDisabled={!hasNextPage || disabled}
        onClick={() => {
          // eslint-disable-next-line no-void
          void handlePageChange(pageIndex + 1);
        }}
        ariaLabel={translate("Action.Next")}
      />
    </div>
  );
};

export default PageControls;
