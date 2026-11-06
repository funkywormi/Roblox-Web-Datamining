import React from "react";
import { useTranslations } from "@rbx/www-common/i18n";
import PhoneUpsellModalContainer from "./phoneUpsellModal/container/PhoneUpsellModalContainer";
import { PhoneUpsellModalStateProvider } from "./phoneUpsellModal/stores/PhoneUpsellModalStoreContext";

type PhoneUpsellAppProps = {
  origin?: string;
  onClose?: (isPhoneVerified?: boolean) => void;
  existingPhoneNumber?: string | null;
  addPhoneRequireLegalTextCheckbox?: boolean;
  addPhoneHeadingKey?: string;
  addPhoneDescriptionKey?: string;
  addPhoneLegalTextKey?: string;
  addPhoneButtonKey?: string;
  beforeSuccess?: () => Promise<[string, string]> | [string, string];
  renderInWebview?: boolean;
};

function PhoneUpsellApp({
  origin,
  onClose = () => null,
  existingPhoneNumber = null,
  addPhoneRequireLegalTextCheckbox,
  addPhoneHeadingKey,
  addPhoneDescriptionKey,
  addPhoneLegalTextKey,
  addPhoneButtonKey,
  beforeSuccess,
  renderInWebview,
}: PhoneUpsellAppProps) {
  const translate = useTranslations("Feature.VerificationUpsell");
  return (
    <PhoneUpsellModalStateProvider>
      <PhoneUpsellModalContainer
        translate={translate}
        onClose={onClose}
        origin={origin}
        existingPhoneNumber={existingPhoneNumber}
        addPhoneRequireLegalTextCheckbox={addPhoneRequireLegalTextCheckbox}
        addPhoneHeadingKey={addPhoneHeadingKey}
        addPhoneDescriptionKey={addPhoneDescriptionKey}
        addPhoneLegalTextKey={addPhoneLegalTextKey}
        addPhoneButtonKey={addPhoneButtonKey}
        beforeSuccess={beforeSuccess}
        renderInWebview={renderInWebview}
      />
    </PhoneUpsellModalStateProvider>
  );
}

export default PhoneUpsellApp;
