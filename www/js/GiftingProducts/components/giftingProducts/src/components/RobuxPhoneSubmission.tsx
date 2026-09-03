import React, { FC, useMemo } from "react";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { Button, Modal } from "@rbx/core-ui/legacy/react-style-guide";
import { translationConfig } from "../translation.config";
import { UseRobuxPhoneVerificationResult } from "../hooks/useRobuxPhoneVerification";

const linkTagWithSmsTos =
  '<a href="https://en.help.roblox.com/hc/articles/9483830673556-Roblox-SMS-Terms-of-Service">';
const linkTagWithPrivacyPolicy = '<a href="https://en.help.roblox.com/hc/articles/115004630823">';
const linkTagEnd = "</a>";
const linkTagBreak = "<br>";

type RobuxPhoneSubmissionProps = {
  robuxPhoneVerification: UseRobuxPhoneVerificationResult;
} & WithTranslationsProps;

const RobuxPhoneSubmission: FC<RobuxPhoneSubmissionProps> = ({
  robuxPhoneVerification: {
    phoneNumber,
    setPhoneNumber,
    phonePrefixIndex,
    setPhonePrefixIndex,
    phonePrefixes,
    submitPhoneNumber,
    error,
    isSubmitting,
  },
  translate,
}) => {
  const phonePrefixStr = useMemo(
    () => `+${phonePrefixes[phonePrefixIndex]?.prefix ?? "1"} |`,
    [phonePrefixes, phonePrefixIndex],
  );

  return (
    <React.Fragment>
      <Modal.Body>
        <div className="verification-upsell-text-body">
          {translate("Description.VerificationGiftingProducts")}
        </div>
        <div
          id="upsell-phone"
          className={`${
            error ? "input-field-error" : ""
          } robux-gifting-phone-number-input-container input-field form-control`}
        >
          <div id="upsell-phonenumber" className="phone-input-row">
            <span className="phone-prefix-wrapper">
              <div className="phone-prefix-selected text">{phonePrefixStr}</div>
              <select
                className="phone-prefix-dropdown input-field rbx-select"
                disabled // re-enable if we're ready for non-US phone numbers
                onChange={e => {
                  setPhonePrefixIndex(parseInt(e.target.value, 10));
                }}
                value={phonePrefixIndex}
              >
                {phonePrefixes.map((option, key) => (
                  <option
                    className="prefix-option"
                    value={key}
                    key={`robux-phone-verification-prefix-${option.name}`}
                  >
                    {/* eslint-disable-next-line react/jsx-no-literals */}
                    {`${option.localizedName} +(${option.prefix})`}
                  </option>
                ))}
              </select>
            </span>
            <div id="upsell-phonenumber-divider" className="phone-divider" />
            <input
              type="tel"
              value={phoneNumber}
              className="phone-input form-control"
              placeholder={translate("Label.PhoneNumber")}
              autoComplete="tel-national"
              onChange={e => {
                setPhoneNumber(e.target.value);
              }}
              onKeyDown={event => {
                if (event.key === "Enter" && phoneNumber.length > 0) {
                  // interpret pressing Enter as a click to continue

                  submitPhoneNumber();
                }
              }}
            />
          </div>
        </div>
        {error && (
          <p className="input-field-error-text sms-code-error text-error modal-error-message">
            {translate(error)}
          </p>
        )}
        <div className="phone-verification-nonpublic-text text-description font-footer">
          {translate("Description.PhoneNumberNeverPublic")}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div
          className="text-description font-footer phone-verification-legal-text"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: translate("Description.ShortCodeLegalDisclaimer", {
              linkTagWithSmsTos,
              linkTagWithPrivacyPolicy,
              linkTagEnd,
              linkTagBreak,
            }),
          }}
        />
        <div className="buttons-section">
          <Button
            variant={Button.variants.growth}
            width={Button.widths.full}
            size={Button.sizes.medium}
            isDisabled={phoneNumber.length === 0 || isSubmitting}
            onClick={submitPhoneNumber}
          >
            {translate("Action.Continue")}
          </Button>
        </div>
      </Modal.Footer>
    </React.Fragment>
  );
};

export default withTranslations(RobuxPhoneSubmission, translationConfig);
