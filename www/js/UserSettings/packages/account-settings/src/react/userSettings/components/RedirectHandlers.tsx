import React from "react";
import CreatorCollaborationRedirectHandler from "./privacy/CreatorCollaborationRedirectHandler";
import AgeVerificationRedirectHandler from "./accountInfo/AgeVerificationRedirectHandler";
import AddParentRedirectHandler from "./parentalControls/AddParentRedirectHandler";

const RedirectHandlers = (): JSX.Element => {
  return (
    <React.Fragment>
      <CreatorCollaborationRedirectHandler />
      <AgeVerificationRedirectHandler />
      <AddParentRedirectHandler />
      {/* TODO: Add other redirect handlers here as needed */}
    </React.Fragment>
  );
};

export default RedirectHandlers;
