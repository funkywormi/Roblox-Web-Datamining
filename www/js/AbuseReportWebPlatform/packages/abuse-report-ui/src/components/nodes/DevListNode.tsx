import React from "react";
import ListNode, { type ListItem } from "./ListNode";
import { TranslateInputOrString } from "../../util/translate/translate";

type LoadDescriptor = {
  $load: string;
  params?: Record<string, string>;
};

type DevListNodeProps = {
  onNext?: (componentData: { selectionItem?: ListItem }) => void;
  isSubmitting?: boolean;
  title: TranslateInputOrString;
  eyebrow?: TranslateInputOrString;
  items: (ListItem | undefined)[] | LoadDescriptor;
  initialValue?: string;
  nextButtonText: TranslateInputOrString;
  required?: boolean;
  footerItems?: TranslateInputOrString[];
};

/**
 * Dev-only list node. Now delegates entirely to ListNode which handles
 * both static items and $load descriptors natively.
 */
const DevListNode = (props: DevListNodeProps): React.ReactElement => {
  return <ListNode {...props} />;
};

export default DevListNode;
