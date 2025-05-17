import { WeatherApiResponse } from "../types/WeatherApiResponse.js";

const API_KEY = process.env.WEATHER_API_KEY;
const CITY = 'Khmelnytskyi';

const EMOJI_WEATHER = '💧';
const EMOJI_TEMP = '🌡️';
const EMOJI_FEELS_LIKE = '☘️';
const EMOJI_TEMP_MAX = '🔼';
const EMOJI_TEMP_MIN = '🔽';
const EMOJI_PRESSURE = '⏲️';
const EMOJI_HUMIDITY = '💦';
const EMOJI_WIND_SPEED = '💨';
const EMOJI_WIND_DIRECTION = '🔀';
const EMOJI_SUNRISE = '🌄';
const EMOJI_SUNSET = '🌅';

if (!API_KEY) throw new Error('Weather API key was not found.');

const url = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric&lang=ua`;

async function fetchWeatherInfo(): Promise<WeatherApiResponse> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch weather data: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    if (err instanceof Error) {
      console.error('Error fetching weather data:', err.message);
      throw err;
    } else {
      console.error('Unknown error fetching weather data:', err);
      throw new Error('Unknown error occurred while fetching weather data.');
    }
  }
}

function getWindDirection(degree: number): string {
  switch (true) {
    case (degree >= 0 && degree < 22.5):
    case (degree >= 337.5 && degree <= 360):
      return 'Північ (N)';
    case (degree >= 22.5 && degree < 67.5):
      return 'Північний-Схід (NE)';
    case (degree >= 67.5 && degree < 112.5):
      return 'Схід (E)';
    case (degree >= 112.5 && degree < 157.5):
      return 'Південний-Схід (SE)';
    case (degree >= 157.5 && degree < 202.5):
      return 'Південь (S)';
    case (degree >= 202.5 && degree < 247.5):
      return 'Південний-Захід (SW)';
    case (degree >= 247.5 && degree < 292.5):
      return 'Захід (W)';
    case (degree >= 292.5 && degree < 337.5):
      return 'Північний-Захід (NW)';
    default:
      return 'Невідомо';
  }
}

function formatUnixTimeToHoursMinutes(unixTimestamp: number, timezoneOffsetHours: number = 3): string {
  const date = new Date((unixTimestamp + timezoneOffsetHours * 3600) * 1000);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function getWeatherEmoji(main: string): string {
  switch (main) {
    case 'Thunderstorm':
      return '⛈️ Гроза';
    case 'Drizzle':
      return '🌦️ Мряка';
    case 'Rain':
      return '🌧️ Дощ';
    case 'Snow':
      return '❄️ Сніг';
    case 'Mist':
      return '🌫️ Туман';
    case 'Smoke':
      return '💨 Дим';
    case 'Haze':
      return '🌫️ Серпанок';
    case 'Dust':
      return '🌪️ Пил';
    case 'Fog':
      return '🌫️ Туман';
    case 'Sand':
      return '🏜️ Піщана буря';
    case 'Ash':
      return '🌋 Вулканічний попіл';
    case 'Squall':
      return '💨 Шквал';
    case 'Tornado':
      return '🌪️ Торнадо';
    case 'Clear':
      return '☀️ Ясно';
    case 'Clouds':
      return '☁️ Хмарно';
    default:
      return '❔ Невідомо';
  }
}

export function getWeatherData() {
  return fetchWeatherInfo()
    .then(data => {
      const weather = data.weather[0]
      const main = data.main
      const wind = data.wind
      const sys = data.sys

      const icon = getWeatherEmoji(weather.main)
      const windDirection = getWindDirection(wind.deg ?? 0)
      const sunrise = formatUnixTimeToHoursMinutes(sys.sunrise)
      const sunset = formatUnixTimeToHoursMinutes(sys.sunset)

      return [
        { label: `${EMOJI_WEATHER} Погода:`, value: [weather.main, weather.description, icon] },
        { label: `${EMOJI_TEMP} Температура:`, value: `${main.temp} °C` },
        { label: `${EMOJI_FEELS_LIKE} Відчувається як:`, value: `${main.feels_like} °C` },
        { label: `${EMOJI_TEMP_MAX} Максимальна температура:`, value: `${main.temp_max} °C` },
        { label: `${EMOJI_TEMP_MIN} Мінімальна температура:`, value: `${main.temp_min} °C` },
        { label: `${EMOJI_PRESSURE} Тиск:`, value: `${main.pressure} мм` },
        { label: `${EMOJI_HUMIDITY} Вологість:`, value: `${main.humidity} %` },
        { label: `${EMOJI_WIND_SPEED} Швидкість вітру:`, value: `${wind.speed} м/с` },
        { label: `${EMOJI_WIND_DIRECTION} Напрямок вітру:`, value: `${windDirection}` },
        { label: `${EMOJI_SUNRISE} Світанок:`, value: sunrise },
        { label: `${EMOJI_SUNSET} Захід сонця:`, value: sunset },
      ];
    })
}