import { homePageUpsellCardService } from "@rbx/discovery-common";
import "./src/homePageUpsellCard.scss";
import "./src/main.css";

// TODO: This is not used except in HomePageUpsellCardContainer, should probably be removed
// Expose service to internal apps
(window.Roblox as Record<string, unknown>).HomePageUpsellCardService = homePageUpsellCardService;
