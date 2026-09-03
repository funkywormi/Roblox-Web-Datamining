import { LinkType } from "../utils/types";

interface ArwpLinkProps {
  link: LinkType;
}

const ArwpLink = ({ link }: ArwpLinkProps) => {
  const { label, url } = link;

  return (
    <a href={url} className="text-link">
      {label}
    </a>
  );
};

export default ArwpLink;
