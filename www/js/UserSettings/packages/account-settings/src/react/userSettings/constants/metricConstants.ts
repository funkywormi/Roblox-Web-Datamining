interface UserSettingsApiMetrics {
  prefix: string;
  events: {
    statusError: string;
    metadataError: string;
    settingsAndOptionsError: string;
    policyError: string;
    unknownError: string;
  };
}

const counterMetrics = {
  userSettingsApi: {
    prefix: "UserSettingsApi",
    events: {
      statusError: "StatusError",
      metadataError: "MetadataError",
      settingsAndOptionsError: "SettingsAndOptionsError",
      policyError: "PolicyError",
      unknownError: "UnknownError",
    },
  },
} as const;

export default counterMetrics.userSettingsApi as UserSettingsApiMetrics;
