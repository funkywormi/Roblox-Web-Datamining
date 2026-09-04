import type { Ref } from "react";
import type { SearchResultUser } from "../types/searchedUser";

type ResultsGridProps = {
  results: SearchResultUser[];
  sentinelRef: Ref<HTMLDivElement>;
  children: React.ReactNode;
};

const ResultsGrid = ({ results, sentinelRef, children }: ResultsGridProps): React.JSX.Element => {
  return (
    <div className="flex width-full flex-col gap-medium">
      <div className="player-search-results-grid" data-testid="player-search-results">
        {children}
      </div>
      {results.length > 0 ? <div ref={sentinelRef} className="height-100" /> : null}
    </div>
  );
};

export default ResultsGrid;
