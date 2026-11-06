import React from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import EmailUpsellModalContainer from "./emailUpsellModal/container/EmailUpsellModalContainer";
import { EmailUpsellModalStateProvider } from "./emailUpsellModal/stores/EmailUpsellModalStoreContext";

function App() {
  const { translate } = useTranslation();
  return (
    <EmailUpsellModalStateProvider>
      <EmailUpsellModalContainer translate={translate} />
    </EmailUpsellModalStateProvider>
  );
}

export default App;
