import React from "react";
import { assetUrl } from "@rbx/www-common/asset";
import googleLogo from "../../images/sso/google-logo.svg";

// Google's sign-in branding guidelines require the full-color "G"; Foundation only ships a
// monochrome glyph.
// TODO: Replace this with Builder Icons when the full-color icon is available.
const GoogleLogo = (): React.JSX.Element => (
  <img src={assetUrl(googleLogo)} alt="" width={16} height={16} aria-hidden="true" />
);

export default GoogleLogo;
