import * as eventStreamService from '@rbx/core-scripts/event-stream';
import transport from './requestTransport';
import {
  getShowOverlayUrlConfig,
  getPostOptUserInToVoiceChatUrlConfig,
  getPostOptUserInToAvatarChatUrlConfig,
  getRecordUserSeenUpsellModalUrlConfig,
  getRecordUserSeenAvatarVideoUpsellModalUrlConfig
} from '../constants/urlConstants';
import { ModalEvent } from '../constants/viewConstants';
import type { IdVerificationEvent } from '../constants/idVerificationEventStreamConstants';

export const postShowOverlay = (showOverlay: boolean) => {
  const urlConfig = getShowOverlayUrlConfig();
  const params = { showOverlay };
  return transport.post(urlConfig, params).then(({ data }) => {
    return data;
  });
};

export const postOptUserInToVoiceChat = (isUserOptIn: boolean, isOptedInThroughUpsell: boolean) => {
  const urlConfig = getPostOptUserInToVoiceChatUrlConfig();
  const params = {
    isUserOptIn,
    isOptedInThroughUpsell
  };
  // This endpoint returns isUserOptIn which will match the input params if successful.
  return transport.post(urlConfig, params).then(({ data }) => {
    return data;
  });
};

export const postOptUserInToAvatarChat = (isUserOptIn: boolean, isOptedInThroughUpsell: boolean) => {
  const urlConfig = getPostOptUserInToAvatarChatUrlConfig();
  const params = {
    isUserOptIn,
    isOptedInThroughUpsell
  };
  // This endpoint returns isUserOptIn which will match the input params if successful.
  return transport.post(urlConfig, params).then(({ data }) => {
    return data;
  });
};

export const recordUserSeenUpsellModal = () => {
  const urlConfig = getRecordUserSeenUpsellModalUrlConfig();
  const params = {};

  return transport.post(urlConfig, params).then(({ data }) => {
    return data;
  });
};

export const recordUserSeenAvatarVideoUpsellModal = () => {
  const urlConfig = getRecordUserSeenAvatarVideoUpsellModalUrlConfig();
  const params = {};

  return transport.post(urlConfig, params).then(({ data }) => {
    return data;
  });
};

export const showVoiceOptInOverlay = (
  requireExplicitVoiceConsent: boolean,
  useVoiceUpsellV2Design: boolean
) =>
  new Promise<boolean>(resolve => {
    const event = new CustomEvent(ModalEvent.OpenVoiceOptInOverlay, {
      detail: {
        closeCallback: (success: boolean) => {
          resolve(success);
        },
        requireExplicitVoiceConsent,
        useVoiceUpsellV2Design
      }
    });
    window.dispatchEvent(event);
  });

export const showAvatarVideoOptInOverlay = (
  requireExplicitCameraConsent: boolean,
  useCameraU13Design: boolean
) => {
  return new Promise<boolean>(resolve => {
    const event = new CustomEvent(ModalEvent.OpenCameraOptInOverlay, {
      detail: {
        closeCallback: (success: boolean) => {
          resolve(success);
        },
        requireExplicitCameraConsent,
        useCameraU13Design
      }
    });
    window.dispatchEvent(event);
  });
};

export const sendChatEvent = (event: IdVerificationEvent) => {
  eventStreamService.sendEventWithTarget(event.type, event.context, { ...event.params });
};
