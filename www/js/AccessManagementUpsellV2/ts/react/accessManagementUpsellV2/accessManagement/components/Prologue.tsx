import { TranslateFunction } from 'react-utilities';
import { useEffect } from 'react';
import { IModalService } from 'react-style-guide';
import { useSelector } from 'react-redux';
import { TFeatureSpecificData } from 'Roblox';
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
  featureSpecificParams
}: {
  translate: TranslateFunction;
  onHide: () => void;
  recourseParameters?: Record<string, string> | null;
  expChildModalType?: ExpNewChildModal;
  featureSpecificParams?: TFeatureSpecificData;
}): JSX.Element => {
  const dispatch = useAppDispatch();
  let [prologueModal, prologueModelService]: [JSX.Element, IModalService] = [null, null];

  const featureAccess = useSelector(selectFeatureAccess);
  const recourseResponses = featureAccess.data.recourses;

  const listOfRecourse: Recourse[] = recourseResponses.map(obj => obj.action);

  if (listOfRecourse.length === 1) {
    switch (listOfRecourse[0]) {
      case Recourse.ParentConsentRequest:
      case Recourse.ParentLinkRequest:
        [prologueModal, prologueModelService] = VpcPrologue({
          translate,
          onHide,
          recourseParameters,
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
          recourseParameters,
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
          onHide
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
