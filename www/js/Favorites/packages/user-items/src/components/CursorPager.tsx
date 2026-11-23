import { IconButton } from "@rbx/foundation-ui";
import type { AssetsPager } from "../hooks/useCursorPager";
import { useItemsTranslate } from "../hooks/useItemsTranslate";

const CursorPager = ({ pager }: { pager: AssetsPager }) => {
  const translate = useItemsTranslate();

  return (
    <div className="pager-holder">
      <ul className="pager">
        <li className="pager-prev">
          <IconButton
            icon="icon-regular-chevron-large-left"
            ariaLabel={translate("Label.Previous")}
            size="Small"
            variant="Utility"
            isDisabled={!pager.canLoadPreviousPage}
            onClick={pager.loadPreviousPage}
          />
        </li>
        <li>
          <span>{translate("Label.CurrentPage", { currentPage: pager.currentPageNumber })}</span>
        </li>
        <li className="pager-next">
          <IconButton
            icon="icon-regular-chevron-large-right"
            ariaLabel={translate("Label.Next")}
            size="Small"
            variant="Utility"
            isDisabled={!pager.canLoadNextPage}
            onClick={pager.loadNextPage}
          />
        </li>
      </ul>
    </div>
  );
};

export default CursorPager;
