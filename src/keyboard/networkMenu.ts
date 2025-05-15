import { BACK_TO_MAIN_TEXT } from "./backToMenu.js";

export const PING_MENU_TEXT = '📶 Ping';
export const IPINFO_MENU_TEXT = '📟 IpInfo';
export const WHOIS_MENU_TEXT = '🎯 Who is';
export const TRACEROUTE_MENU_TEXT = '🗺️ Traceroute';
export const SPEEDTEST_MENU_TEXT = '🏎️💨 Speedtest';

export const networkMenuKeyboard = {
  keyboard: [
    [
      { text: PING_MENU_TEXT },
      { text: IPINFO_MENU_TEXT },
    ],
    [
      { text: WHOIS_MENU_TEXT },
      { text: TRACEROUTE_MENU_TEXT },
    ],
    [
      { text: SPEEDTEST_MENU_TEXT },
      { text: BACK_TO_MAIN_TEXT },
    ],
  ],
  resize_keyboard: true,
  one_time_keyboard: false,
};
