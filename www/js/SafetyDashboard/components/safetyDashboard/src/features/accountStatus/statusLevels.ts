import { AccountStandingStatus } from "../../types/api";

interface StatusLevel {
  status: AccountStandingStatus;
  /**
   * Color for this level, used both as its slot in the full-spectrum legend
   * and to fill the bar when this is the account's status.
   */
  colorClass: string;
  /**
   * Translation key for this level's heading, resolved by the consumer. Headings
   * are frontend-owned; the matching description is sourced from the backend.
   */
  headingKey: string;
}

/**
 * Account status levels ordered from worst (left) to best (right). A level's
 * index determines how many progress-bar segments fill for that status: index
 * 0 fills 1 segment, index 3 fills all 4. The full-spectrum legend reads this
 * same list left to right.
 */
export const STATUS_LEVELS: StatusLevel[] = [
  {
    status: AccountStandingStatus.Critical,
    colorClass: "bg-system-alert",
    headingKey: "Label.Critical",
  },
  {
    status: AccountStandingStatus.AtRisk,
    colorClass: "bg-[var(--color-extended-orange-700)]",
    headingKey: "Label.AtRisk",
  },
  {
    status: AccountStandingStatus.Fair,
    colorClass: "bg-system-warning",
    headingKey: "Label.Fair",
  },
  {
    status: AccountStandingStatus.AllGood,
    colorClass: "bg-system-success",
    headingKey: "Label.AllGood",
  },
];

/**
 * Returns the level for a status, or `undefined` if the status isn't recognized.
 */
export const getStatusLevel = (status: AccountStandingStatus): StatusLevel | undefined =>
  STATUS_LEVELS.find(l => l.status === status);

/**
 * Heading key shown when the backend reports a `Banned` status. Banned sits off
 * the progress scale, so it's kept out of STATUS_LEVELS and handled on its own;
 * like the normal statuses, its description is sourced from the backend.
 */
export const BANNED_DISPLAY = {
  headingKey: "Label.Banned",
};

/**
 * Heading + description keys shown when account standing fails to load (or returns
 * an unrecognized status). Unlike every other state, this copy lives entirely on
 * the frontend because there's no backend payload to describe. The progress bar
 * renders empty (every segment greyed out) since there's no status to show.
 */
export const UNAVAILABLE_DISPLAY = {
  headingKey: "Label.Unavailable",
  descriptionKey: "Description.Error",
};
