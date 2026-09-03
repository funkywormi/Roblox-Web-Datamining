import { JSX } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@rbx/core-scripts/react";
import { ROUTES } from "../utils/routingUtils";

const getParentPath = (path: string): string => {
  return path.substring(0, path.lastIndexOf("/"));
};

type BackLinkProps = {
  currentPagePath: string | undefined;
  titleTranslationKey?: string | undefined;
  title?: string | undefined;
};

export const BackLink = ({
  currentPagePath,
  titleTranslationKey,
  title: rawTitle,
}: BackLinkProps): JSX.Element => {
  const { translate } = useTranslation();

  const to = currentPagePath ? getParentPath(currentPagePath) : ROUTES.categories;
  const title = rawTitle ?? (titleTranslationKey ? translate(titleTranslationKey) : "");

  return (
    <h3 className="back-link font-header-2">
      <Link to={to}>
        <span className="icon-left" role="button" aria-label={title} tabIndex={0} />
      </Link>
      {title}
    </h3>
  );
};

export default BackLink;
