import { CurrentUser } from "Roblox";

/**
 * Parses user ID from the current URL.
 * @returns {number|null} user ID.
 */
export const getUserIdFromUrl = () => {
    if (window?.location?.pathname.includes('users/inventory')) {
        return Number(CurrentUser.userId);
    }

    const reg = /\/users\/(\d+)\//g;
    const match = reg.exec(window?.location?.pathname);
    return match ? parseInt(match[1], 10) : null;
};