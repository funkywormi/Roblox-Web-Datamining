import React from "react";
import { useArTranslation } from "../util/translate/arTranslation";
import type { ListNode } from "../hooks/abuseSheetFlow/types";

/** Single footer entry from the resolved config schema — list item `{ id, label, … }`. */
export type FooterItem = NonNullable<ListNode["footerItems"]>[number];

const Footer = ({ items }: { items?: readonly FooterItem[] | null }): React.ReactElement | null => {
  const { translate } = useArTranslation();
  if (!items || items.length === 0) return null;
  return (
    <div>
      {items.map(item => (
        <div key={item.id} className="text-body-small">
          {translate(item.label)}
        </div>
      ))}
    </div>
  );
};

export default Footer;
