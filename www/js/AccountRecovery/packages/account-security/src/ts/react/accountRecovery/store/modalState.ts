enum ModalState {
  // Initial state:
  NONE = "NONE",

  // Update Email modal:
  UPDATE_EMAIL = "UPDATE_EMAIL",

  // Add New Passkey modal:
  ADD_NEW_PASSKEY = "ADD_NEW_PASSKEY",

  // Save or Delete Two-Step Method modal:
  SAVE_OR_DELETE_TWO_STEP_METHOD = "SAVE_OR_DELETE_TWO_STEP_METHOD",

  // Invalidate Credentials modal:
  INVALIDATE_CREDENTIALS = "INVALIDATE_CREDENTIALS",

  // Account Secured modal, confirming the credentials were invalidated:
  ACCOUNT_SECURED = "ACCOUNT_SECURED",

  // No Changes Made modal, confirming the credentials were kept:
  NO_CHANGES_MADE = "NO_CHANGES_MADE",
}

export default ModalState;
