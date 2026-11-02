import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@rbx/foundation-ui";
import { Modal } from "@rbx/core-ui/legacy/react-style-guide";
import { useTranslations } from "@rbx/www-common/i18n";
import { getCurrentUser } from "@rbx/www-common/user";
import { TUserData } from "@rbx/authentication-common/types/userTypes";
import {
  TLoggedInUsers,
  TRenderBaseConfirmationModal,
  TSwitchParams,
} from "@rbx/authentication-common/types/accountSwitcherTypes";
import EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";
import AccountSwitcher from "../components/AccountSwitcher";
import AccountSwitcherModal from "../components/AccountSwitcherModal";
import { switchAccount } from "../services/accountSwitcherService";
import {
  commonUiTranslationKeys,
  confirmationModalOrigins,
  errorCasePlaceholderStrings,
  modalContainerId,
  ModalType,
} from "../constants/accountSwitcherConstants";
import {
  storeAccountSwitcherBlob,
  getStoredAccountSwitcherBlob,
  parseLoggedInUsers,
  hasAccountSwitcherInvalidSessionError,
} from "../utils/accountSwitcherUtils";
import {
  getAccountSwitcherListExperiment,
  logAccountSwitcherListExperimentExposure,
} from "../utils/accountSwitcherListVariantUtils";
import {
  AccountSwitcherAvatarContext,
  type AccountSwitcherAvatarHeadshot,
} from "../components/AccountSwitcherAvatar";
import type { AccountSwitcherListVariant } from "../components/FoundationAccountSwitcherList";
import {
  sendAccountSwitchEvent,
  sendAccountSwitcherSwitchResultEvent,
  sendDismissAccountSwitcherEvent,
  sendAuthButtonClickEvent,
} from "../services/eventService";

