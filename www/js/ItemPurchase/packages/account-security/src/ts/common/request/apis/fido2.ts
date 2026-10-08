import * as fido2Util from "@rbx/core-scripts/auth/fido2";
import * as hybridResponseService from "@rbx/core-scripts/auth/hybrid-response";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { Result } from "../../result";
import { toResultCustomRequest } from "../common";
import * as fido2 from "../types/fido2";

const parseFido2ErrorCode = (error: unknown): number | null => {
  const { code } = error as Record<string, unknown>;
  return code as number;
};

export const getNativeResponse = (
  feature: Parameters<typeof hybridResponseService.getNativeResponse>[0],
  parameters: Record<string, unknown>,
  timeoutMilliseconds: number,
): Promise<Result<fido2.GetNativeResponseReturnType, fido2.Fido2Error | null>> =>
  toResultCustomRequest(
    hybridResponseService.getNativeResponse(feature, parameters, timeoutMilliseconds),
    fido2.Fido2Error,
    parseFido2ErrorCode,
    (credentialString: string | null) => {
      if (credentialString === null) {
        return null;
      }

      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      const credential = JSON.parse(credentialString);
      // Custom handling of error.
      if (credential.errorCode !== undefined) {
        const e = {
          name: "getNativeResponse Error",
          message: credential.errorMsg,
          code: credential.errorCode,
        } as Error;
        throw e;
      }

      // Android does not need conversion
      const deviceMeta = getDeviceMeta();
      const shouldConvertToStandardBase64 = !(deviceMeta?.isInApp && deviceMeta?.isAndroidApp);
      return shouldConvertToStandardBase64
        ? fido2Util.formatCredentialAuthenticationResponseApp(credentialString)
        : credentialString;
    },
  );

export const getNavigatorCredentials = (
  options?: CredentialRequestOptions,
): Promise<Result<fido2.GetNavigatorCredentialsReturnType, fido2.Fido2Error | null>> =>
  toResultCustomRequest(navigator.credentials.get(options), fido2.Fido2Error).then(result =>
    Result.map(result, (credential: Credential | null) => {
      if (credential === null) {
        return null;
      }
      return fido2Util.formatCredentialAuthenticationResponseWeb(credential as PublicKeyCredential);
    }),
  );
