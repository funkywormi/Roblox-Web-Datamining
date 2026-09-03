import React from "react";
import { COMMUNITY_STANDARDS_URL } from "../../shared/url";

/**
 * Basic component that links the user to the Community Standards page. Pulled into its
 * own component since it's reused in a bunch of places.
 */
const CommunityStandardsLink: React.FC = ({ children }) => (
  <a href={COMMUNITY_STANDARDS_URL} className="content-link" target="_blank" rel="noreferrer">
    {children}
  </a>
);

export default CommunityStandardsLink;
