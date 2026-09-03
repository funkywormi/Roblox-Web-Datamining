import { ReportType } from '../../illegalContentReport/helpers';

export type TranslationKeyMapResource = {
  getTranslationKey: (key: string) => string;
};

// Return the translation key specific to the OSA form given
// a generic translation key in ICR forms.
const getOSATranslationKey = (key: string) => {
  switch (key) {
    case 'Message.DsaDescription1':
      return 'Message.OSA.Description1';
    case 'Message.DsaDescription2':
      return 'Message.OSA.Description2';
    case 'Message.DsaDescription3':
      return 'Message.OSA.Description3';
    case 'Message.DsaDescription4':
      return 'Message.OSA.Description4';
    case 'Label.Country.DEFAULT':
      return 'Label.Country.OSA.DEFAULT';
    case 'Message.Confirm':
      return 'Message.OSA.Confirm';
    case 'Question.WhyIllegal':
      return 'Question.OSA.WhyIllegal';
    default:
      return key;
  }
};

// Return the translation key specific to the DSA form given
// a generic translation key in ICR forms.
const getDSATranslationKey = (key: string) => {
  switch (key) {
    case 'Message.DsaDescription4':
      // The DSA form only have three paragraphs.
      return '';
    case 'Message.AppealDescription1':
      return '';
    default:
      return key;
  }
};

// Return the translation key specific to the CHCR form given
// a generic translation key in ICR forms.
const getCHCRTranslationKey = (key: string) => {
  switch (key) {
    case 'Title':
      return 'Title.CHCR';
    case 'Title.Content':
      return 'Title.CHCR.Content';
    case 'Message.DsaDescription1':
      return 'Message.CHCR.Description1';
    case 'Message.DsaDescription2':
      return 'Message.CHCR.Description2';
    case 'Message.DsaDescription3':
      return 'Message.CHCR.Description3';
    case 'Message.DsaDescription4':
      return 'Message.CHCR.Description4';
    case 'Question.WhyIllegal':
      return 'Question.CHCR.WhyHarmful';
    case 'Message.Confirm':
      return 'Message.OSA.Confirm';
    case 'Question.Title':
      return 'Question.CHCR.Title';
    default:
      return key;
  }
};

// Return the translation key specific to the AU OSA form given
// a generic translation key in ICR forms.
const getAUOSATranslationKey = (key: string) => {
  switch (key) {
    case 'Title':
      return 'Title.AUOSA';
    case 'Title.Content':
      return 'Title.AUOSA.Content';
    case 'Message.DsaDescription1':
      return 'Message.AUOSA.Description1';
    case 'Message.DsaDescription2':
      return 'Message.AUOSA.Description2';
    case 'Message.DsaDescription3':
      return 'Message.AUOSA.Description3';
    case 'Message.DsaDescription4':
      return '';
    case 'Message.AppealDescription1':
      return '';
    case 'Question.Url':
      return 'Question.AUOSA.Url';
    case 'Question.WhyIllegal':
      return 'Question.AUOSA.WhyHarmful';
    case 'Question.Title':
      return 'Question.AUOSA.Title';
    case 'Message.Confirm':
      return 'Message.AUOSA.Confirm';
    default:
      return key;
  }
};

/**
 * This hook gets the translation key for the specific report type given a generic translation
 * key in the ICR forms.
 */
export const useTranslationKeyMap = (reportType?: ReportType): TranslationKeyMapResource => {
  if (reportType === ReportType.OSA) {
    return { getTranslationKey: getOSATranslationKey };
  }
  if (reportType === ReportType.DSA) {
    return { getTranslationKey: getDSATranslationKey };
  }
  if (reportType === ReportType.AU_OSA) {
    return { getTranslationKey: getAUOSATranslationKey };
  }
  if (reportType === ReportType.CHCR) {
    return { getTranslationKey: getCHCRTranslationKey };
  }
  return { getTranslationKey: key => key };
};
