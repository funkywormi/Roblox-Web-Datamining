import { BulletListItemType } from "../../../../types/api";

const BULLET = "•";

const BulletListItem = ({ item }: { item: BulletListItemType }) => {
  return (
    <div className="flex flex-col gap-medium">
      {item.text && <span className="text-title-medium content-emphasis">{item.text}</span>}
      <div className="flex flex-col gap-small">
        {item.bulletList.map(text => (
          <div key={text} className="flex flex-row gap-small">
            <p className="text-body-medium">{BULLET}</p>
            <p className="text-body-medium">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BulletListItem;
