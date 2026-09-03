import React from "react";
import { useArTranslation } from "../util/translate/arTranslation";
import { TranslateInputOrString } from "../util/translate/translate";

const Footer = ({ items }: { items?: TranslateInputOrString[] }): React.ReactElement | null => {
  const { translate } = useArTranslation();
  if (!items || items.length === 0) return null;
  return (
    <div>
      {items.map((item, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={idx} className="text-body-small">
          {translate(item)}
        </div>
      ))}
    </div>
  );
};

export default Footer;
