import { TextItemType } from "../../../../types/api";

const TextItem = ({ item }: { item: TextItemType }) => {
  return <span className="text-body-medium">{item.text}</span>;
};

export default TextItem;
