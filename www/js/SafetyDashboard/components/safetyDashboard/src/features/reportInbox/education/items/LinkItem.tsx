import { Link } from "@rbx/foundation-ui";
import { LinkItemType } from "../../../../types/api";

const LinkItem = ({ item }: { item: LinkItemType }) => {
  return (
    <Link
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-link text-body-medium"
    >
      {item.text}
    </Link>
  );
};

export default LinkItem;
