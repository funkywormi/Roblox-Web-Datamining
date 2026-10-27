import { useEffect } from 'react';
import type { IModalService } from '../../components/StyleGuide';
import { useSelector } from 'react-redux';
import type { TranslateFunction } from '@rbx/core-scripts/react';
import { selectFeatureAccess } from '../accessManagementSlice';
import VpcNotEligibleEpilogue from './DefaultEpilogue.tsx/VpcNotEligibleEpilogue';

const Epilogue = ({
  translate,
  onHide
}: {
  translate: TranslateFunction;
  onHide?: () => void;
}): React.JSX.Element => {
  let [epilogueModal, epilogueModelService]: [React.JSX.Element, IModalService] = [null, null] as unknown as [React.JSX.Element, IModalService];
  const featureAccess = useSelector(selectFeatureAccess);
  switch (featureAccess?.data?.featureName) {
    case 'CanCorrectAge':
      [epilogueModal, epilogueModelService] = VpcNotEligibleEpilogue({
        translate,
        onHide: onHide!
      });
      break;
    default:
      break;
  }

  useEffect(() => {
    epilogueModelService.open();
  }, [epilogueModal, epilogueModelService]);

  return epilogueModal;
};

export default Epilogue;
