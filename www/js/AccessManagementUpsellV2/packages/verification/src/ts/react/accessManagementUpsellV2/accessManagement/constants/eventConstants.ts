import { eventStreamService } from 'core-roblox-utilities';

export const EventConstants = {
  state: {
    U13To18: 'U13To18',
    U13To1318: 'U13To1318',
    U13ToU13: 'U13ToU13',
    U13ToU13NotEligible: 'U13ToU13NotEligible'
  },
  text: {
    IdvOrVpc: 'Verify Your Age/Parent Permission Needed',
    VPC: 'Parent Permission Needed',
    VpcNotEligible: 'Parent Permission Not Eligible',
    AskYourParent: 'Ask Your Parent',
    VerifyId: 'Verify ID',
    EmailMyParent: 'Email My Parent',
    AskNow: 'Ask Now',
    Cancel: 'X icon or "Cancel"',
    WeNeedToCheckYourAge: 'We need to check your age'
  },
  btn: {
    VerifyId: 'verifyId',
    EmailParent: 'emailParent',
    verifyCancel: 'verifyCancel',
    VpcNotEligibleModalClose: 'vpcNotEligibleModalClose',
    VpcNotEligibleLearnMore: 'vpcNotEligibleLearnMore',
    askParent: 'askParent',
    cancel: 'cancel'
  },
  context: {
    SettingsAgeChangeVerify: 'settingsAgeChangeVerify',
    SettingsAgeChangeVpcNotEligible: 'settingsAgeChangeVpcNotEligible',
    UpdateSetting: 'parentalEntrySettings',
    vpcPrologue: 'vpcPrologue',
    faePrologue: 'faePrologue'
  },
  eventName: {
    AuthPageload: 'authPageload',
    AuthButtonClick: 'authButtonClick'
  }
};
const generateState = (extraState?: string, settingName?: string) => {
  const extraStateString = extraState ? `${extraState}, ` : '';
  const settingNameString = settingName ? `settingName: ${settingName}, ` : '';
  return `${extraStateString}${settingNameString}`;
};

export function sendVerifyIdClickEvent(featureName: string, idvOnly: boolean): void {
  if (featureName === 'CanCorrectAge') {
    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthButtonClick,
      EventConstants.context.SettingsAgeChangeVerify,
      {
        btn: EventConstants.btn.VerifyId,
        state: idvOnly ? EventConstants.state.U13To18 : EventConstants.state.U13To1318,
        associatedText: EventConstants.text.VerifyId
      }
    );
  }
}

export function sendEmailParentClickEvent(
  featureName: string,
  vpcOnly: boolean,
  settingName?: string,
  recourseParameters?: Record<string, string>,
  source?: string
): void {
  if (featureName === 'CanCorrectAge') {
    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthButtonClick,
      EventConstants.context.SettingsAgeChangeVerify,
      {
        btn: EventConstants.btn.EmailParent,
        state: vpcOnly ? EventConstants.state.U13ToU13 : EventConstants.state.U13To1318,
        associatedText: EventConstants.text.EmailMyParent
      }
    );
  } else if (featureName === 'CanChangeSetting') {
    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthButtonClick,
      EventConstants.context.UpdateSetting,
      {
        btn: EventConstants.btn.EmailParent,
        state: generateState(undefined, settingName),
        associatedText: EventConstants.text.EmailMyParent
      }
    );
  } else if (featureName === 'CanRemoveParentManagedUserBlocks') {
    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthButtonClick,
      EventConstants.context.UpdateSetting,
      {
        btn: EventConstants.btn.EmailParent,
        state: `unblockUser ${recourseParameters?.friendUserId}`,
        associatedText: EventConstants.text.AskNow
      }
    );
  } else if (featureName === 'CanRemoveParentManagedExperienceBlocks') {
    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthButtonClick,
      EventConstants.context.UpdateSetting,
      {
        btn: EventConstants.btn.EmailParent,
        state: `unblockExperience ${recourseParameters?.universeId}`,
        associatedText: EventConstants.text.AskNow
      }
    );
  }
  if (vpcOnly && settingName) {
    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthButtonClick,
      EventConstants.context.vpcPrologue,
      {
        btn: EventConstants.btn.askParent,
        state: generateState(source, settingName),
        associatedText: EventConstants.text.AskNow
      }
    );
  }
}

function getEventStateForCanCorrectAge(prologueOrEpilogue: string) {
  let currentState;
  switch (prologueOrEpilogue) {
    case 'Idv':
      currentState = EventConstants.state.U13To18;
      break;
    case 'Vpc':
      currentState = EventConstants.state.U13ToU13;
      break;
    case 'IdvOrVpc':
      currentState = EventConstants.state.U13To1318;
      break;
    case 'VpcNotEligible':
      currentState = EventConstants.state.U13ToU13NotEligible;
      break;
    default:
      break;
  }
  return currentState;
}

