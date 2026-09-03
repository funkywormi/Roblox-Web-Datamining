const SHARE_LINKS = "shareLinks";
const joinButtonName = "join";
const cancelButtonName = "cancel";

const buildInviteLinkInvalidModalEvent = (btnName: string, linkId: string, linkStatus: string) => {
  return {
    name: "buttonClick",
    type: "buttonClick",
    context: SHARE_LINKS,
    params: {
      btn: btnName,
      page: "shareLinkErrorDialog",
      linkType: "ExperienceInvite",
      linkId,
      linkStatus,
    },
  };
};

const buildInviteLinkInvalidModalLaunchGameEvent = (
  placeId: string,
  linkId: string,
  linkStatus: string,
) => {
  return {
    eventName: "joinGameFromInviteLink",
    gamePlayIntentEventCtx: SHARE_LINKS,
    ctx: SHARE_LINKS,
    properties: {
      linkStatus,
      linkType: "ExperienceInvite",
      placeId,
      linkId,
    },
  };
};

export {
  buildInviteLinkInvalidModalEvent,
  joinButtonName,
  cancelButtonName,
  buildInviteLinkInvalidModalLaunchGameEvent,
};