// The confirmation modal renders through the .NET AccountSwitcher bundle global, read at call time
// so this container also loads where window.Roblox doesn't exist (Next.js); there it's a no-op.
const renderBaseConfirmationModal: TRenderBaseConfirmationModal = params => {
  if (typeof window === "undefined") {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- legacy bundle global, absent on Next.js
  const { Roblox } = window as {
    Roblox?: {
      AccountSwitcherService?: { renderBaseConfirmationModal?: TRenderBaseConfirmationModal };
    };
  };
  return Roblox?.AccountSwitcherService?.renderBaseConfirmationModal?.(params) ?? false;
};

export type accountSwitcherContainerProps = {
  modalType?: ModalType;
  titleText?: string;
  helpText?: string;
  onAccountSwitched: (targetUserId: number) => void;
  onConfirmationSuccessCallback?: () => void;
  handleAddAccount: () => void;
  suppressAddAccountRow?: boolean;
  removeInvalidActiveUser?: boolean;
  isModal?: boolean;
  loggedInUsers?: TLoggedInUsers;
};

const AccountSwitcherContainerContent = ({
  modalType = ModalType.AccountSwitcherModalType,
  titleText,
  helpText,
  onAccountSwitched,
  handleAddAccount,
  suppressAddAccountRow = false,
  removeInvalidActiveUser = false,
  isModal,
  loggedInUsers,
}: accountSwitcherContainerProps): JSX.Element => {
  const translate = useTranslations("Authentication.AccountSwitch");
  const translateControls = useTranslations("CommonUI.Controls");
  const [isModalOpen, setIsModalOpen] = useState(!!loggedInUsers);
  const [currentModal] = useState(modalType);
  const [accountListVariant, setAccountListVariant] =
    useState<AccountSwitcherListVariant>("legacy");
  const [isAccountListVariantResolved, setIsAccountListVariantResolved] = useState(false);
  const [isAccountListExperimentEnrolled, setIsAccountListExperimentEnrolled] = useState(false);
  const hasLoggedAccountListExperimentExposure = useRef(false);
  const [users, setUsers] = useState<TLoggedInUsers>({
    activeUser: {} as TUserData,
    usersAvailableForSwitching: [],
    isAccountLimitReached: false,
  });

  // Only allow showing as modal if user is authenticated
  const shouldShowAsModal = getCurrentUser() != null && isModal;

  function renderSwitchAccountErrorConfirmationModal() {
    const switcherErrorConfirmationModalParameters = {
      containerId: modalContainerId,
      origin: confirmationModalOrigins.UnavailableError,
      localizedTitleText: translate(errorCasePlaceholderStrings.UnavailableHeaderText),
      localizedBodyText: translate(errorCasePlaceholderStrings.CannotBeSwitchedHelpText),
      localizedPrimaryButtonText: translateControls(commonUiTranslationKeys.ActionOK),
      primaryButtonCallback: () => {
        // positive button takes user to login page
        handleAddAccount();
      },
    };
    renderBaseConfirmationModal(switcherErrorConfirmationModalParameters);
  }

  const getContextForLogging = () => {
    return shouldShowAsModal
      ? EVENT_CONSTANTS.context.accountSwitcherModal
      : EVENT_CONSTANTS.context.accountSwitcherLogin;
  };

  const getAccountListVariantEventParams = () =>
    shouldShowAsModal ? { accountSwitcherComponentVariant: accountListVariant } : {};

  const handleAccountSelection = async (accountSelectorUserId: number) => {
    const blob = getStoredAccountSwitcherBlob();
    if (blob) {
      const switchParam: TSwitchParams = {
        switched_from_user_id: getCurrentUser()?.id,
        switched_to_user_id: accountSelectorUserId.toString(),
        encrypted_users_data_blob: blob,
      };
      const accountSwitchStartedAt = Date.now();
      try {
        // if the target account is invalid, the call to `switchAccount()` will replace the blob with a new one that does not contain invalid target account
        sendAccountSwitchEvent(
          getContextForLogging(),
          accountSelectorUserId.toString(),
          getAccountListVariantEventParams(),
        );
        const switchResponse = await switchAccount(switchParam);
        storeAccountSwitcherBlob(switchResponse.encrypted_users_data_blob);
        if (switchResponse) {
          if (hasAccountSwitcherInvalidSessionError(switchResponse)) {
            sendAccountSwitcherSwitchResultEvent(
              getContextForLogging(),
              EVENT_CONSTANTS.state.accountSwitcher.invalidSession,
              Date.now() - accountSwitchStartedAt,
              getAccountListVariantEventParams(),
            );
            renderSwitchAccountErrorConfirmationModal();
            return;
          }
          sendAccountSwitcherSwitchResultEvent(
            getContextForLogging(),
            EVENT_CONSTANTS.state.accountSwitcher.switchSuccess,
            Date.now() - accountSwitchStartedAt,
            getAccountListVariantEventParams(),
          );
          onAccountSwitched(accountSelectorUserId);
        }
      } catch {
        sendAccountSwitcherSwitchResultEvent(
          getContextForLogging(),
          EVENT_CONSTANTS.state.accountSwitcher.requestFailed,
          Date.now() - accountSwitchStartedAt,
          getAccountListVariantEventParams(),
        );
        renderSwitchAccountErrorConfirmationModal();
      }
    }
  };

  const onUsersUpdated = (updatedUsers: TLoggedInUsers) => {
    // TODO: check if active user id is different from authenticated user id
    setUsers(updatedUsers);
  };

  useEffect(() => {
    const updateUsers = async () => {
      if (loggedInUsers) {
        onUsersUpdated(loggedInUsers);
      } else {
        // if loggedInUsers was not set, get it now.
        // TODO: handle errors
        let userResponse: TLoggedInUsers;
        try {
          userResponse = await parseLoggedInUsers(removeInvalidActiveUser);
        } catch {
          const switcherModalPopulationFailureParams = {
            containerId: modalContainerId,
            origin: confirmationModalOrigins.UnavailableError,
            localizedTitleText: translate(errorCasePlaceholderStrings.UnavailableHeaderText),
            localizedBodyText: translate(errorCasePlaceholderStrings.NotWorkingTryLaterText),
            localizedPrimaryButtonText: translateControls(commonUiTranslationKeys.ActionOK),
            primaryButtonCallback: () => {
              // no op
            },
          };
          renderBaseConfirmationModal(switcherModalPopulationFailureParams);
          return;
        }
        const { activeUser, usersAvailableForSwitching, isAccountLimitReached, loggedOutUser } =
          userResponse;

        // TODO: check if active user id is different from authenticated user id
        onUsersUpdated({
          activeUser,
          usersAvailableForSwitching,
          isAccountLimitReached,
          loggedOutUser,
        });
      }

      setIsModalOpen(true);
    };
    // TODO: handle errors
    // eslint-disable-next-line no-void
    void updateUsers().catch();
  }, [loggedInUsers, removeInvalidActiveUser]);

  useEffect(() => {
    const updateAccountListVariant = async () => {
      const { isEnrolled, variant } = await getAccountSwitcherListExperiment();
      setAccountListVariant(variant);
      setIsAccountListExperimentEnrolled(isEnrolled);
      setIsAccountListVariantResolved(true);
    };

    // eslint-disable-next-line no-void
    void updateAccountListVariant().catch(() => {
      setAccountListVariant("legacy");
      setIsAccountListExperimentEnrolled(false);
      setIsAccountListVariantResolved(true);
    });
  }, []);

  useEffect(() => {
    if (
      !hasLoggedAccountListExperimentExposure.current &&
      shouldShowAsModal &&
      currentModal === ModalType.AccountSwitcherModalType &&
      isModalOpen &&
      isAccountListVariantResolved &&
      isAccountListExperimentEnrolled
    ) {
      hasLoggedAccountListExperimentExposure.current = true;
      logAccountSwitcherListExperimentExposure();
    }
  }, [
    currentModal,
    isAccountListExperimentEnrolled,
    isAccountListVariantResolved,
    isModalOpen,
    shouldShowAsModal,
  ]);

  const handleModalDismiss = () => {
    setIsModalOpen(false);
    sendDismissAccountSwitcherEvent(getAccountListVariantEventParams());
  };

  function handleAddAccountAndSendClickLog() {
    sendAuthButtonClickEvent(
      getContextForLogging(),
      EVENT_CONSTANTS.btn.addAccount,
      getAccountListVariantEventParams(),
    );
    handleAddAccount();
  }

  if (
    shouldShowAsModal &&
    currentModal === ModalType.AccountSwitcherModalType &&
    !isAccountListVariantResolved
  ) {
    return <React.Fragment />;
  }

  if (shouldShowAsModal) {
    if (
      currentModal === ModalType.AccountSwitcherModalType &&
      accountListVariant === "foundation" &&
      isAccountListVariantResolved
    ) {
      return (
        <Dialog
          open={isModalOpen}
          isModal
          size="Small"
          type="Default"
          hasCloseAffordance={false}
          onOpenChange={open => {
            if (!open) {
              handleModalDismiss();
            }
          }}
        >
          <DialogContent className="account-switcher-modal account-switcher-foundation-dialog">
            <AccountSwitcherModal
              users={users.usersAvailableForSwitching}
              isAccountLimitReached={users.isAccountLimitReached}
              onAccountSelection={handleAccountSelection}
              handleAddAccount={handleAddAccountAndSendClickLog}
              suppressAddAccountRow={suppressAddAccountRow}
              handleModalDismiss={handleModalDismiss}
              activeUser={users.activeUser}
              accountListVariant={accountListVariant}
              isAccountListVariantResolved={isAccountListVariantResolved}
            />
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Modal
        className="account-switcher-modal"
        show={isModalOpen}
        onHide={handleModalDismiss}
        size="sm"
      >
        {currentModal === ModalType.AccountSwitcherModalType && (
          <AccountSwitcherModal
            users={users.usersAvailableForSwitching}
            isAccountLimitReached={users.isAccountLimitReached}
            onAccountSelection={handleAccountSelection}
            handleAddAccount={handleAddAccountAndSendClickLog}
            suppressAddAccountRow={suppressAddAccountRow}
            handleModalDismiss={handleModalDismiss}
            activeUser={users.activeUser}
            accountListVariant={accountListVariant}
            isAccountListVariantResolved={isAccountListVariantResolved}
          />
        )}
      </Modal>
    );
  }

  return (
    <div className="account-switcher-container">
      {users.usersAvailableForSwitching?.length > 0 && (
        <AccountSwitcher
          users={users.usersAvailableForSwitching}
          titleText={titleText}
          helpText={helpText}
          onAccountSelection={handleAccountSelection}
          handleAddAccount={handleAddAccountAndSendClickLog}
          suppressAddAccountRow={suppressAddAccountRow}
        />
      )}
    </div>
  );
};

export const AccountSwitcherContainer = ({
  AvatarHeadshot,
  ...props
}: accountSwitcherContainerProps & {
  AvatarHeadshot: AccountSwitcherAvatarHeadshot;
}): JSX.Element => (
  <AccountSwitcherAvatarContext.Provider value={AvatarHeadshot}>
    <AccountSwitcherContainerContent {...props} />
  </AccountSwitcherAvatarContext.Provider>
);

export default AccountSwitcherContainer;
