import type { PingSignalLevel, ServerMetaIconId } from "./serverCardMeta";

export type ServerListJoinTelemetry = {
  position: number;
  sortOption: string;
  serverCardIconContext: string;
  pingSignalLevel: PingSignalLevel | undefined;
  languageMatchCount: number | undefined;
  friendCount: number | undefined;
};

type ServerCardMetadata = {
  pingSignalLevel?: PingSignalLevel | null;
  languageMatchCount?: number | null;
  friendCount?: number | null;
};

export const createServerListJoinTelemetry = ({
  position,
  sortOption = "NotDisplayed",
  displayedIcons = [],
  metadata = {},
}: {
  position: number;
  sortOption?: string;
  displayedIcons?: readonly ServerMetaIconId[];
  metadata?: ServerCardMetadata;
}): ServerListJoinTelemetry => ({
  position,
  sortOption,
  serverCardIconContext: displayedIcons.length > 0 ? displayedIcons.join("+") : "0",
  pingSignalLevel: metadata.pingSignalLevel ?? undefined,
  languageMatchCount: metadata.languageMatchCount ?? undefined,
  friendCount: metadata.friendCount ?? undefined,
});
