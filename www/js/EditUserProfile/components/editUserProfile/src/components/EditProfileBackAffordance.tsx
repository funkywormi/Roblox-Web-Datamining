import { useMemo } from "react";
import { Button } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";

const getBackHref = (): string | null => {
  if (typeof document === "undefined" || !document.referrer) {
    return null;
  }
  try {
    const referrerOrigin = new URL(document.referrer).origin;
    if (referrerOrigin !== window.location.origin) {
      return null;
    }
    return document.referrer;
  } catch {
    return null;
  }
};

/** Profile URL pattern: /users/{userId}/profile */
const isProfilePageUrl = (url: string): boolean => {
  try {
    const { pathname } = new URL(url, window.location.origin);
    return /^\/users\/\d+\/profile\/?$/.test(pathname);
  } catch {
    return false;
  }
};

const EditProfileBackAffordance = () => {
  const { translate } = useTranslation();
  const backHref = useMemo(getBackHref, []);

  if (backHref === null) {
    return null;
  }

  const backLabelKey = isProfilePageUrl(backHref) ? "Action.BackToProfile" : "Action.Back";

  return (
    <div className="inline-block">
      <Button
        icon="icon-filled-arrow-wide-short-left"
        as="a"
        href={backHref}
        variant="Utility"
        size="Medium"
      >
        {translate(backLabelKey)}
      </Button>
    </div>
  );
};

export default EditProfileBackAffordance;
