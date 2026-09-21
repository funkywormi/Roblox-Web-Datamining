import siteLinks from "../constants/siteLinks";

function SimpleNavigation(): JSX.Element {
  return (
    <div className="flex items-center width-full padding-y-[6px] padding-x-[6px]">
      <a href={siteLinks.homePageLink}>
        <span className="icon-logo" />
      </a>
    </div>
  );
}

export default SimpleNavigation;
