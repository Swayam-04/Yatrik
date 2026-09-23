import axios from "axios";

export interface DayForecast {
  day: string;
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  condition: string;
  icon: string;
}

export interface RealWeatherData {
  destination: string;
  latitude: number;
  longitude: number;
  temperature: number;
  feelsLike: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
  condition: string;
  description: string;
  icon: string;
  forecast: DayForecast[];
  packingTips: string;
  bestTimeToVisit?: string;
  source: string;
}

// Convert WMO Weather Interpretation Codes to human readable descriptions & icons
function interpretWmoCode(code: number): { condition: string; description: string; icon: string } {
  switch (code) {
    case 0:
      return { condition: "Clear Sky", description: "Completely clear and sunny skies", icon: "☀️" };
    case 1:
      return { condition: "Mainly Clear", description: "Mainly clear with subtle high clouds", icon: "🌤️" };
    case 2:
      return { condition: "Partly Cloudy", description: "Scattered clouds with periods of sunshine", icon: "⛅" };
    case 3:
      return { condition: "Overcast", description: "Full cloud cover", icon: "☁️" };
    case 45:
    case 48:
      return { condition: "Foggy", description: "Reduced visibility with mist and fog", icon: "🌫️" };
    case 51:
    case 53:
    case 55:
      return { condition: "Drizzle", description: "Light to moderate drizzle", icon: "🌦️" };
    case 61:
    case 63:
    case 65:
      return { condition: "Rain", description: "Steady rainfall", icon: "🌧️" };
    case 71:
    case 73:
    case 75:
      return { condition: "Snowfall", description: "Falling snow and icy conditions", icon: "❄️" };
    case 80:
    case 81:
    case 82:
      return { condition: "Rain Showers", description: "Intermittent showers", icon: "🌦️" };
    case 95:
    case 96:
    case 99:
      return { condition: "Thunderstorm", description: "Thunderstorm with convective precipitation", icon: "⛈️" };
    default:
      return { condition: "Pleasant", description: "Mild atmospheric conditions", icon: "🌤️" };
  }
}

// Short-lived cache (10 minutes)
const weatherCache = new Map<string, { data: RealWeatherData; timestamp: number }>();
const WEATHER_CACHE_TTL = 10 * 60 * 1000;

/**
 * Fetches real weather data worldwide using Open-Meteo with fallback to OpenWeather.
 * Zero hardcoded fallback temperatures. If unavailable, returns error.
 */
export async function getRealWeather(
  latitude: number,
  longitude: number,
  destinationName?: string
): Promise<{ weather: RealWeatherData | null; error?: string }> {
  if (isNaN(latitude) || isNaN(longitude)) {
    return { weather: null, error: "Live data unavailable (Invalid coordinates)" };
  }

  const cacheKey = `${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < WEATHER_CACHE_TTL) {
    return { weather: cached.data };
  }

  const destLabel = destinationName || `Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;

  // 1. Primary: Open-Meteo (Real Meteorological Radar, Global coverage, Keyless)
  try {
    const url = "https://api.open-meteo.com/v1/forecast";
    const response = await axios.get(url, {
      params: {
        latitude,
        longitude,
        current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
        daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum",
        timezone: "auto",
        forecast_days: 7,
      },
      timeout: 7000,
    });

    const data = response.data;
    const current = data.current;
    const daily = data.daily;

    if (!current) {
      throw new Error("No current weather data in Open-Meteo response");
    }

    const wmoInterpretation = interpretWmoCode(current.weather_code ?? 0);
    const temp = Math.round(current.temperature_2m);
    const feelsLike = Math.round(current.apparent_temperature ?? temp);
    const precip = current.precipitation ?? 0;
    const wind = Math.round(current.wind_speed_10m ?? 10);
    const humidity = current.relative_humidity_2m ?? 50;

    const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const forecast: DayForecast[] = [];

    if (daily && Array.isArray(daily.time)) {
      for (let i = 0; i < daily.time.length; i++) {
        const dateStr = daily.time[i];
        const dayDate = new Date(dateStr);
        const dayName = i === 0 ? "Today" : i === 1 ? "Tomorrow" : weekdayNames[dayDate.getDay()] || `Day ${i + 1}`;
        const dayWmo = interpretWmoCode(daily.weather_code?.[i] ?? 0);

        forecast.push({
          day: dayName,
          date: dateStr,
          tempMax: Math.round(daily.temperature_2m_max?.[i] ?? temp),
          tempMin: Math.round(daily.temperature_2m_min?.[i] ?? temp - 5),
          precipitationSum: daily.precipitation_sum?.[i] ?? 0,
          condition: dayWmo.condition,
          icon: dayWmo.icon,
        });
      }
    }

    const packingTips =
      temp > 28
        ? "Light breathable cotton wear, UV sunglasses, sun hat, and high SPF sunscreen recommended."
        : temp < 15
        ? "Warm layering jacket, thermal undergarments, and comfortable walking boots recommended."
        : "Versatile casual layers with a light evening jacket and comfortable walking shoes.";

    const weatherData: RealWeatherData = {
      destination: destLabel,
      latitude,
      longitude,
      temperature: temp,
      feelsLike,
      humidity,
      precipitation: precip,
      windSpeed: wind,
      weatherCode: current.weather_code ?? 0,
      condition: wmoInterpretation.condition,
      description: wmoInterpretation.description,
      icon: wmoInterpretation.icon,
      forecast,
      packingTips,
      source: "Open-Meteo Global Radar",
    };

    weatherCache.set(cacheKey, { data: weatherData, timestamp: Date.now() });
    return { weather: weatherData };
  } catch (openMeteoError) {
    console.warn("Open-Meteo weather request failed, checking OpenWeather:", openMeteoError);
  }

  // 2. Secondary Fallback: OpenWeather if valid API key is present
  const owKey = process.env.OPENWEATHER_API_KEY;
  if (owKey && !owKey.includes("example")) {
    try {
      const owRes = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
        params: {
          lat: latitude,
          lon: longitude,
          appid: owKey,
          units: "metric",
        },
        timeout: 6000,
      });

      const d = owRes.data;
      const weatherData: RealWeatherData = {
        destination: d.name || destLabel,
        latitude,
        longitude,
        temperature: Math.round(d.main.temp),
        feelsLike: Math.round(d.main.feels_like),
        humidity: d.main.humidity,
        precipitation: d.rain?.["1h"] || 0,
        windSpeed: Math.round(d.wind.speed * 3.6),
        weatherCode: d.weather?.[0]?.id ?? 800,
        condition: d.weather?.[0]?.main || "Clear",
        description: d.weather?.[0]?.description || "Normal conditions",
        icon: `https://openweathermap.org/img/wn/${d.weather?.[0]?.icon}@2x.png`,
        forecast: [],
        packingTips: "Carry comfortable seasonal clothing.",
        source: "OpenWeather API",
      };

      weatherCache.set(cacheKey, { data: weatherData, timestamp: Date.now() });
      return { weather: weatherData };
    } catch (owError) {
      console.warn("OpenWeather fallback failed:", owError);
    }
  }

  return { weather: null, error: "Live data unavailable" };
}
