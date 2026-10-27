export type AbuseReportAttributes = Readonly<Record<string, string | number | boolean>>;

type AttributesRequestInput = {
  attributes?: AbuseReportAttributes;
  targetIdStr?: never;
};

type LegacyTargetRequestInput = {
  attributes?: never;
  /** @deprecated Use attributes instead. */
  targetIdStr: string;
};

export type AbuseReportRequestInput = AttributesRequestInput | LegacyTargetRequestInput;

export const getRequestAttributes = (input: {
  attributes?: AbuseReportAttributes;
  targetIdStr?: string;
}): AbuseReportAttributes | undefined => {
  if (input.attributes !== undefined && input.targetIdStr !== undefined) {
    throw new Error("attributes and targetIdStr are mutually exclusive");
  }

  if (input.targetIdStr !== undefined) {
    return { targetId: input.targetIdStr };
  }

  return input.attributes;
};

export const serializeAbuseReportAttributes = (
  attributes?: AbuseReportAttributes,
): string | undefined => {
  if (!attributes || Object.keys(attributes).length === 0) {
    return undefined;
  }

  const sortedEntries = Object.entries(attributes).sort(([leftKey], [rightKey]) => {
    if (leftKey < rightKey) return -1;
    if (leftKey > rightKey) return 1;
    return 0;
  });

  return JSON.stringify(Object.fromEntries(sortedEntries));
};
