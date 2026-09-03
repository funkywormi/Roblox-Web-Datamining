import React, { useEffect, useState } from "react";
import { Button, Icon, Snackbar, Toggle } from "@rbx/foundation-ui";
import { useArTranslation } from "../../util/translate/arTranslation";
import { TranslateInputOrString } from "../../util/translate/translate";
import { useAbuseReportAnalytics } from "../../analytics/AbuseReportAnalyticsContext";
import { blockUser, isBlockedUser, unblockUser } from "../../api/userBlock";
import { getApiErrorMessage } from "../../analytics/analyticsService";
import Eyebrow from "../Eyebrow";
import Footer from "../Footer";
import { useLayoutSlots } from "../LayoutSlots";

type BlockToggleConfig = {
  label: TranslateInputOrString;
  description?: TranslateInputOrString;
  errorLabel: TranslateInputOrString;
  userId: string;
  blockedSnackbarMessage?: TranslateInputOrString;
  unblockedSnackbarMessage?: TranslateInputOrString;
};

type HelplineConfig = {
  buttonText: TranslateInputOrString;
  heading: TranslateInputOrString;
  href: string;
};

/*
 Block toggle states;
 - Loading, we don't show it nor anything below it to avoid layout shift
 - Finished loading, initially enabled, we hide the toggle.
 - Finished loading, initially off, we show the toggle and user can toggle back and forth.
 - Finished loading, but with error, we hide the toggle
 - Error on toggle action, we replace toggle with error message.
*/

type SnackbarState = {
  isVisible: boolean;
  message: string;
};

const useBlockToggle = (
  blockToggle: BlockToggleConfig | undefined,
  translateToStringOnly: (input: TranslateInputOrString) => string,
) => {
  const [state, setState] = useState<"loading" | "visible" | "hidden" | "error">(
    blockToggle ? "loading" : "hidden",
  );
  const [isBlocked, setIsBlocked] = useState<boolean | undefined>(undefined);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ isVisible: false, message: "" });
  const { sendEvent, EventName } = useAbuseReportAnalytics();

  const handleSnackbarClose = () => {
    setSnackbar({ isVisible: false, message: "" });
  };

  useEffect(() => {
    if (blockToggle?.userId) {
      isBlockedUser(blockToggle.userId)
        .then(val => {
          // Hide toggle if the user is already blocked
          setState(val ? "hidden" : "visible");
          setIsBlocked(val);
        })
        .catch((error: unknown) => {
          setState("hidden");
          sendEvent(EventName.Error, {
            error_message: getApiErrorMessage(
              "isBlockedUser",
              error,
              "Failed to check if user is blocked",
            ),
          });
        });
      sendEvent(EventName.IsUserBlockAvailable, {});
    } else {
      setState("hidden");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run on mount / userId changes
  }, [blockToggle?.userId]);

  const handleBlockToggle = (checked: boolean) => {
    if (!blockToggle?.userId) {
      return;
    }
    if (checked) {
      blockUser(blockToggle.userId)
        .then(() => {
          if (blockToggle.blockedSnackbarMessage) {
            setSnackbar({
              isVisible: true,
              message: translateToStringOnly(blockToggle.blockedSnackbarMessage),
            });
          }
        })
        .catch((error: unknown) => {
          setState("error");
          sendEvent(EventName.Error, {
            error_message: getApiErrorMessage("blockUser", error, "Failed to block user"),
          });
        });
      sendEvent(EventName.DidBlockUser, {});
    } else {
      unblockUser(blockToggle.userId)
        .then(() => {
          if (blockToggle.unblockedSnackbarMessage) {
            setSnackbar({
              isVisible: true,
              message: translateToStringOnly(blockToggle.unblockedSnackbarMessage),
            });
          }
        })
        .catch((error: unknown) => {
          setState("error");
          sendEvent(EventName.Error, {
            error_message: getApiErrorMessage("unblockUser", error, "Failed to unblock user"),
          });
        });
      sendEvent(EventName.DidUnblockUser, {});
    }
    setIsBlocked(checked);
  };

  return {
    /** Undefined means loading */
    isBlocked,
    blockToggleState: state,
    handleBlockToggle,
    snackbar,
    handleSnackbarClose,
  };
};

/**
 * AR Confirmation Node - shows after the user has submitted their report.
 */
const ConfirmationNode = ({
  onNext,
  isSubmitting,
  nextButtonText,
  message,
  blockToggle,
  helpline,
  title,
  eyebrow,
  footerItems,
}: {
  onNext?: () => void;
  isSubmitting?: boolean;
  nextButtonText: TranslateInputOrString;
  message: TranslateInputOrString;
  blockToggle?: BlockToggleConfig;
  helpline?: HelplineConfig;
  title: TranslateInputOrString;
  eyebrow?: TranslateInputOrString;
  footerItems?: TranslateInputOrString[];
}): React.ReactElement => {
  const { translate, translateToStringOnly } = useArTranslation();
  const { isBlocked, blockToggleState, handleBlockToggle, snackbar, handleSnackbarClose } =
    useBlockToggle(blockToggle, translateToStringOnly);
  const { sendEvent, EventName } = useAbuseReportAnalytics();
  const { Body, Actions, Description } = useLayoutSlots();

  useEffect(() => {
    if (helpline) {
      sendEvent(EventName.HelplineShown, {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run on mount
  }, []);

  return (
    <React.Fragment>
      <Body>
        <Eyebrow eyebrow={eyebrow} />
        <Description>
          <h3 className="text-heading-medium margin-y-none padding-bottom-medium">
            {translate(title)}
          </h3>
        </Description>
        <div className="text-body-small padding-bottom-medium">{translate(message)}</div>
        {blockToggle && blockToggleState === "visible" && (
          <div className="flex flex-col gap-small padding-xlarge bg-action-standard radius-medium">
            <Toggle
              className="[&_*]:cursor-pointer cursor-pointer"
              label={translateToStringOnly(blockToggle.label)}
              isDisabled={isBlocked === undefined}
              isChecked={Boolean(isBlocked)}
              onCheckedChange={handleBlockToggle}
              size="Medium"
              placement="End"
              hint={
                blockToggle.description ? translateToStringOnly(blockToggle.description) : undefined
              }
            />
          </div>
        )}
        {blockToggle && blockToggleState === "error" && (
          <div className="content-system-alert text-body-small padding-bottom-medium">
            {translate(blockToggle.errorLabel)}
          </div>
        )}
        {helpline && blockToggleState !== "loading" && (
          <React.Fragment>
            <p className="text-caption-medium margin-none padding-y-medium">
              {translate(helpline.heading)}
            </p>
            <Button
              as="a"
              onClick={() => {
                sendEvent(EventName.HelplineOpened, {});
              }}
              href={helpline.href}
              target="_blank"
              variant="Standard"
              size="Medium"
              className="width-full"
            >
              <div className="flex gap-small items-center">
                <Icon name="icon-regular-arrow-up-right-from-square" size="Small" />
                <span>{translate(helpline.buttonText)}</span>
              </div>
            </Button>
          </React.Fragment>
        )}
        {snackbar.isVisible && (
          <Snackbar title={snackbar.message} onClose={handleSnackbarClose} shouldAutoDismiss />
        )}
        <Footer items={footerItems} />
      </Body>
      {onNext && (
        <Actions>
          <Button
            onClick={onNext}
            className="width-full"
            isDisabled={isSubmitting}
            isLoading={isSubmitting}
          >
            {translate(nextButtonText)}
          </Button>
        </Actions>
      )}
    </React.Fragment>
  );
};

export default ConfirmationNode;
