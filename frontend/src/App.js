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

  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

  // ✅ Fetch current weather
  const getWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setError("");
    setLoading(true);
    setWeather(null);
    setForecast(null);

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      if (!res.ok) throw new Error("City not found");
      const data = await res.json();
      setWeather(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch 5-day forecast
  const getForecast = async (cityName) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      if (!res.ok) throw new Error("Forecast not found");
      const data = await res.json();

      const grouped = {};
      data.list.forEach((e) => {
        const date = e.dt_txt.split(" ")[0];
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(e);
      });

      const daily = Object.keys(grouped).map((d) => {
        const temps = grouped[d].map((e) => e.main.temp);
        const avg = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
        const sample = grouped[d][Math.floor(grouped[d].length / 2)];
        const icon = sample.weather[0].icon;
        const desc = sample.weather[0].description;
        return { date: d, avgTemp: avg, icon, desc };
      });

      setForecast(daily.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Geolocation weather
  const getCurrentLocationWeather = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);
    setForecast(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );
          if (!res.ok) throw new Error("Location weather not found.");
          const data = await res.json();
          setWeather(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
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
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={getWeather}>Get Weather</button>
        <button onClick={getCurrentLocationWeather}>Use My Location</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {weather && <WeatherCard data={weather} />}

      {/* ✅ Forecast toggle */}
      {weather && (
        <div className="forecast-toggle">
          <label>
            <input
              type="checkbox"
              checked={!!forecast}
              onChange={(e) =>
                e.target.checked ? getForecast(city || weather.name) : setForecast(null)
              }
            />
          <span>Show 5-Day Forecast</span>
          </label>
        </div>
      )}

      {/* ✅ Forecast cards */}
      {forecast && (
        <div className="forecast">
          <h3>5-Day Forecast</h3>
          <div className="forecast-cards">
            {forecast.map((d) => (
              <div key={d.date} className="forecast-card">
                <p className="forecast-date">{d.date}</p>
                <img
                  src={`https://openweathermap.org/img/wn/${d.icon}@2x.png`}
                  alt={d.desc}
                />
                <p className="forecast-temp">{d.avgTemp} °C</p>
                <p className="forecast-desc">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ Footer */}
      <footer className="footer">
        <p>Developed by <strong>Divija Morishetty</strong></p>
        <button onClick={() => setShowInfo(true)}>ℹ️ Info</button>
      </footer>

      {/* ✅ Info Modal */}
      {showInfo && (
        <div className="info-modal">
          <div className="info-content">
            <h2>About PM Accelerator</h2>
            <p>
              PM Accelerator is a professional development platform that helps aspiring and
              early-career professionals build real-world product management skills through mentorship,
              hands-on projects, and community collaboration.
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