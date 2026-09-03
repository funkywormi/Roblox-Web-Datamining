export default {
  onExit: {
    name: "nsCloseContent",
    context: "click",
    additionalProperties: {},
  },
  // "seen" analytic fired when an unread count first becomes visible on the bell.
  openCTA: {
    name: "nsOpenCTAShown",
    context: "seen",
  },
  openContent: {
    name: "nsOpenContent",
    context: "click",
  },
} as const;
