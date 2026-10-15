import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useQuery } from "@tanstack/react-query";
import "../trustedFriends.css";
import { AccessManagementUpsellV2Service } from "Roblox";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
  Icon,
  Snackbar,
} from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { trustedFriendActionQueryKey } from "../constants/trustedFriendQueryKeys";
import {
  TRUSTED_FRIENDS_HELP_ARTICLE_URL,
  TrustedFriendAction,
  isMappedTrustedFriendAction,
  trustedFriendActionToModalVariant,
  trustedFriendsModalVariantToText,
  trustedFriendsTranslationKeys,
  type TrustedFriendActionEnum,
  type TrustedFriendsModalVariant,
} from "../constants/trustedFriendsModal";
import { useGetTrustedFriendsModalButtons } from "../hooks/useGetTrustedFriendsModalButtons";
import { getTrustedFriendAction } from "../services/trustedFriends";
import SocialMetadataSection from "./SocialMetadataSection";

export type TrustedFriendsModalProps = {
  open: boolean;
  onClose: (isSuccess: boolean) => void;
  userId: number;
  linkTokens?: number[];
  onComplete?: () => Promise<void>;
};

type TrustedFriendsModalContentProps = TrustedFriendsModalProps & {
  modalVariant: TrustedFriendsModalVariant;
  trustedFriendAction?: TrustedFriendActionEnum;
  setToastMessage: Dispatch<SetStateAction<string | null>>;
};

const TrustedFriendsModal = ({
  open,
  onClose,
  userId,
  linkTokens,
  onComplete,
  modalVariant,
  trustedFriendAction,
  setToastMessage,
}: TrustedFriendsModalContentProps): React.JSX.Element => {
  const { translate } = useTranslation();

  const { buttonConfig, performPrimaryAction } = useGetTrustedFriendsModalButtons({
    userId,
    linkTokens,
    trustedFriendAction,
    onClose,
    setToastMessage,
    onComplete,
  });

  const handleDialogOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        onClose(false);
      }
    },
    [onClose],
  );

  const copyEntry = useMemo(() => trustedFriendsModalVariantToText[modalVariant], [modalVariant]);

  const onPrimaryButtonClick = useCallback(() => {
    if (buttonConfig?.primary.isDisabled) {
      return;
    }
    performPrimaryAction().catch(() => undefined);
  }, [buttonConfig, performPrimaryAction]);

  return (
    <Dialog
      open={open}
      onOpenChange={handleDialogOpenChange}
      size="Medium"
      isModal
      hasCloseAffordance
      closeLabel="Close"
    >
      <DialogContent>
        <DialogBody className="flex flex-col gap-medium">
          <DialogTitle className="text-heading-small margin-none">
            {translate(copyEntry.title)}
          </DialogTitle>
          <div className="text-body-medium content-default flex flex-col gap-xsmall">
            {translate(copyEntry.description)}
            <a
              href={TRUSTED_FRIENDS_HELP_ARTICLE_URL}
              target="_blank"
              rel="noreferrer"
              className="trusted-friends-modal-learn-more-link text-body-medium content-default"
            >
              {translate(trustedFriendsTranslationKeys.learnMore)}
            </a>
          </div>
          <SocialMetadataSection userId={userId} />
        </DialogBody>
        <DialogFooter className="flex flex-col gap-small">
          <div className="flex width-full min-width-0 flex-row gap-small items-center">
            <Button
              variant="Emphasis"
              size="Medium"
              className="fill min-width-0 flex-1 basis-0"
              isDisabled={buttonConfig?.primary.isDisabled === true}
              onClick={onPrimaryButtonClick}
            >
              <span className="flex width-full min-width-0 flex-row items-center justify-center gap-small">
                {buttonConfig?.primary.showVpcIcon ? (
                  <Icon
                    name="icon-regular-lock-closed"
                    size="Medium"
                    className="flex shrink-0 items-center justify-center"
                    aria-hidden
                  />
                ) : null}
                <span className="min-width-0">
                  {translate(buttonConfig?.primary.textKey ?? "")}
                </span>
              </span>
            </Button>
            {buttonConfig?.secondary ? (
              <Button
                variant="Standard"
                size="Medium"
                className="fill min-width-0 flex-1 basis-0"
                onClick={() => {
                  onClose(false);
                }}
              >
                {translate(buttonConfig.secondary.textKey)}
              </Button>
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const TrustedFriendsModalActionsPreCheck = ({
  open,
  onClose,
  userId,
  linkTokens,
  onComplete,
}: TrustedFriendsModalProps): React.JSX.Element | null => {
  const { translate } = useTranslation();

  const {
    data: trustedFriendAction,
    isFetched: isTrustedFriendActionFetched,
    refetch,
  } = useQuery({
    queryKey: trustedFriendActionQueryKey(userId, linkTokens),
    queryFn: () => getTrustedFriendAction(userId, { friendRequestToken: linkTokens }),
    enabled: open,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const dismissToast = useCallback((): void => {
    setToastMessage(null);
  }, []);

  const modalVariant = useMemo((): TrustedFriendsModalVariant | "pending" | "invalid" => {
    if (!open || !isTrustedFriendActionFetched) {
      return "pending";
    }
    if (!trustedFriendAction || !isMappedTrustedFriendAction(trustedFriendAction)) {
      return "invalid";
    }

    return trustedFriendActionToModalVariant[trustedFriendAction];
  }, [open, isTrustedFriendActionFetched, trustedFriendAction]);

  const startUpsell = useCallback(async (): Promise<void> => {
    try {
      const success = await AccessManagementUpsellV2Service.startAccessManagementUpsell({
        featureName: "TriggerAgeCheckUpsellIncludingVPC",
        namespace: "core_content/CoreContent",
        isAsyncCall: false,
        usePrologue: true,
        featureSpecificData: {
          context: "trusted-friends-modal",
        },
      });
      if (success) {
        refetch().catch(() => undefined);
      } else {
        onClose(false);
      }
    } catch {
      onClose(false);
    }
  }, [onClose, refetch]);

  useEffect(() => {
    if (modalVariant === "pending") {
      return;
    }

    if (trustedFriendAction === TrustedFriendAction.UnlockTrustedFriendByFAE) {
      startUpsell().catch(() => undefined);
      return;
    }

    if (modalVariant === "invalid") {
      setToastMessage(translate(trustedFriendsTranslationKeys.genericError));
      onClose(false);
    }
  }, [modalVariant, trustedFriendAction, translate, onClose, startUpsell]);

  const shouldShowModal = !(!open || modalVariant === "pending" || modalVariant === "invalid");

  return (
    <React.Fragment>
      {toastMessage ? (
        <Snackbar title={toastMessage} onClose={dismissToast} shouldAutoDismiss />
      ) : null}

      {shouldShowModal && (
        <TrustedFriendsModal
          open={open}
          onClose={onClose}
          userId={userId}
          linkTokens={linkTokens}
          onComplete={onComplete}
          modalVariant={modalVariant}
          trustedFriendAction={trustedFriendAction}
          setToastMessage={setToastMessage}
        />
      )}
    </React.Fragment>
  );
};

export default TrustedFriendsModalActionsPreCheck;
