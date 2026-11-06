import React from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { ContactMethodPromptModalStateProvider } from "./contactMethodPromptModal/stores/ContactMethodPromptModalStoreContext";
import ContactMethodPromptModalContainer from "./contactMethodPromptModal/container/ContactMethodPromptModalContainer";

type ContactMethodPromptAppProps = {
  origin: string;
  section: string;
};

function ContactMethodPromptApp({ origin, section }: ContactMethodPromptAppProps) {
  const { translate } = useTranslation();
  return (
    <ContactMethodPromptModalStateProvider>
      <ContactMethodPromptModalContainer translate={translate} origin={origin} section={section} />
    </ContactMethodPromptModalStateProvider>
  );
}

export default ContactMethodPromptApp;
