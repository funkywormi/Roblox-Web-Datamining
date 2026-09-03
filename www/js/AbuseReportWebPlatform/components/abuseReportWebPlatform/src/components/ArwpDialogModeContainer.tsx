import React, { useState, useCallback } from "react";
import { AbuseReportDialog } from "@rbx/abuse-report-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { translateHtml } from "@rbx/translation-utils";

interface ArwpDialogModeContainerProps {
  abuseVector: string;
  targetIdStr: string;
}

/** Message shown centered on the page after the dialog is closed */
const ClosedMessage = ({ onReopen }: { onReopen: () => void }) => {
  const { translate } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-height-[50vh] text-align-x-center padding-x-large gap-medium">
      <h2 className=" text-heading-small">{translate("Title.AllDone")}</h2>
      <div className="text-body-large max-width-[350px]">
        <p>{translate("Message.AllDoneDialog1")}</p>
        <p>
          {translateHtml(translate, "Message.AllDoneDialog2", [
            {
              opening: "linkStart",
              closing: "linkEnd",
              render: children => (
                <button
                  type="button"
                  onClick={onReopen}
                  className="bg-none stroke-none cursor-pointer padding-none [text-decoration:underline] [text-decoration-skip-ink:none]"
                >
                  {children}
                </button>
              ),
            },
          ])}
        </p>
      </div>
    </div>
  );
};

const ArwpDialogModeContainer = ({ abuseVector, targetIdStr }: ArwpDialogModeContainerProps) => {
  const [open, setOpen] = useState(true);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleReopen = useCallback(() => {
    setOpen(true);
  }, []);

  return (
    <React.Fragment>
      <AbuseReportDialog
        abuseVector={abuseVector}
        targetIdStr={targetIdStr}
        open={open}
        onClose={handleClose}
      />
      {!open && <ClosedMessage onReopen={handleReopen} />}
    </React.Fragment>
  );
};

export default ArwpDialogModeContainer;
