import React, { useState } from "react";
import "./App.css";
import WeatherCard from "./components/WeatherCard";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  // ✅ Weathercode → readable text
  const codeMap = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    71: "Snow fall",
    80: "Rain showers",
    95: "Thunderstorm",
  };

  // ✅ Flexible location input: City / Zip / Landmark / Coordinates
  const getWeather = async () => {
    if (!city.trim()) {
      setError(
        "Please enter a location (City, Zip, Landmark, or Coordinates)."
      );
      return;
    }

    setError("");
    setLoading(true);
    setWeather(null);
    setForecast(null);

    try {
      let lat, lon, name = city;

      // 1️⃣ Detect coordinate input (e.g., "40.71,-74.00")
      if (city.includes(",")) {
        const parts = city.split(",").map((x) => x.trim());
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          lat = parts[0];
          lon = parts[1];
        } else {
          throw new Error("Invalid coordinate format. Use: 40.71, -74.00");
        }
      } else {
        // 2️⃣ Otherwise, use Nominatim for City/Zip/Landmark
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            city
          )}&format=json&limit=1`
        );
        const geoData = await geoRes.json();
        if (geoData.length === 0) throw new Error("Location not found.");
        lat = geoData[0].lat;
        lon = geoData[0].lon;
        name = geoData[0].display_name.split(",")[0];
      }

      // 3️⃣ Fetch current weather & forecast
      await fetchWeather(lat, lon, name);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch current weather & forecast (Open-Meteo)
  const fetchWeather = async (lat, lon, name = "Your Location") => {
    try {
      // Current weather
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );
      const data = await res.json();

      setWeather({
        name,
        temp: data.current_weather.temperature,
        wind: data.current_weather.windspeed,
        desc: codeMap[data.current_weather.weathercode] || "Unknown",
        lat,
        lon,
      });

      // 5-day forecast
      getForecast(lat, lon);
    } catch (err) {
      setError("Unable to fetch weather data.");
    }
  };

  // ✅ 5-day forecast
  const getForecast = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&forecast_days=5&timezone=auto`
      );
      const data = await res.json();

      const days = data.daily.time.map((date, i) => ({
        date,
        avgTemp: (
          (data.daily.temperature_2m_max[i] + data.daily.temperature_2m_min[i]) /
          2
        ).toFixed(1),
        desc: codeMap[data.daily.weathercode[i]] || "Unknown",
      }));

      setForecast(days);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Use current location (GPS)
  const getCurrentLocationWeather = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);
    setForecast(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await fetchWeather(latitude, longitude, "Your Location");
        setLoading(false);
      },
      () => {
        setError("Unable to get your location.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="app-container">
      <h1>🌦 Weather App</h1>

      <div className="input-section">
        <input
          type="text"
          placeholder="Enter city, zip, landmark, or coordinates (e.g., 40.71,-74.00)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={getWeather}>Get Weather</button>
        <button onClick={getCurrentLocationWeather}>Use My Location</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {weather && <WeatherCard data={weather} />}

      {weather && (
        <div className="forecast-toggle">
          <input
            type="checkbox"
            checked={!!forecast}
            onChange={(e) =>
              e.target.checked
                ? getForecast(weather.lat, weather.lon)
                : setForecast(null)
            }
          />
          <span>Show 5-Day Forecast</span>
        </div>
      )}

      {forecast && (
        <div className="forecast">
          <h3>5-Day Forecast</h3>
          <div className="forecast-cards">
            {forecast.map((d) => (
              <div key={d.date} className="forecast-card">
                <p className="forecast-date">{d.date}</p>
                <p className="forecast-temp">{d.avgTemp} °C</p>
                <p className="forecast-desc">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="footer">
        <p>
          Developed by <strong>Divija Morishetty</strong>
        </p>
        <button onClick={() => setShowInfo(true)}>ℹ️ Info</button>
      </footer>

      {showInfo && (
        <div className="info-modal">
          <div className="info-content">
            <h2>About PM Accelerator</h2>
            <p>
              PM Accelerator is a professional development platform that helps
              aspiring and early-career professionals build real-world product-management
              skills through mentorship, hands-on projects, and community collaboration.
            </p>
            <p>
              Learn more on their{" "}
              <a
                href="https://www.linkedin.com/company/product-manager-accelerator/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn page
              </a>.
            </p>
            <button onClick={() => setShowInfo(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;