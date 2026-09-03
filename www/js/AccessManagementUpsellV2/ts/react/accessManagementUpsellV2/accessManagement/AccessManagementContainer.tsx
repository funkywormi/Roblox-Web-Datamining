import React, { useEffect, useRef, useState } from 'react';
import { TranslateFunction } from 'react-utilities';
import { Modal } from 'react-style-guide';
import { useSelector } from 'react-redux';
import { TFeatureSpecificData } from 'Roblox';
import {
  resetAccessManagementStore,
  selectAccessManagement,
  selectCurrentStage,
  selectFeatureAccess,
  selectShowUpsell,
  selectVerificationStageRecourse,
  selectPrologueStatus,
  setRedirectLink,
  setStage,
  fetchFeatureAccess,
  setAmpFeatureCheckData,
  setPrologueUsed,
  setNamespace
} from './accessManagementSlice';
import { useAppDispatch } from '../store';
import { ModalEvent, AccessManagementUpsellEventParams } from './constants/viewConstants';
import EmailVerificationContainer from '../recourses/emailVerification/EmailVerificationContainer';
import IDVerificationContainer from '../recourses/IDVerification/IDVerificationContainer';
import FAEContainer from '../recourses/IDVerification/FAEContainer';
import { Access, UpsellStage, Recourse, PersonaTemplate, WizardIntent } from '../enums';
import Epilogue from './components/Epilogue';
import ParentalRequestContainer from '../recourses/parentalRequest/ParentalRequestContainer';
import Prologue from './components/Prologue';
import LoadingPage from './components/LoadingPage';
import useExperiments from '../hooks/useExperiments';
import vpcUpsellExperimentLayer from './constants/experimentConstants';
import ExpNewChildModal from '../enums/ExpNewChildModal';
import UpdateSettingsContainer from '../recourses/settings/UpdateSettingsContainer';
import UserSetting from '../../legallySensitiveContent/enums/UserSetting';
import VPCForFAETransformContainer from '../recourses/parentalRequest/VPCForFAETransformContainer';
import { TVpcV2Handoff } from '../types/AmpTypes';

