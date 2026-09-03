const App = () => (
  <>
    <div id="section1" style={{ position: "absolute", top: "0px", width: "100%" }} />
    <div id="section2" style={{ position: "absolute", top: "0px", width: "100%" }}>
      <div className="section top dark">
        <div className="container">
          <div className="row-column">
            <div className="main-center flex-column">
              <div className="main-title more-robux align-center lang-maintitle-more-robux">
                Enjoy up to <br /> 25% more Robux
              </div>
              <div className="main-subtitle more-robux align-center lang-main-subtitle-more-robux">
                Get more Robux with gift cards, and on computer and web
              </div>
              <div className="section-button main-button button-container">
                <a
                  target="_blank"
                  className="main-btn lang-mainbutton link-mainbutton"
                  href="https://www.roblox.com/"
                  rel="noreferrer"
                >
                  Shop Gift Cards
                </a>
              </div>
              <div className="background-image herobg-main translated us" />
            </div>
          </div>
        </div>
      </div>

      <div className="section virtual-items dark">
        <div className="container digital-container">
          <h2 className="virtual-items-title lang-virtual-title">Free Virtual Items</h2>
          <div className="centered-section flex-column">
            <div className="text-container">
              <div className="online-desc section-desc narrow line-space-under">
                <div className="lang-virtual-footnote">
                  Limit one item and one bonus item per month per account.
                </div>
              </div>
            </div>
            <div className="items-container row-column">
              <div className="item-container bonus-item">
                <a target="_blank" rel="noreferrer">
                  <div className="virtual-item-container">
                    <div className="item-image-container item-image">
                      <canvas className="virtual-item background-image" />
                    </div>
                    <div className="virtual-item-text">
                      <div className="virtual-item-title lang-item-included">
                        Virtual Item Included
                      </div>
                      <div className="virtual-item-name" />
                    </div>
                  </div>
                </a>
              </div>

              <div className="item-container event-item">
                <a target="_blank" rel="noreferrer">
                  <div className="virtual-item-container">
                    <div className="item-image-container item-image">
                      <canvas className="virtual-item background-image" />
                    </div>
                    <div className="virtual-item-text">
                      <div className="virtual-item-title lang-item-bonus">
                        Bonus Exclusive Virtual Item
                      </div>
                      <div className="virtual-item-name" />
                    </div>
                  </div>
                </a>
              </div>
              <div className="item-container event-item hide">
                <a target="_blank" rel="noreferrer">
                  <div className="virtual-item-container">
                    <div className="item-image-container item-image">
                      <canvas className="virtual-item background-image" />
                    </div>
                    <div className="virtual-item-text">
                      <div className="virtual-item-title lang-item-bonus">
                        Bonus Exclusive Virtual Item
                      </div>
                      <div className="virtual-item-name" />
                    </div>
                  </div>
                </a>
              </div>
            </div>
            <div className="event-container flex-column hide">
              <div className="event-section">
                <div className="event-infobox">
                  <div className="item-image-container item-image">
                    <div className="background-image bakugan-event-icon" />
                  </div>
                  <div className="event-desc lang-bakuganevent1">
                    Get the Genesis Dragonoid bonus item and unlock all ten Bakugan in the Bakugan
                    Battle League experience on Roblox.*
                  </div>
                </div>
              </div>
              <div className="event-section hide">
                <div className="event-infobox">
                  <div className="item-image-container item-image">
                    <div className="background-image bakugan-card-icon" />
                  </div>
                  <div className="event-desc lang-bakuganevent5">
                    Get the Genesis Dragonoid bonus item and unlock all ten Bakugan in the Bakugan
                    Battle League experience on Roblox.*
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section giftcard-carousel-section light">
        <div className="container cards-container">
          <h2 className="lang-cards-title">Surprise a Roblox fan today</h2>
          <div className="online-desc section-desc line-space-under narrow">
            <span className="giftcards-copy lang-cards-desc">
              Choose from dozens of eGift card designs based on your favorite experiences,
              characters, and more.
            </span>
          </div>
          <div className="linear-carousel-container flex-row vcenter">
            <div className="arrow-container-giftcards left">
              <div className="arrow-left background-image" />
            </div>
            <div className="linear-carousel giftcard-carousel flex-grid">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="giftcard-logo-container linear-carousel-item carousel-item">
                  <div className="card-logo image-container">
                    <div className="card-logo background-image" />
                  </div>
                </div>
              ))}
            </div>
            <div className="arrow-container-giftcards right">
              <div className="arrow-right background-image" />
            </div>
          </div>
          <div className="section-button main-button button-container">
            <a
              target="_blank"
              className="main-btn lang-mainbutton link-mainbutton"
              href="https://www.roblox.com/"
              rel="noreferrer"
            >
              Shop Gift Cards
            </a>
          </div>
          <div className="text-note align-center giftcards-b2b-note hide">
            <div className="section-desc">
              <a
                className="link-giftcardsb2b lang-b2bshop"
                href="https://www.roblox.com/giftcards-B2Bcountryselector"
              >
                Shop Roblox Gift Cards for Business
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="section light giftcard-party-pack hide">
        <div className="container">
          <h2 className="party-pack-title">It&#39;s never been more fun to give Robux</h2>
          <div className="centered-section align-center">
            <div className="text-container">
              <div className="online-desc section-desc">Introducing the Roblox Party Pack</div>
            </div>
          </div>

          <div className="centered-section row-column">
            <div className="left-section">
              <div className="section-desc narrow align-left">
                <ul className="party-pack-list">
                  <li>The Roblox Party Pack is a flexible new way to give the gift of Robux.</li>
                  <li>Includes 25 individual cards to share, each loaded with 200 Robux.</li>
                  <li>Perfect for holidays, birthdays, or any celebration.</li>
                </ul>
              </div>
              <div className="section-button main-button button-container party-pack-buttons">
                <a
                  target="_blank"
                  className="main-btn"
                  href="https://www.amazon.com/Roblox-Party-Multipack-Cards-Robux/dp/B0FR9QRK67?ref_=ast_sto_dp"
                  rel="noreferrer"
                >
                  Shop at Amazon
                </a>
                <a
                  target="_blank"
                  className="main-btn"
                  href="https://www.target.com/p/-/A-94910778"
                  rel="noreferrer"
                >
                  Shop at Target
                </a>
              </div>
            </div>
            <div className="right-section">
              <div className="background-image party-pack" />
            </div>
          </div>
        </div>
      </div>

      <div className="section dark giftcards-b2b hide">
        <div className="container">
          <h2 className="lang-b2bgiftcards">Roblox Gift Cards for Business</h2>
          <div className="centered-section row-column">
            <div className="left-section">
              <div className="background-image giftcard-stack" />
            </div>
            <div className="right-section">
              <div className="section-desc narrow align-left">
                <div className="lang-b2bdesc">
                  There&#39;s an easy way to order Roblox Gift Cards in bulk! Celebrate wins,
                  increase motivation, and show appreciation with Roblox Gift Cards.
                </div>
              </div>
              <div className="section-button main-button button-container">
                <a
                  target="_blank"
                  className="main-btn link-giftcardsb2b lang-b2border"
                  href="https://www.roblox.com/giftcards-B2Bcountryselector"
                  rel="noreferrer"
                >
                  Order Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section dark">
        <div className="container retailer-info row-column">
          <div className="centered-section align-center">
            <div className="text-container narrow">
              <div className="online-desc section-desc lang-retailers">
                Roblox Gift Cards are also{" "}
                <a className="link-retailers">available at a retailer near you.</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="header-box flex-row">
        <div className="location-picker">
          <div className="flex-row">
            <div className="location-left flex-row">
              <div className="location-icon-container image-container">
                <div className="background-image globe-icon" />
              </div>
              <div className="location-label lang-location">Location</div>
            </div>
            <div className="location-right flex-row">
              <div className="down-arrow" />
            </div>
            <select className="invisible-select">
              <option value="us" className="lang-region-us">
                USA
              </option>
              <option value="ca" className="lang-region-ca">
                Canada
              </option>
              <option value="au" className="lang-region-au">
                Australia
              </option>
              <option value="uk" className="lang-region-uk">
                UK
              </option>
              <option value="fr" className="lang-region-fr">
                France
              </option>
              <option value="de" className="lang-region-de">
                Germany
              </option>
              <option value="es" className="lang-region-es">
                Spain
              </option>
              <option value="nz" className="lang-region-nz">
                New Zealand
              </option>
              <option value="ie" className="lang-region-ie">
                Republic of Ireland
              </option>
              <option value="it" className="lang-region-it">
                Italy
              </option>
              <option value="ch" className="lang-region-ch">
                Switzerland
              </option>
              <option value="nl" className="lang-region-nl">
                Netherlands
              </option>
              <option value="be" className="lang-region-be">
                Belgium
              </option>
              <option value="jp" className="lang-region-jp">
                Japan
              </option>
              <option value="mx" className="lang-region-mx">
                Mexico
              </option>
              <option value="br" className="lang-region-br">
                Brazil
              </option>
              <option value="at" className="lang-region-at">
                Austria
              </option>
              <option value="dk" className="lang-region-dk">
                Denmark
              </option>
              <option value="fi" className="lang-region-fi">
                Finland
              </option>
              <option value="no" className="lang-region-no">
                Norway
              </option>
              <option value="pt" className="lang-region-pt">
                Portugal
              </option>
              <option value="se" className="lang-region-se">
                Sweden
              </option>
              <option value="gr" className="lang-region-gr">
                Greece
              </option>
              <option value="lv" className="lang-region-lv">
                Latvia
              </option>
              <option value="pl" className="lang-region-pl">
                Poland
              </option>
              <option value="ro" className="lang-region-ro">
                Romania
              </option>
              <option value="my" className="lang-region-my">
                Malaysia
              </option>
              <option value="sg" className="lang-region-sg">
                Singapore
              </option>
              <option value="th" className="lang-region-th">
                Thailand
              </option>
              <option value="za" className="lang-region-za">
                South Africa
              </option>
              <option value="sk" className="lang-region-sk">
                Slovakia
              </option>
              <option value="sl" className="lang-region-sl">
                Slovenia
              </option>
              <option value="cy" className="lang-region-cy">
                Cyprus
              </option>
              <option value="hu" className="lang-region-hu">
                Hungary
              </option>
              <option value="ae" className="lang-region-ae">
                UAE
              </option>
              <option value="sa" className="lang-region-sa">
                Saudi Arabia
              </option>
              <option value="ko" className="lang-region-ko">
                Korea
              </option>
            </select>
          </div>
        </div>
        <div className="section-button main-button button-container redeem-button">
          <a
            target="_blank"
            className="main-btn lang-redeem link-redeem"
            href="https://www.roblox.com/"
            rel="noreferrer"
          >
            Redeem Card
          </a>
        </div>
      </div>

      <div className="section dark">
        <div id="footer-text" className="row-column">
          <div className="copyright-text lang-copyright">
            &copy; {new Date().getFullYear()} Roblox Corporation. All Rights Reserved.
          </div>
          <div className="legal-stuff flex-row">
            <div className="terms-of-service">
              <a
                target="_blank"
                href="https://www.roblox.com/info/terms"
                className="lang-terms"
                rel="noreferrer"
              >
                Terms
              </a>
            </div>
            <div className="privacy-poilcy dotsep">
              <a
                target="_blank"
                href="https://www.roblox.com/info/privacy"
                className="lang-privacy"
                rel="noreferrer"
              >
                Privacy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="section3" style={{ position: "absolute", top: "0px", width: "100%" }} />
    <div id="section4" style={{ position: "absolute", top: "0px", width: "100%" }} />
    <div id="section5" style={{ position: "absolute", top: "0px", width: "100%" }} />
  </>
);

export default App;
