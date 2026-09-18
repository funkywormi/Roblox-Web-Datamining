import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import roblox20EventImage from "../images/Roblox20_Event.jpg";

export const EventNavItem = () => {
  // Reusing the classic theme flag, since it also ends on the 28th.
  const metaTag = document.querySelector<HTMLMetaElement>(`meta[name="classic-theme-data"]`);
  const classicEnabled = metaTag?.dataset.enabled === "True";
  if (!classicEnabled) {
    return null;
  }
  const href = getAbsoluteUrl("/spotlight/the-hunt-roblox-20");
  return (
    <li key={href}>
      <a href={href} className="flex">
        <img src={roblox20EventImage} alt="The Hunt" className="width-full radius-medium" />
      </a>
    </li>
  );
};
