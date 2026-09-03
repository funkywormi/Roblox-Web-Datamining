enum RequirementType {
  /**
   * This option is currently selected
   */
  None = 'None',

  /**
   * Needs parental consent to have this option
   */
  ParentalConsent = 'ParentalConsent',

  /**
   * User is free to update to this option without any restrictions
   */
  SelfUpdateSetting = 'SelfUpdateSetting',

  /**
   * Needs to perform age verification to have this option
   */
  ContentAgeRestrictionVerification = 'ContentAgeRestrictionVerification',

  /**
   * This option is blocked due to inherited setting restriction and parental consent
   */
  ParentConsentInherited = 'ParentConsentInherited',

  /**
   * This option is blocked due to inherited setting restriction
   */
  Inherited = 'Inherited'
}

export default RequirementType;
