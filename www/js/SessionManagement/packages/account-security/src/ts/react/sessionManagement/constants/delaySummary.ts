import { DelayParameters, DelayState } from "../../challenge/twoStepVerification/delay";
import { SessionManagementResources } from "./resources";

export type DelaySummaryEntry = {
  label: string;
  startedAt: string;
  status: string;
};

export type DelaySummaryGroup = {
  label: string;
  count: number;
  entries: DelaySummaryEntry[];
};

type DelaySubjectResources = SessionManagementResources["Label"]["Delay"]["Subject"];

/**
 * Maps raw backend subject strings to keys in `resources.Label.Delay.Subject`.
 * Patterns are tested in order; the first match wins. Subjects that don't match
 * any pattern fall back to `Unknown`.
 *
 * Example subject: "grouppayouts_c2232121-a905-449c-9325-65964179076e"
 * If two patterns could both match, move the more specific one earlier in the list.
 */
const SUBJECT_RESOURCE_PATTERNS: Array<[RegExp, keyof DelaySubjectResources]> = [
  [/^grouppayouts/i, "GroupPayouts"],
  [/^grouptransfers/i, "GroupOwnershipTransfer"],
  [/^experiencetransfers/i, "ExperienceOwnershipTransfer"],
  [/^grouprolesorpermissions/i, "GroupRolesOrPermissions"],
  [/^forgetuser/i, "ForgetUser"],
];

export const getSubjectLabel = (resources: SessionManagementResources, subject: string): string => {
  const match = SUBJECT_RESOURCE_PATTERNS.find(([pattern]) => pattern.test(subject));
  if (match) {
    return resources.Label.Delay.Subject[match[1]];
  }
  return resources.Label.Delay.Subject.Unknown;
};

export const formatDelayStartedAt = (
  resources: SessionManagementResources,
  updatedAt: string | undefined,
  delayUntilMs: string,
): string => {
  const ts = Number(updatedAt ?? delayUntilMs);
  if (Number.isNaN(ts)) {
    return resources.Label.Delay.UnknownTime;
  }
  const d = new Date(ts);
  const datePart = d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return resources.Label.Delay.StartedAt(datePart, timePart);
};

export const formatDelayStatus = (
  resources: SessionManagementResources,
  state: DelayState,
  delayUntilMs: string,
): string => {
  const delayUntil = Number(delayUntilMs);
  const remaining = delayUntil - Date.now();

  if (state === "LOCK_STATE_UNLOCKED" && remaining > 0) {
    const totalMinutes = Math.max(0, Math.ceil(remaining / 60_000));
    const days = Math.floor(totalMinutes / 1440);

    if (days > 0) {
      return resources.Label.Delay.Status.TimeLeft(resources.Label.Delay.Status.DaysLeft(days));
    }

    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    return resources.Label.Delay.Status.TimeLeft(`${hh}:${mm}`);
  }

  return resources.Label.Delay.Status.Completed;
};

export const buildDelaySummaryEntry = (
  resources: SessionManagementResources,
  delay: DelayParameters,
): DelaySummaryEntry => ({
  label: getSubjectLabel(resources, delay.subject),
  startedAt: formatDelayStartedAt(resources, delay.updatedAt, delay.delayUntil),
  status: formatDelayStatus(resources, delay.state, delay.delayUntil),
});

export const groupDelaySummaries = (
  resources: SessionManagementResources,
  delays: DelayParameters[],
): DelaySummaryGroup[] => {
  const groups = new Map<string, DelaySummaryGroup>();

  for (const delay of delays) {
    const entry = buildDelaySummaryEntry(resources, delay);
    const existing = groups.get(entry.label);
    if (existing) {
      existing.count += 1;
      existing.entries.push(entry);
    } else {
      groups.set(entry.label, { label: entry.label, count: 1, entries: [entry] });
    }
  }

  return [...groups.values()];
};

export const getDelaySummariesByState = (
  resources: SessionManagementResources,
  delays: DelayParameters[],
): string => {
  if (delays.length === 0) {
    return resources.Label.Value.NoActiveDelays;
  }

  const now = Date.now();
  const grouped = Object.groupBy(delays, ({ state, delayUntil }) => {
    if (state === "LOCK_STATE_UNLOCKED" && now <= Number(delayUntil)) {
      return resources.Label.Delay.Status.PendingLower;
    }
    return resources.Label.Delay.Status.CompletedLower;
  });

  return Object.entries(grouped)
    .filter(([_, delays]) => delays !== undefined)
    .map(([groupKey, delays]) => {
      // Help the compiler figure out we cleaned up undefined values in the filter above.
      return `${delays!.length} ${groupKey}`;
    })
    .join(", ");
};
