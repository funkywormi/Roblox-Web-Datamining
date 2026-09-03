import { EducationItem } from "../../../types/api";
import BulletListItem from "./items/BulletListItem";
import LinkItem from "./items/LinkItem";
import TextItem from "./items/TextItem";

const EducationContentList = ({ items }: { items: EducationItem[] }) => {
  return (
    <div className="flex flex-col gap-medium">
      {items.map(item => {
        switch (item.type) {
          case "text":
            return <TextItem key={item.text} item={item} />;
          case "bulletList":
            return (
              <BulletListItem key={`${item.text ?? ""}:${item.bulletList.join("|")}`} item={item} />
            );
          case "link":
            return <LinkItem key={item.href} item={item} />;
          default:
            return null;
        }
      })}
    </div>
  );
};

export default EducationContentList;
