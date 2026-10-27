import { requestFromContainer } from "./utils/requestFromContainer";

export const openIdentityVerificationModalEventName = "OpenIdentityVerificationModal";
export const openVoiceOptInOverlayEventName = "OpenVoiceOptInOverlay";
export const openCameraOptInOverlayEventName = "OpenCameraOptInOverlay";

export type IdentityVerificationEventDetail = {
  successCallback: (isUserOldEnough: boolean, didVerifyAge: boolean) => void;
};

export type VoiceOptInOverlayEventDetail = {
  closeCallback: (success: boolean) => void;
  requireExplicitVoiceConsent: boolean;
  useVoiceUpsellV2Design: boolean;
};

export type CameraOptInOverlayEventDetail = {
  closeCallback: (success: boolean) => void;
  requireExplicitCameraConsent: boolean;
  useCameraU13Design: boolean;
};

export const startVerificationFlow = (): Promise<
  [isUserOldEnough: boolean, didVerifyAge: boolean]
> =>
  requestFromContainer<[boolean, boolean]>(
    openIdentityVerificationModalEventName,
    (resolve): IdentityVerificationEventDetail => ({
      successCallback: (isUserOldEnough, didVerifyAge) => {
        resolve([isUserOldEnough, didVerifyAge]);
      },
    }),
    [false, false],
  );

export const showVoiceOptInOverlay = (
  requireExplicitVoiceConsent: boolean,
  useVoiceUpsellV2Design: boolean,
): Promise<boolean> =>
  requestFromContainer<boolean>(
    openVoiceOptInOverlayEventName,
    (resolve): VoiceOptInOverlayEventDetail => ({
      closeCallback: success => {
        resolve(success);
      },
      requireExplicitVoiceConsent,
      useVoiceUpsellV2Design,
    }),
    false,
  );

export const showAvatarVideoOptInOverlay = (
  requireExplicitCameraConsent: boolean,
  useCameraU13Design: boolean,
): Promise<boolean> =>
  requestFromContainer<boolean>(
    openCameraOptInOverlayEventName,
    (resolve): CameraOptInOverlayEventDetail => ({
      closeCallback: success => {
        resolve(success);
      },
      requireExplicitCameraConsent,
      useCameraU13Design,
    }),
    false,
  );
