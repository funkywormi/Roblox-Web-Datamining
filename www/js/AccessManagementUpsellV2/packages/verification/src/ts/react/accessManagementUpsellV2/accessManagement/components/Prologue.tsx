import type { TranslateFunction } from '@rbx/core-scripts/react';
import { useEffect } from 'react';
import type { IModalService } from '../../components/StyleGuide';
import { useSelector } from 'react-redux';
import type { TFeatureSpecificData } from '@rbx/legacy-webapp-types/Roblox/accessManagementUpsellService';
import { Recourse, UpsellStage } from '../../enums';
import UserSetting from '../../../legallySensitiveContent/enums/UserSetting';
import ExpNewChildModal from '../../enums/ExpNewChildModal';
import { setStage, selectFeatureAccess } from '../accessManagementSlice';
import { useAppDispatch } from '../../store';
import VpcPrologue from './DefaultPrologue/VpcPrologue';
import IdvAndVpcPrologue from './DefaultPrologue/IdvAndVpcPrologue';
import IdvPrologue from './DefaultPrologue/IdvPrologue';
import FaePrologue from './DefaultPrologue/FaePrologue';

const Prologue = ({
  translate,
  onHide,
  recourseParameters,
  expChildModalType,
  featureSpecificParams,
  onVpcSelected
}: {
  translate: TranslateFunction;
  onHide: () => void;
  recourseParameters?: Record<string, string> | null;
  expChildModalType?: ExpNewChildModal;
  featureSpecificParams?: TFeatureSpecificData;
  onVpcSelected?: () => void;
}): React.JSX.Element => {
  const dispatch = useAppDispatch();
  let [prologueModal, prologueModelService]: [React.JSX.Element, IModalService] = [null, null] as unknown as [React.JSX.Element, IModalService];

  const featureAccess = useSelector(selectFeatureAccess);
  const recourseResponses = featureAccess.data!.recourses;

  const listOfRecourse: Recourse[] = recourseResponses.map(obj => obj.action);

  if (listOfRecourse.length === 1) {
    switch (listOfRecourse[0]) {
      case Recourse.ParentConsentRequest:
      case Recourse.ParentLinkRequest:
        [prologueModal, prologueModelService] = VpcPrologue({
          translate,
          onHide,
          recourseParameters: recourseParameters ?? null,
          expChildModalType,
          source: featureSpecificParams?.source
        });
        break;
      case Recourse.GovernmentId:
        [prologueModal, prologueModelService] = IdvPrologue({
          translate,
          onHide
        });
        break;
      case Recourse.AgeEstimation:
        [prologueModal, prologueModelService] = FaePrologue({
          translate,
          onHide,
          recourseParameters: recourseParameters ?? null,
          source: featureSpecificParams?.source
        });
        break;
      default:
        break;
    }
  }

  if (listOfRecourse.length === 2) {
    if (listOfRecourse.includes(Recourse.GovernmentId)) {
      if (
        listOfRecourse.includes(Recourse.ParentConsentRequest) ||
        listOfRecourse.includes(Recourse.ParentLinkRequest)
      ) {
        [prologueModal, prologueModelService] = IdvAndVpcPrologue({
          translate,
          onHide,
          onVpcSelected
        });
      }
    }
  }

  useEffect(() => {
    if (!prologueModal) {
      // If there is no existing default component, go to verification Upsell
      // directly, default is the first recourse
      dispatch(setStage(UpsellStage.Verification));
    } else {
      prologueModelService.open();
    }
  }, [dispatch, prologueModal, prologueModelService, recourseResponses]);

  return prologueModal;
};

export default Prologue;
