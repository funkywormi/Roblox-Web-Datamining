import type { Namespace } from "@rbx/www-common/i18n";
import { translations } from "../../component.json";

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- CI narrows Namespace; component.json is always valid
export const navNamespaces = translations as unknown as readonly Namespace[];
