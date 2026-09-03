enum ModalState {
  // Initial state:
  NONE = "NONE",

  // Generic text error modal:
  GENERIC_TEXT_ERROR = "GENERIC_TEXT_ERROR",

  // Modal to confirm trusted device before registering a security key:
  FIDO_CREDENTIAL_CONFIRM_TRUST = "FIDO_CREDENTIAL_CONFIRM_TRUST",

  // Modal to delete security key:
  FIDO_CREDENTIAL_DELETE = "FIDO_CREDENTIAL_DELETE",

  // Modal to enable security key:
  FIDO_CREDENTIAL_ENABLE = "FIDO_CREDENTIAL_ENABLE",

  // Modal displayed for security key errors:
  FIDO_CREDENTIAL_ERROR = "FIDO_CREDENTIAL_ERROR",

  // Modal for user to name their security key:
  FIDO_CREDENTIAL_NAME = "FIDO_CREDENTIAL_NAME",

  // Modal displayed to manage security keys:
  FIDO_CREDENTIAL_MANAGE = "FIDO_CREDENTIAL_MANAGE",
}

export default ModalState;
