import { useEffect } from 'react';
import { IModalService } from 'react-style-guide';
import { useSelector } from 'react-redux';
import { TranslateFunction } from 'react-utilities';
import { selectFeatureAccess } from '../accessManagementSlice';
import VpcNotEligibleEpilogue from './DefaultEpilogue.tsx/VpcNotEligibleEpilogue';

const Epilogue = ({
  translate,
  onHide
}: {
  translate: TranslateFunction;
  onHide?: () => void;
}): JSX.Element => {
  let [epilogueModal, epilogueModelService]: [JSX.Element, IModalService] = [null, null];
  const featureAccess = useSelector(selectFeatureAccess);
  switch (featureAccess?.data?.featureName) {
    case 'CanCorrectAge':
      [epilogueModal, epilogueModelService] = VpcNotEligibleEpilogue({
        translate,
        onHide
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