export function sendVerifyCancelClickEvent(
  featureName: string,
  prologue: string,
  settingName?: string,
  recourseParameters?: Record<string, string>,
  source?: string
): void {
  if (featureName === 'CanCorrectAge') {
    const currentState = getEventStateForCanCorrectAge(prologue);

    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthButtonClick,
      EventConstants.context.SettingsAgeChangeVerify,
      {
        btn: EventConstants.btn.verifyCancel,
        state: currentState,
        associatedText: EventConstants.text.Cancel
      }
    );
  } else if (featureName === 'CanChangeSetting') {
    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthButtonClick,
      EventConstants.context.UpdateSetting,
      {
        btn: EventConstants.btn.verifyCancel,
        state: generateState(undefined, settingName),
        associatedText: EventConstants.text.Cancel
      }
    );
  } else if (featureName === 'CanRemoveParentManagedUserBlocks') {
    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthButtonClick,
      EventConstants.context.UpdateSetting,
      {
        btn: EventConstants.btn.verifyCancel,
        state: `unblockUser ${recourseParameters?.friendUserId}`,
        associatedText: EventConstants.text.Cancel
      }
    );
  } else if (featureName === 'CanRemoveParentManagedExperienceBlocks') {
    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthButtonClick,
      EventConstants.context.UpdateSetting,
      {
        btn: EventConstants.btn.verifyCancel,
        state: `unblockExperience ${recourseParameters?.universeId}`,
        associatedText: EventConstants.text.Cancel
      }
    );
  }

  if (settingName) {
    let context;
    switch (prologue) {
      case 'Vpc':
        context = EventConstants.context.vpcPrologue;
        break;
      case 'Fae':
        context = EventConstants.context.faePrologue;
        break;
      default:
        break;
    }

    if (context) {
      eventStreamService.sendEventWithTarget(EventConstants.eventName.AuthButtonClick, context, {
        btn: EventConstants.btn.cancel,
        state: generateState(source, settingName),
        associatedText: EventConstants.text.Cancel
      });
    }
  }
}

export function sendInitialUpsellPageLoadEvent(
  featureName: string,
  prologueOrEpilogue: string,
  settingName?: string,
  recourseParameters?: Record<string, string>,
  source?: string
): void {
  if (featureName === 'CanCorrectAge') {
    const currentState = getEventStateForCanCorrectAge(prologueOrEpilogue);

    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthPageload,
      EventConstants.context.SettingsAgeChangeVerify,
      {
        state: currentState,
        associatedText: EventConstants.text.IdvOrVpc
      }
    );
  } else if (featureName === 'CanChangeSetting') {
    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthPageload,
      EventConstants.context.UpdateSetting,
      {
        state: generateState(undefined, settingName),
        associatedText: EventConstants.text.VPC
      }
    );
  } else if (featureName === 'CanRemoveParentManagedUserBlocks') {
    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthPageload,
      EventConstants.context.UpdateSetting,
      {
        state: `unblockUser ${recourseParameters?.friendUserId}`,
        associatedText: EventConstants.text.AskYourParent
      }
    );
  } else if (featureName === 'CanRemoveParentManagedExperienceBlocks') {
    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthPageload,
      EventConstants.context.UpdateSetting,
      {
        state: `unblockExperience ${recourseParameters?.experienceId}`,
        associatedText: EventConstants.text.AskYourParent
      }
    );
  }

  if (settingName) {
    let context;
    let associatedText;
    switch (prologueOrEpilogue) {
      case 'Vpc':
        context = EventConstants.context.vpcPrologue;
        associatedText = EventConstants.text.AskYourParent;
        break;
      case 'Fae':
        context = EventConstants.context.faePrologue;
        associatedText = EventConstants.text.WeNeedToCheckYourAge;
        break;
      default:
        break;
    }

    if (context) {
      eventStreamService.sendEventWithTarget(EventConstants.eventName.AuthPageload, context, {
        state: generateState(source, settingName),
        associatedText
      });
    }
  }
}

export function sendVpcNotEligibleLearnMoreClickEvent(featureName: string): void {
  if (featureName === 'CanCorrectAge') {
    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthButtonClick,
      EventConstants.context.SettingsAgeChangeVpcNotEligible,
      {
        btn: EventConstants.btn.VpcNotEligibleLearnMore,
        state: EventConstants.state.U13ToU13,
        associatedText: EventConstants.text.VpcNotEligible
      }
    );
  }
}

export function sendVpcNotEligibleModalCloseClickEvent(featureName: string): void {
  if (featureName === 'CanCorrectAge') {
    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthButtonClick,
      EventConstants.context.SettingsAgeChangeVpcNotEligible,
      {
        btn: EventConstants.btn.VpcNotEligibleModalClose,
        state: EventConstants.state.U13ToU13,
        associatedText: EventConstants.text.VpcNotEligible
      }
    );
  }
}
