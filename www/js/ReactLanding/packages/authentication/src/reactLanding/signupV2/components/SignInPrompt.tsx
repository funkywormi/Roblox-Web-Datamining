import React from "react";

export type SignInPromptProps = {
  translate: (key: string, params?: Record<string, string>) => string;
  translationKey: string;
  href: string;
  isDisabled?: boolean;
  onClick?: () => void;
};

const signInLinkStart = "__SIGN_IN_LINK_START__";
const signInLinkEnd = "__SIGN_IN_LINK_END__";

// A translation that drops the link markers still renders as a usable link.
const splitSignInLabel = (label: string): { prefix: string; link: string; suffix: string } => {
  const [prefix = "", linkAndSuffix] = label.split(signInLinkStart);
  if (linkAndSuffix === undefined) {
    return { prefix: "", link: label, suffix: "" };
  }
  const [link = "", suffix = ""] = linkAndSuffix.split(signInLinkEnd);
  return { prefix, link, suffix };
};

const SignInPrompt = ({
  translate,
  translationKey,
  href,
  isDisabled = false,
  onClick,
}: SignInPromptProps): JSX.Element => {
  const { prefix, link, suffix } = splitSignInLabel(
    translate(translationKey, { startTag: signInLinkStart, endTag: signInLinkEnd }),
  );

  // Inline rather than flex so the space before the link survives.
  return (
    <div className="signup-v2-sign-in-prompt width-full text-align-x-center text-label-medium">
      {prefix}
      {isDisabled ? (
        <span className="signup-v2-sign-in-link" role="link" aria-disabled>
          {link}
        </span>
      ) : (
        <a className="signup-v2-sign-in-link" href={href} aria-disabled={false} onClick={onClick}>
          {link}
        </a>
      )}
      {suffix}
    </div>
  );
};

export default SignInPrompt;
