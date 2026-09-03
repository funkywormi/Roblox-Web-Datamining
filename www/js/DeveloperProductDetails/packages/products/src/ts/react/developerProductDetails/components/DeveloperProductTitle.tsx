import { useEffect, useRef, useState } from 'react';
import { Grid, Typography, IconButton, Menu, MoreHorizIcon, MenuItem } from '@rbx/ui';
import { CurrentUser, EnvironmentUrls } from "@rbx/core-scripts/legacy/Roblox";
import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import { TDeveloperProductDetails } from '../../common/types/types';
import constants from '../../common/constants/constants';
import { FeatureDeveloperProducts } from '../../common/constants/translationConstants';
import guacService from '../../common/services/guacService';

type DeveloperProductTitleProps = {
  developerProductDetailsData: TDeveloperProductDetails;
  translate: TranslateFunction;
};

const DeveloperProductTitle = ({
  developerProductDetailsData,
  translate
}: DeveloperProductTitleProps): JSX.Element => {
  const currentUrl = EnvironmentUrls.domain + window.location.pathname;

  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMenuButtonClick = () => {
    setMenuOpen((oldState: boolean) => !oldState);
  };

  const abuseReportLink = constants.url.reportAbuse(
    developerProductDetailsData.TargetId.toString(),
    encodeURIComponent(currentUrl)
  );
  const [abuseReportUrl, setAbuseReportUrl] = useState<string>(abuseReportLink.url);

  useEffect(() => {
    const getAbuseReportLink = async () => {
      const config = await guacService.loadGuacConfigNonThrowing();
      if (config.EnableDevProducts) {
        return constants.url.reportAbuseRevamp(
          developerProductDetailsData.ProductId.toString(),
          CurrentUser!.userId,
          'developerproduct'
        );
      }
      return abuseReportLink.url;
    };

    getAbuseReportLink()
      .then(url => {
        setAbuseReportUrl(url);
      })
      .catch(() => {
        setAbuseReportUrl(abuseReportLink.url);
      });
  }, [
    abuseReportLink.url,
    developerProductDetailsData.ProductId,
    developerProductDetailsData.TargetId
  ]);

  return (
    <Grid className='product-title-container'>
      <Typography className='h1'>{developerProductDetailsData.Name}</Typography>
      <IconButton
        aria-label='developer-product-details-menu'
        onClick={handleMenuButtonClick}
        ref={buttonRef}>
        <MoreHorizIcon />
      </IconButton>
      <Menu
        open={menuOpen}
        onClose={() => { setMenuOpen(false); }}
        anchorEl={buttonRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}>
        <MenuItem component='a' href={abuseReportUrl}>
          <Typography>{translate(FeatureDeveloperProducts.LabelReportAbuse)}</Typography>
        </MenuItem>
      </Menu>
    </Grid>
  );
};

export default DeveloperProductTitle;
