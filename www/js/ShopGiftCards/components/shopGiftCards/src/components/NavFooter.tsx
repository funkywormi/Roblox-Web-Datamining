import { WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import { Typography, Divider } from "@rbx/ui";
import { translationKeys } from "../constants/shopGiftcardsConstants";

const NavFooter: React.FC<WithTranslationsProps> = ({ translate }): JSX.Element => {
  const currentYear: number = new Date().getFullYear();

  return (
    <footer className="nav-footer">
      <div className="footer-divider">
        <Divider orientation="horizontal" size="medium" variant="fullWidth" />
      </div>

      <div className="nav-footer-wrapper">
        <div className="nav-footer-content">
          <Typography className="text-footer-content" variant="captionBody">
            {translate(translationKeys.footer.copyright, { copyrightYear: currentYear })}
          </Typography>

          <div className="nav-footer-links">
            <a href="https://www.roblox.com/info/terms">
              <Typography className="text-footer-link" variant="captionHeader">
                {translate(translationKeys.footer.terms)}
              </Typography>
            </a>
            <a href="https://www.roblox.com/info/privacy">
              <Typography className="text-footer-link" variant="captionHeader">
                {translate(translationKeys.footer.privacy)}
              </Typography>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default NavFooter;
