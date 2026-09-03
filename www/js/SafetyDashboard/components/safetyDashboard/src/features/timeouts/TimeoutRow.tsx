import { Badge, Icon, ListItem } from "@rbx/foundation-ui";
import type { TListItemDivider } from "@rbx/foundation-ui";
import type { TTailwindIconClass } from "@rbx/foundation-tailwind/classes";
import useCountdown from "../../hooks/useCountdown";

interface TimeoutRowProps {
  label: string;
  iconClass?: TTailwindIconClass;
  endDate?: string;
  divider?: TListItemDivider;
  onPress: () => void;
}

/**
 * A single row that will be displayed under the list of the user's current timeouts. The row contains
 * the timeout's icon, label, and a countdown timer representing how much time is remaining. until the timeout expires.
 *
 * Clicking on the timeout row will either open up the dialog for feature restrictions (Universal Feature Restriction dialog),
 * or it will open the Not Approved dialog for account restrictions.
 */
const TimeoutRow = ({ label, iconClass, endDate, divider = "None", onPress }: TimeoutRowProps) => {
  const { countdownText, isExpired } = useCountdown(endDate ?? "");

  /**
   * The /not-approved API will only return an intervention's info if it's still active. Since the user
   * won't be able to access their intervention details once it expires, we can just silently drop off
   * the row from the list.
   */
  if (endDate && isExpired) {
    return null;
  }

  return (
    <ListItem
      data-testid="timeout-row"
      title={label}
      size="Medium"
      divider={divider}
      isContained={false}
      leading={iconClass && <Icon name={iconClass} size="Medium" />}
      trailing={endDate && <Badge label={countdownText} icon="icon-filled-clock" />}
      onSelect={onPress}
    />
  );
};

export default TimeoutRow;