function AccessManagementContainer({
  translate,
  vpcV2Handoff
}: {
  translate: TranslateFunction;
  vpcV2Handoff: TVpcV2Handoff;
}): React.ReactElement | null {
  let displayContainer;
  const dispatch = useAppDispatch();
  const currentStage = useSelector(selectCurrentStage);
  const featureAccess = useSelector(selectFeatureAccess);
  const showUpsellModal = useSelector(selectShowUpsell);
  const isPrologueUsed = useSelector(selectPrologueStatus);
  const { loading } = useSelector(selectAccessManagement);
  const verificationStageRecourse = useSelector(selectVerificationStageRecourse);
  const [wizardIntent, setWizardIntent] = useState<WizardIntent | undefined>();
  const [onHidecallback, setOnHideCallback] = useState<(access: Access) => string>(
    (access: Access) => access
  );
  const [recourseParameters, setRecourseParameters] = useState<Record<string, string> | null>({}); // Parameters passed by the caller of the AMP Upsell
  const [featureSpecificParams, setFeatureSpecificParams] = useState<TFeatureSpecificData | null>();

  const [asyncExit, setAsyncExit] = useState<boolean>(false);
  const [shouldSetStagePrologue, setshouldSetStagePrologue] = useState<boolean>(false);
  // Undefined while GUAC is loading, so the v1 VPC modal does not flash before a v2 handoff.
  const [vpcV2PolicyEnabled, setVpcV2PolicyEnabled] = useState<boolean | undefined>(undefined);
  const vpcHandoffRequest = useRef<{
    isAsyncCall: boolean;
    recourseData: Record<string, string> | null;
    closeCallback: (access: Access) => string;
  } | null>(null);

  const expChildModalType =
    (useExperiments(vpcUpsellExperimentLayer)?.expNewChildModal as ExpNewChildModal) ??
    ExpNewChildModal.control;
  async function onAccessManagementCustomEvent(
    event: CustomEvent<AccessManagementUpsellEventParams>
  ) {
    const {
      featureName,
      redirectLink,
      ampFeatureCheckData,
      isAsyncCall,
      usePrologue: prologueAllowed,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ampRecourseData,
      featureSpecificData,
      closeCallback,
      namespace,
      wizardIntent: wizardIntentArg
    } = event.detail;
    setOnHideCallback(() => (access: Access): string => closeCallback(access));
    setVpcV2PolicyEnabled(undefined);
    vpcHandoffRequest.current = {
      isAsyncCall,
      recourseData: (ampRecourseData as Record<string, string> | null) ?? {},
      closeCallback
    };
    try {
      await dispatch(fetchFeatureAccess({ featureName, ampFeatureCheckData, namespace }));
    } catch (error) {
      // Handle error if needed
    }

    dispatch(setRedirectLink(redirectLink));

    setAsyncExit(isAsyncCall);

    if (ampFeatureCheckData) {
      dispatch(setAmpFeatureCheckData(ampFeatureCheckData));
    }
    if (namespace) {
      dispatch(setNamespace(namespace));
    }
    if (ampRecourseData) {
      setRecourseParameters(ampRecourseData);
    }

    if (featureSpecificData) {
      setFeatureSpecificParams(featureSpecificData);
    }

    if (wizardIntentArg) {
      setWizardIntent(wizardIntentArg);
    }

    // Only some experiment variants include a prologue (including control)
    const experimentVersionIncludesPrologue =
      expChildModalType === ExpNewChildModal.control ||
      expChildModalType === ExpNewChildModal.newPrologueNoVisual ||
      expChildModalType === ExpNewChildModal.newPrologueVisual;

    // Only show the prologue if we are both in a context that allows a prologue and the experiment variant includes a prologue
    const usePrologue = prologueAllowed && experimentVersionIncludesPrologue;
    if (usePrologue) {
      dispatch(setPrologueUsed(true));
      setshouldSetStagePrologue(true);
    } else {
      dispatch(setStage(UpsellStage.Verification));
    }
  }

  useEffect(() => {
    const handleEvent = onAccessManagementCustomEvent as EventListener;

    window.addEventListener(ModalEvent.StartAccessManagementUpsell, handleEvent);

    return () => window.removeEventListener(ModalEvent.StartAccessManagementUpsell, handleEvent);
  }, [expChildModalType]);

  useEffect(() => {
    const noopAccessState = [Access.Granted, Access.Denied];
    if (featureAccess?.loading) {
      return;
    }
    if (featureAccess?.data?.access && noopAccessState.includes(featureAccess.data.access)) {
      // For the appeals intent we intentionally do NOT fire the caller's close
      // callback here. Appeals skips the wizard's "Verification Successful" screen
      // and auto-closes from IDVerificationContainer once access is granted (it
      // calls onHide, which routes back through onHideFunction below). Resolving
      // here as well would let the caller open its appeal modal a beat early,
      // before the wizard tears down. So we leave the single resolve to teardown.
      if (
        featureAccess?.data?.featureName !== 'CanCorrectAge' &&
        wizardIntent !== WizardIntent.Appeals
      ) {
        onHidecallback(featureAccess.data.access);
      }
    }

    if (featureAccess?.data?.recourses?.length > 0 && shouldSetStagePrologue) {
      dispatch(setStage(UpsellStage.Prologue));
      setshouldSetStagePrologue(false);
    }

    if (
      featureAccess?.data?.featureName === 'CanCorrectAge' &&
      featureAccess.data.access === Access.Denied &&
      (featureAccess?.data?.recourses === null || featureAccess?.data?.recourses?.length === 0)
    ) {
      // if child is not eligible for birthdate update due to VPC confirmed birthdate cap, dispatch to set upstage to epilogue
      dispatch(setStage(UpsellStage.Epilogue));
    } else if (
      featureAccess?.data?.featureName === 'CanCorrectAge' &&
      featureAccess?.data?.access === Access.Granted
    ) {
      // if child can correct birthdate, close the modal right away
      onHidecallback(featureAccess.data.access);
    }
  }, [featureAccess, shouldSetStagePrologue]);

  // Loop call FeatureCheck to check new access status
  function onHide() {
    onHidecallback(featureAccess.data.access);
    dispatch(resetAccessManagementStore());
  }

  // Close right away without calling featureCheck again
  function asyncOnHide() {
    dispatch(resetAccessManagementStore());
    // This is intentional as async flows (where we need to wait for additional user actions to complete) are always denied access
    onHidecallback(Access.Denied);
  }

  const onHideFunction = asyncExit ? asyncOnHide : onHide;

  const isVpcHandoffCandidate =
    featureAccess?.data?.recourses?.length === 1 &&
    (verificationStageRecourse?.action === Recourse.ParentConsentRequest ||
      verificationStageRecourse?.action === Recourse.ParentLinkRequest);
  const vpcServedByV2 = isVpcHandoffCandidate && vpcV2PolicyEnabled === true;
  const holdForVpcV2Policy = isVpcHandoffCandidate && vpcV2PolicyEnabled === undefined;

  useEffect(() => {
    if (!isVpcHandoffCandidate || vpcV2PolicyEnabled !== undefined) {
      return;
    }
    vpcV2Handoff.isEnabled().then(setVpcV2PolicyEnabled, () => setVpcV2PolicyEnabled(false));
  }, [isVpcHandoffCandidate, vpcV2Handoff, vpcV2PolicyEnabled]);

  useEffect(() => {
    const request = vpcHandoffRequest.current;
    if (!vpcServedByV2 || !verificationStageRecourse || !request) {
      return;
    }
    const accessToReport = request.isAsyncCall ? Access.Denied : featureAccess.data.access;
    vpcV2Handoff.launch({
      recourseAction: verificationStageRecourse.action,
      parentConsentTypes: verificationStageRecourse.parentConsentTypes,
      recourseData: request.recourseData,
      onClose: () => {
        dispatch(resetAccessManagementStore());
        request.closeCallback(accessToReport);
      }
    });
  }, [
    dispatch,
    featureAccess.data?.access,
    verificationStageRecourse,
    vpcServedByV2,
    vpcV2Handoff
  ]);

  function getVerificationContainer() {
    if (verificationStageRecourse) {
      switch (verificationStageRecourse.action) {
        case Recourse.AddedEmail:
          return <EmailVerificationContainer translate={translate} onHide={onHide} />;
        case Recourse.AgeEstimation:
          return (
            <FAEContainer
              translate={translate}
              onHidecallback={onHideFunction}
              featureSpecificParams={featureSpecificParams}
              ageEstimation
            />
          );
        case Recourse.GovernmentId:
          // The moderation-appeals flow reuses the standard GovernmentId recourse,
          // so we key the appeals-specific Persona template off the client-only
          // wizard intent (only the appeals flow sends a template; all other IDV
          // is unchanged).
          return (
            <IDVerificationContainer
              translate={translate}
              onHidecallback={onHideFunction}
              ageEstimation={false}
              featureSpecificParams={featureSpecificParams}
              template={
                wizardIntent === WizardIntent.Appeals ? PersonaTemplate.IdvAppeal : undefined
              }
            />
          );
        case Recourse.ParentConsentRequest:
        case Recourse.ParentLinkRequest: {
          return (
            <ParentalRequestContainer
              recourse={verificationStageRecourse}
              translate={translate}
              onHidecallback={onHideFunction}
              value={recourseParameters}
              isPrologueUsed={isPrologueUsed}
              source={featureSpecificParams?.source}
            />
          );
        }
        case Recourse.UserSettings: {
          if (
            verificationStageRecourse.userSettings?.settingName ===
            UserSetting.allowFacialAgeEstimation
          ) {
            return (
              <VPCForFAETransformContainer
                translate={translate}
                onHidecallback={onHideFunction}
                value={recourseParameters}
                isPrologueUsed={isPrologueUsed}
                source={featureSpecificParams?.source}
              />
            );
          }
          return (
            <UpdateSettingsContainer
              translate={translate}
              recourse={verificationStageRecourse}
              updateSettingsModalProps={{
                onHide: () => {
                  onHideFunction();
                  featureSpecificParams.onHide?.();
                },
                ...featureSpecificParams
              }}
            />
          );
        }
        // TODO: ADD ERROR PAGE HERE
        default:
          return <Epilogue translate={translate} />;
      }
    }
    return <Epilogue translate={translate} />;
  }

  useEffect(() => {
    displayContainer = getVerificationContainer();
  }, [verificationStageRecourse]);

  if (vpcServedByV2) {
    return null;
  }

  if (loading) {
    displayContainer = <LoadingPage />;
  } else {
    switch (currentStage) {
      case UpsellStage.Prologue:
        if (featureAccess.data != null) {
          displayContainer = (
            <Prologue
              translate={translate}
              onHide={onHideFunction}
              recourseParameters={recourseParameters}
              expChildModalType={expChildModalType}
              featureSpecificParams={featureSpecificParams}
            />
          );
        }
        break;
      case UpsellStage.Verification:
        if (featureAccess.data != null) {
          displayContainer = getVerificationContainer();
        }
        break;
      case UpsellStage.Epilogue:
        displayContainer = <Epilogue translate={translate} onHide={onHideFunction} />;
        break;
      default:
        displayContainer = <LoadingPage />;
        break;
    }
  }

  return (
    <React.Fragment>
      <Modal
        backdrop='static'
        keyboard={false}
        show={showUpsellModal && !holdForVpcV2Policy}
        onHide={onHide}
        size='sm'
        aria-labelledby='access-management-modal-title'
        className='access-management-upsell-modal'
        scrollable='true'
        centered='true'>
        {displayContainer}
      </Modal>
    </React.Fragment>
  );
}
export default AccessManagementContainer;
