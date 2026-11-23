import { useEffect, useRef, useState } from "react";
import { Chip } from "@rbx/foundation-ui";
import type { CurrentData, PageType } from "../constants/types";
import { useItemsTranslate } from "../hooks/useItemsTranslate";
import { sendUserItemsPage } from "../utils/sendUserItemsPage";
import "../css/privateServerStatusFilters.scss";

export type PrivateServerStatusFilter = {
  id: number;
  name: string;
  labelKey: string;
  status?: string;
};

// id is logged as the status_filter_tab componentId (2 is reserved for Expiring) and name as categoryExtra.
export const privateServerStatusFilters: readonly PrivateServerStatusFilter[] = [
  { id: 0, name: "All", labelKey: "Label.StatusFilterAll" },
  { id: 1, name: "Active", labelKey: "Label.StatusFilterActive", status: "Active" },
  { id: 3, name: "Inactive", labelKey: "Label.StatusFilterInactive", status: "Expired" },
];

type PrivateServerStatusFiltersProps = {
  currentData: CurrentData;
  pageType: PageType;
  isOwnPage: boolean;
  onChange: (filter: PrivateServerStatusFilter) => void;
};

const PrivateServerStatusFilters = ({
  currentData,
  pageType,
  isOwnPage,
  onChange,
}: PrivateServerStatusFiltersProps) => {
  const translate = useItemsTranslate();
  const [selected, setSelected] = useState(privateServerStatusFilters[0]);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    // Reports the default to the parent so item clicks log it as categoryExtra.
    if (privateServerStatusFilters[0]) {
      onChangeRef.current(privateServerStatusFilters[0]);
    }
  }, []);

  const select = (filter: PrivateServerStatusFilter) => {
    if (filter === selected) {
      return;
    }
    setSelected(filter);

    sendUserItemsPage({
      pageType,
      eventType: "click",
      component: "status_filter_tab",
      categoryName: currentData.category?.name ?? "",
      subcategoryName: currentData.subcategory?.name ?? "",
      isOwnPage,
      componentId: String(filter.id),
    });

    onChange(filter);
  };

  return (
    <div className="status-filters flex gap-small" role="group">
      {privateServerStatusFilters.map(filter => (
        <Chip
          key={filter.id}
          text={translate(filter.labelKey)}
          size="Medium"
          isChecked={selected === filter}
          onCheckedChange={() => {
            select(filter);
          }}
        />
      ))}
    </div>
  );
};

export default PrivateServerStatusFilters;
