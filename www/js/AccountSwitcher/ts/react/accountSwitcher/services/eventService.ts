import { eventStreamService } from 'core-roblox-utilities';
import EVENT_CONSTANTS from '../../common/constants/eventsConstants';
import { confirmationModalOrigins } from '../constants/accountSwitcherConstants';
import type { AccountSwitcherListVariant } from '../components/FoundationAccountSwitcherList';

type Context = typeof EVENT_CONSTANTS.context[keyof typeof EVENT_CONSTANTS.context];
type Btn = typeof EVENT_CONSTANTS.btn[keyof typeof EVENT_CONSTANTS.btn];
type AccountSwitcherSwitchOutcome = typeof EVENT_CONSTANTS.state.accountSwitcher[keyof typeof EVENT_CONSTANTS.state.accountSwitcher];
export type ConfirmationModalOrigins = typeof confirmationModalOrigins[keyof typeof confirmationModalOrigins];

type AccountSwitcherVariantEventParams = {
  accountSwitcherComponentVariant?: AccountSwitcherListVariant;
};

type AccountSwitcherShownEventParams = AccountSwitcherVariantEventParams & {
  hasActiveAccount?: number;
  switchableAccountCount?: number;
};

/**
 * Log event for account switcher modal shown
 * @param userIdsCsv comma separated list of IDs of available users to switch to
 */
export const sendShowAccountSwitcherShownEvent = (
  userIdsCsv: string,
  eventParams: AccountSwitcherShownEventParams = {}
): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authModalShown,
    EVENT_CONSTANTS.context.accountSwitcherModal,
    {
      field: EVENT_CONSTANTS.field.accountSwitcher,
      state: userIdsCsv,
      ...eventParams
    }
  );
};

/**
 * Log event for account switcher modal dismissed
 */
export const sendDismissAccountSwitcherEvent = (
  eventParams: AccountSwitcherVariantEventParams = {}
): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    EVENT_CONSTANTS.context.accountSwitcherModal,
    {
      btn: EVENT_CONSTANTS.btn.dismiss,
      ...eventParams
    }
  );
};

/**
 * Log account switch event
 * @param context where the event is being logged from (e.g. accountSwitcherModal, accountSwitcherLogin)
 * @param userId user id of the account being switched to
 */
export const sendAccountSwitchEvent = (
  context: Context,
  userId: string,
  eventParams: AccountSwitcherVariantEventParams = {}
): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    context,
    {
      btn: EVENT_CONSTANTS.btn.switch,
      state: userId,
      ...eventParams
    }
  );
};

/**
 * Log the result and duration of an account switch request.
 */
export const sendAccountSwitcherSwitchResultEvent = (
  context: Context,
  outcome: AccountSwitcherSwitchOutcome,
  elapsedTime: number,
  eventParams: AccountSwitcherVariantEventParams = {}
): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authOperationTiming,
    context,
    {
      state: outcome,
      elapsedTime: Math.round(elapsedTime).toString(),
      ...eventParams
    }
  );
};

/**
 * Log errors that occur on the client. This can be any browser operation or unexpected network call failure
 * @param context where the error is coming from
 * @param state what the error was
 */
export const sendAuthClientErrorEvent = (
  context: Context,
  state: string,
  eventParams: AccountSwitcherVariantEventParams = {}
): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authClientError,
    context,
    {
      state,
      ...eventParams
    }
  );
};

/**
 * Log event for account switcher confirmation modal shown. Typically this is used for a 1 or 2 button modal.
 * @param state: what the confirmation modal is for
 */
export const sendShowAccountSwitcherConfirmationModalShownEvent = (state: string): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authModalShown,
    EVENT_CONSTANTS.context.accountSwitcherConfirmation,
    {
      state
    }
  );
};

/**
 * Log event for a button click on the account switcher confirmation modal
 * @param state: what the confirmation modal is for
 */
export const sendAccountSwitcherConfirmationModalButtonClickEvent = (
  state: string,
  btn: Btn
): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    EVENT_CONSTANTS.context.accountSwitcherConfirmation,
    {
      state,
      btn
    }
  );
};

export const sendAuthButtonClickEvent = (
  context: Context,
  btn: Btn,
  eventParams: AccountSwitcherVariantEventParams = {}
): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    context,
    {
      btn,
      ...eventParams
    }
  );
};
