const refetchUserSettingsEventName = 'refetchUserSettingsEvent';

// Used to trigger refresh of user settings
export const refetchUserSettings = (): void => {
  const event = new CustomEvent(refetchUserSettingsEventName);
  window.dispatchEvent(event);
};

export default refetchUserSettings;
