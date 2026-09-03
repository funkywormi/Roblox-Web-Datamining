import { eventStreamService } from "core-roblox-utilities";
import { getEventParams } from "../../constants/eventConstants";
import wrapEventServiceWithTryCatch from "../../../../core/utils/eventUtils";

export type VerificationEventService = {
  verifyAgeButtonClicked: () => void;
  verifyAgeButtonClickedIdVerification: () => void;
  verifyAgeButtonClickedIdVerificationDeeplink: () => void;
  verifyAgeButtonClickedFacialAgeEstimation: () => void;
  accountInfoPageViewFaeAvailable: () => void;
  temporaryCommsBannerFaeButtonClicked: () => void;
  temporaryCommsBannerIdvButtonClicked: () => void;
  temporaryCommsBannerFaeBannerLoad: () => void;
  temporaryCommsBannerIdvBannerLoad: () => void;
  temporaryCommsBannerChatDisabledBannerLoad: () => void;
};

const verifyAgeButtonClicked: () => void = wrapEventServiceWithTryCatch((): void => {
  const params = getEventParams.verifyAgeButtonClicked();
  eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
});

const verifyAgeButtonClickedIdVerification: () => void = wrapEventServiceWithTryCatch((): void => {
  const params = getEventParams.verifyAgeButtonClickedIdVerification();
  eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
});

const verifyAgeButtonClickedIdVerificationDeeplink: () => void = wrapEventServiceWithTryCatch(
  (): void => {
    const params = getEventParams.verifyAgeButtonClickedIdVerificationDeeplink();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  },
);

const verifyAgeButtonClickedFacialAgeEstimation: () => void = wrapEventServiceWithTryCatch(
  (): void => {
    const params = getEventParams.verifyAgeButtonClickedFacialAgeEstimation();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  },
);

const accountInfoPageViewFaeAvailable: () => void = wrapEventServiceWithTryCatch((): void => {
  const params = getEventParams.accountInfoPageViewFaeAvailble();
  eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
});

const temporaryCommsBannerFaeButtonClicked: () => void = wrapEventServiceWithTryCatch((): void => {
  const params = getEventParams.temporaryCommsBannerFaeButtonClicked();
  eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
});

const temporaryCommsBannerIdvButtonClicked: () => void = wrapEventServiceWithTryCatch((): void => {
  const params = getEventParams.temporaryCommsBannerIdvButtonClicked();
  eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
});

const temporaryCommsBannerFaeBannerLoad: () => void = wrapEventServiceWithTryCatch((): void => {
  const params = getEventParams.temporaryCommsBannerFaeBannerLoad();
  eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
});

const temporaryCommsBannerIdvBannerLoad: () => void = wrapEventServiceWithTryCatch((): void => {
  const params = getEventParams.temporaryCommsBannerIdvBannerLoad();
  eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
});

const temporaryCommsBannerChatDisabledBannerLoad: () => void = wrapEventServiceWithTryCatch(
  (): void => {
    const params = getEventParams.temporaryCommsBannerChatDisabledBannerLoad();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  },
);

const verificationEventService: VerificationEventService = {
  verifyAgeButtonClicked,
  verifyAgeButtonClickedIdVerification,
  verifyAgeButtonClickedIdVerificationDeeplink,
  verifyAgeButtonClickedFacialAgeEstimation,
  accountInfoPageViewFaeAvailable,
  temporaryCommsBannerFaeButtonClicked,
  temporaryCommsBannerIdvButtonClicked,
  temporaryCommsBannerFaeBannerLoad,
  temporaryCommsBannerIdvBannerLoad,
  temporaryCommsBannerChatDisabledBannerLoad,
};

export {
  verifyAgeButtonClicked,
  verifyAgeButtonClickedIdVerification,
  verifyAgeButtonClickedIdVerificationDeeplink,
  verifyAgeButtonClickedFacialAgeEstimation,
  accountInfoPageViewFaeAvailable,
  temporaryCommsBannerFaeButtonClicked,
  temporaryCommsBannerIdvButtonClicked,
  temporaryCommsBannerFaeBannerLoad,
  temporaryCommsBannerIdvBannerLoad,
  temporaryCommsBannerChatDisabledBannerLoad,
};

export default verificationEventService;
