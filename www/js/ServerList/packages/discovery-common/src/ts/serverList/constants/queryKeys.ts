export const privateServerListKeys = {
  universePrivateServerMetadata: (universeId: number | undefined) =>
    ["serverListMetadata", universeId] as const,
} as const;
