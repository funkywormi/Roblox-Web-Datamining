/**
 * Who the parental controls tab is being rendered for.
 */
enum ParentalControlsActor {
  Unresolved = "Unresolved",

  // The child viewing their own tab with no on-device parent.
  Child = "Child",

  // An on-device parent viewing their child's settings on the child's own account.
  OnDeviceParent = "OnDeviceParent",

  // A fully remote parent account viewing their child's settings from the parent's account.
  RemoteParent = "RemoteParent",
}

export default ParentalControlsActor;
