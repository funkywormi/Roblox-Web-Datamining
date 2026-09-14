/**
 * Runs facial age estimation for an on-device parent.
 */

import { createOnDeviceParentVerificationNode } from "./createOnDeviceParentVerificationNode";
import { OnDeviceParentVerificationMethod } from "../../onDeviceParentVerification";

export const OdpAgeEstimationNode = createOnDeviceParentVerificationNode(
  OnDeviceParentVerificationMethod.Fae,
);
