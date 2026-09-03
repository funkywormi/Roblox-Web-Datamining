import { List } from "@rbx/foundation-ui";
import ViolationRow from "./ViolationRow";
import type { EnrichedViolation } from "./util/violations";

interface ViolationListProps {
  violations: EnrichedViolation[];
  fromList: boolean;
  /**
   * Whether the list is rendered inside a parent that already provides its own
   * surrounding padding (e.g. the full violations page). If true, the list will
   * not have a border.
   */
  isContained?: boolean;
}

/**
 * Shared list of violation rows used by both the recent-violations section and
 * the full violations page.
 *
 * `fromList` is threaded through to each row so detail navigation can record
 * where the user came from.
 *
 * When `isContained`, the outer bordered card is dropped in favor of plain
 * divider-separated rows.
 */
const ViolationList = ({ violations, fromList, isContained = false }: ViolationListProps) => (
  <List className={isContained ? "clip" : "stroke-standard stroke-default radius-large clip"}>
    {violations.map((violation, index) => {
      const isLastRow = index === violations.length - 1;
      const divider = !isContained && isLastRow ? "None" : "Full"; // Fixes Foundation UI List double border bug

      return (
        <ViolationRow
          key={violation.uid}
          violation={violation}
          fromList={fromList}
          isContained={isContained}
          divider={divider}
        />
      );
    })}
  </List>
);

export default ViolationList;
