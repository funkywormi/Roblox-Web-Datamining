enum ModalState {
  // Initial state:
  NONE = "NONE",

  // Generic text error modal:
  GENERIC_TEXT_ERROR = "GENERIC_TEXT_ERROR",

  // Two step disable modal:
  TWO_STEP_DISABLE = "TWO_STEP_DISABLE",

  // Modal to disable all two step verification methods:
  TWO_STEP_DISABLE_ALL = "TWO_STEP_DISABLE_ALL",

  // Modal to enable authenticator:
  AUTHENTICATOR_ENABLE = "AUTHENTICATOR_ENABLE",

  // Modal to show warnings when enabling two step methods:
  TWO_STEP_ENABLE_WARNING = "TWO_STEP_ENABLE_WARNING",

  // Modal to warn user they are about to delete their security keys:
  SECURITY_KEY_DELETED_WARNING = "SECURITY_KEY_DELETED_WARNING",

  // Modal that tells user to turn on authenticator before enabling security keys:
  TURN_ON_AUTHENTICATOR = "TURN_ON_AUTHENTICATOR",

  // Modal to enable security key:
  SECURITY_KEY_ENABLE = "SECURITY_KEY_ENABLE",

  // Modal displayed for security key errors:
  SECURITY_KEY_ERROR = "SECURITY_KEY_ERROR",

  // Modal for user to name their security key:
  SECURITY_KEY_NAME = "SECURITY_KEY_NAME",

  // Modal displayed when user successfully adds security key:
  SECURITY_KEY_SUCCESS = "SECURITY_KEY_SUCCESS",

  // Modal displayed to manage security keys:
  SECURITY_KEY_MANAGE = "SECURITY_KEY_MANAGE",

  // Modal displayed when deleting security keys:
  SECURITY_KEY_DELETE = "SECURITY_KEY_DELETE",

  // Modal displayed after successfully deleted security keys:
  SECURITY_KEY_DELETE_SUCCESS = "SECURITY_KEY_DELETE_SUCCESS",

  // Modal to generate recovery codes:
  RECOVERY_CODES_GENERATE = "RECOVERY_CODES_GENERATE",

  // Modal to generate recovery codes:
  RECOVERY_CODES_DISPLAY = "RECOVERY_CODES_DISPLAY",
}

export default ModalState;
