import { Redirect, Route } from "react-router-dom";
import { baseParentalControlsPath } from "../../../constants/parentalControls/parentalControlsConstants";

// Defines the routes for children viewing their own parental controls dashboard
export const ChildDashboardRoutes = (): JSX.Element => {
  return (
    <Route path={`${baseParentalControlsPath}/*`}>
      <Redirect to={baseParentalControlsPath} />
    </Route>
  );
};

export default ChildDashboardRoutes;
