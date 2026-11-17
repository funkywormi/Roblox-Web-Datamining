import React, { useMemo } from "react";
import { Chip } from "@rbx/foundation-ui";
import { getAbsoluteUrl } from "@rbx/core-scripts/util/url";

type TSearchPillProps = {
  queryText: string;
  index: number;
  onClick: (query: string, index: number) => void;
};

const SearchPill = ({ queryText, index, onClick }: TSearchPillProps): React.JSX.Element => {
  const searchUrl = useMemo(
    () => getAbsoluteUrl(`/discover/?Keyword=${encodeURIComponent(queryText)}`),
    [queryText],
  );

  return (
    <a
      href={searchUrl}
      onClick={() => {
        onClick(queryText, index);
      }}
    >
      <Chip text={queryText} isChecked={false} />
    </a>
  );
};

export default SearchPill;
