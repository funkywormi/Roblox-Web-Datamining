import { type JSX } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { Button, DialogTitle } from "@rbx/foundation-ui";

import { Overlay } from "./Overlay";

export function GenericErrorModal({ onClose }: { onClose: () => void }): JSX.Element {
  const { translate } = useTranslation();
  const message = translate("Title.SomethingWentWrong");

  return (
    <Overlay onClose={onClose}>
      <div className="gap-large flex flex-col">
        <DialogTitle className="text-heading-medium content-emphasis margin-none">
          {message}
        </DialogTitle>
        <div className="gap-small flex flex-col">
          <Button variant="Emphasis" size="Medium" className="width-full" onClick={onClose}>
            {translate("Action.Close")}
          </Button>
        </div>
      </div>
    </Overlay>
  );
}
