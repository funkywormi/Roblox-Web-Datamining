/**
 * Runs government-ID verification for an on-device parent.
 */

import { createOnDeviceParentVerificationNode } from "./createOnDeviceParentVerificationNode";
import { OnDeviceParentVerificationMethod } from "../../onDeviceParentVerification";

export const OdpGovernmentIdNode = createOnDeviceParentVerificationNode(
  OnDeviceParentVerificationMethod.Idv,
);
