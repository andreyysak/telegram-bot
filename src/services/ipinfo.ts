import { IpInfoResponse } from "../types/IpInfoResponse.js";

export const IP_EMOJI = '🌐';
export const HOSTNAME_EMOJI = '🖥️';
export const CITY_EMOJI = '🏙️';
export const REGION_EMOJI = '📍';
export const COUNTRY_EMOJI = '🌍';
export const ORG_EMOJI = '🏢';
export const TIMEZONE_EMOJI = '🕒';

const token = process.env.IPINFO_API_TOKEN;

if (!token) throw new Error('IpInfo API token was not found.');

async function fetchIpInfo(ip: string): Promise<IpInfoResponse> {
  const ipAddress = ip.replace(',', '.');
  const url = `https://ipinfo.io/${ipAddress}?token=${token}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ipinfo data: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    if (err instanceof Error) {
      console.error('Error fetching ipinfo data:', err.message);
      throw err;
    } else {
      console.error('Unknown error fetching ipinfo data:', err);
      throw new Error('Unknown error occurred while fetching ipinfo data.');
    }
  }
}

export function getIpData(ip: string) {
  return fetchIpInfo(ip)
    .then(data => [
      { label: `${IP_EMOJI} IP:`, value: data.ip },
      { label: `${HOSTNAME_EMOJI} Host:`, value: data.hostname },
      { label: `${CITY_EMOJI} Місто:`, value: data.city },
      { label: `${REGION_EMOJI} Регіон:`, value: data.region },
      { label: `${COUNTRY_EMOJI} Країна:`, value: data.country },
      { label: `${ORG_EMOJI} Організація:`, value: data.org },
      { label: `${TIMEZONE_EMOJI} Часовий пояс:`, value: data.timezone }
    ]);
}
