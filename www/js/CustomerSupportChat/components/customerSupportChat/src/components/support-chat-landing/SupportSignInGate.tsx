import React from "react";
import { Button } from "@rbx/foundation-ui";
import "./SupportSignInGate.scss";

const SIGN_IN_HEADING = "Sign in to your account";
const SIGN_IN_BODY = "Sign in to your account and get more personalized, faster help.";
const SIGN_IN_ACTION = "Sign in";
const CONTINUE_ACTION = "Get help without signing in";

type SupportSignInGateProps = {
  onSignIn: () => void;
  onContinueWithoutSigningIn: () => void;
};

const SupportSignInGate = ({
  onSignIn,
  onContinueWithoutSigningIn,
}: SupportSignInGateProps): React.ReactElement => (
  <section
    className="support-sign-in-gate"
    aria-labelledby="sign-in-gate-title"
    data-testid="support-sign-in-gate"
  >
    <div className="support-sign-in-gate-panel">
      <div className="support-sign-in-gate-copy">
        <h1 id="sign-in-gate-title">{SIGN_IN_HEADING}</h1>
        <p>{SIGN_IN_BODY}</p>
      </div>
      <div className="support-sign-in-gate-actions">
        <Button variant="Emphasis" size="Medium" type="button" onClick={onSignIn}>
          {SIGN_IN_ACTION}
        </Button>
        <Button variant="Link" size="Medium" type="button" onClick={onContinueWithoutSigningIn}>
          {CONTINUE_ACTION}
        </Button>
      </div>
    </div>
  </section>
);

export default SupportSignInGate;
