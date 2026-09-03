import { formatter } from "../util/dateTime";

/**
 * Displays a timestamp in the format of "MM/DD/YYYY | HH:MM AM/PM".
 * Example: "10/22/2025 | 12:00 PM"
 */
const Timestamp = ({ timestamp }: { timestamp: string | undefined }) => {
  if (!timestamp) {
    return null;
  }
  return <p className="text-body-medium content-default">{formatter.getFullDate(timestamp)}</p>;
};

export default Timestamp;
