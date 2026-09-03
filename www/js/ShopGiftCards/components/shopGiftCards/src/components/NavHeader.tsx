import { WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import { Typography, Grid, Divider } from "@rbx/ui";
import { Endpoints } from "@rbx/legacy-webapp-types/Roblox";
import { translationKeys } from "../constants/shopGiftcardsConstants";

const NavHeader: React.FC<WithTranslationsProps> = ({ translate }): JSX.Element => {
  return (
    <header className="nav-header">
      <div className="nav-header-content">
        <Grid container direction="row">
          <a
            href={Endpoints.getAbsoluteUrl("/giftcards")}
            rel="noopener noreferrer"
            target="_blank"
            aria-label="Roblox"
          >
            <span className="icon-default-logo header-icon-logo" />
          </a>
          <Divider orientation="vertical" flexItem />
          <Typography className="gift-cards-title text-header" variant="h1">
            {translate(translationKeys.header.maintitle)}
          </Typography>
        </Grid>
      </div>
    </header>
  );
};

export default NavHeader;
