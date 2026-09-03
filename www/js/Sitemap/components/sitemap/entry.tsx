import "./src/sitemap.css";

const updateTabGroupHeight = (): void => {
  const tabGroup = document.querySelector<HTMLDivElement>(".tab-group");
  if (tabGroup) {
    const height = tabGroup.clientHeight;
    document.documentElement.style.setProperty("--navbar-height", `${height}px`);
  }
};

const setActiveTabFromHash = (): void => {
  const currentHash = window.location.hash;
  const tabItems = document.querySelectorAll<HTMLAnchorElement>(".tab-item");

  // Remove active class from all tabs
  tabItems.forEach((tab: HTMLAnchorElement) => {
    tab.classList.remove("active");
  });

  // Set active tab based on current URL hash
  if (currentHash) {
    const targetTab = document.querySelector<HTMLAnchorElement>(`.tab-item[href="${currentHash}"]`);
    if (targetTab) {
      targetTab.classList.add("active");
    }
  }
};

const initTabHandling = (): void => {
  // Set active tab based on current URL hash on initialization
  setActiveTabFromHash();

  // Handle tab clicks
  const tabItems = document.querySelectorAll<HTMLAnchorElement>(".tab-item");
  const handleTabClick = (clickedTab: HTMLAnchorElement): void => {
    tabItems.forEach((tab: HTMLAnchorElement) => {
      tab.classList.remove("active");
    });
    clickedTab.classList.add("active");
  };

  tabItems.forEach((tab: HTMLAnchorElement) => {
    tab.addEventListener("click", () => {
      handleTabClick(tab);
    });
  });
};

document.addEventListener("DOMContentLoaded", initTabHandling);
window.addEventListener("load", updateTabGroupHeight);
window.addEventListener("resize", updateTabGroupHeight);
window.addEventListener("hashchange", setActiveTabFromHash);
