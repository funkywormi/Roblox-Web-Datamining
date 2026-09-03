import { SelectionOption } from '../../shared/components/SingleSelection';

export interface SelectionOptionTemplate {
  value: string;
  labelKey: string;
  labelParams?: Record<string, unknown>;
  descriptionKey?: string;
  descriptionParams?: Record<string, unknown>;
}

export const VERIFICATION_LEVEL_OPTION_TEMPLATES: SelectionOptionTemplate[] = [
  {
    value: 'None',
    labelKey: 'Label.VerificationNone',
    descriptionKey: 'Description.VerificationNone'
  },
  {
    value: 'Low',
    labelKey: 'Label.VerificationLow',
    descriptionKey: 'Description.VerificationLow'
  },
  {
    value: 'Medium',
    labelKey: 'Label.VerificationMedium',
    descriptionKey: 'Description.VerificationMedium'
  },
  {
    value: 'High',
    labelKey: 'Label.VerificationHigh',
    descriptionKey: 'Description.VerificationHigh'
  }
];

export const ACCOUNT_TENURE_OPTION_TEMPLATES: SelectionOptionTemplate[] = [
  {
    value: 'None',
    labelKey: 'Label.TenureNone'
  },
  {
    value: 'OneDay',
    labelKey: 'Label.TenureDays',
    labelParams: { numDays: 1 }
  },
  {
    value: 'ThreeDays',
    labelKey: 'Label.TenureDays',
    labelParams: { numDays: 3 }
  },
  {
    value: 'OneWeek',
    labelKey: 'Label.TenureDays',
    labelParams: { numDays: 7 }
  },
  {
    value: 'OneMonth',
    labelKey: 'Label.TenureDays',
    labelParams: { numDays: 30 }
  },
  {
    value: 'ThreeMonths',
    labelKey: 'Label.TenureDays',
    labelParams: { numDays: 90 }
  }
];

export const translateOptions = (
  templates: SelectionOptionTemplate[],
  translate: (key: string, params?: Record<string, unknown>) => string
): SelectionOption[] => {
  return templates.map(template => ({
    value: template.value,
    label: translate(template.labelKey, template.labelParams),
    description: template.descriptionKey
      ? translate(template.descriptionKey, template.descriptionParams)
      : undefined
  }));
};
