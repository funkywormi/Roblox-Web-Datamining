export type LegallySensitiveMapping = {
  consentName: string;
  surfaceName: string;
};

export const legallySensitiveConsentMap: Record<string, Record<string, LegallySensitiveMapping>> = {
  MarketingEmails: {
    Email: {
      consentName: "allowMarketingEmailNotifications",
      surfaceName: "email-marketing-setting",
    },
  },
};

export function findLegallySensitiveMapping(
  channels: readonly {
    channel: { value: string; isLegallySensitive: boolean | null | undefined };
  }[],
  notificationTypeValue: string,
): LegallySensitiveMapping | undefined {
  for (const ch of channels) {
    if (!ch.channel.isLegallySensitive) continue;
    const mapping = legallySensitiveConsentMap[notificationTypeValue]?.[ch.channel.value];
    if (mapping) return mapping;
  }
  return undefined;
}
