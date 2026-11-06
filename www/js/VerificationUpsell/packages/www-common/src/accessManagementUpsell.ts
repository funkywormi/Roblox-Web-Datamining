import type { ReactNode } from "react";
import { requestFromContainer } from "./utils/requestFromContainer";

export const startAccessManagementUpsellEventName = "StartAccessManagementUpsell";

export type AccessManagementAccess = "Granted" | "Denied" | "Actionable";

export type AccessManagementExtraParameter = {
  name: string;
  type: string;
  value: string;
};

export type AccessManagementFeatureSpecificData = {
  title?: string;
  body?: ReactNode;
  actionButtonText?: string;
  neutralButtonText?: string;
  consentFormType?: string;
  onAction?: () => void;
  onNeutral?: () => void;
  onHide?: () => void;
  surface?: string;
  context?: string;
  source?: string;
};

export type AccessManagementUpsellParams = {
  featureName: string;
  redirectLink?: string;
  ampFeatureCheckData?: AccessManagementExtraParameter[];
  isAsyncCall?: boolean;
  usePrologue?: boolean;
  ampRecourseData?: unknown;
  featureSpecificData?: AccessManagementFeatureSpecificData;
  namespace?: string;
  wizardIntent?: string;
};

export type AccessManagementUpsellEventDetail = {
  featureName: string;
  redirectLink: string | null;
  ampFeatureCheckData: AccessManagementExtraParameter[];
  isAsyncCall: boolean;
  usePrologue: boolean;
  ampRecourseData: unknown;
  featureSpecificData: AccessManagementFeatureSpecificData | null;
  namespace: string | null;
  wizardIntent: string | null;
  closeCallback: (access: AccessManagementAccess) => void;
};

export const startAccessManagementUpsell = ({
  featureName,
  redirectLink,
  ampFeatureCheckData = [],
  isAsyncCall = true,
  usePrologue = false,
  ampRecourseData = null,
  featureSpecificData,
  namespace,
  wizardIntent,
}: AccessManagementUpsellParams): Promise<boolean> =>
  requestFromContainer<boolean>(
    startAccessManagementUpsellEventName,
    (resolve): AccessManagementUpsellEventDetail => ({
      featureName,
      redirectLink: redirectLink ?? null,
      ampFeatureCheckData,
      isAsyncCall,
      usePrologue,
      ampRecourseData,
      featureSpecificData: featureSpecificData ?? null,
      namespace: namespace ?? null,
      wizardIntent: wizardIntent ?? null,
      closeCallback: access => {
        resolve(access === "Granted");
      },
    }),
    false,
  );
