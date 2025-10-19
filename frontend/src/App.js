import React, { useState, useEffect } from "react";
import axios from "axios";
// import jsPDF from "jspdf";
import "jspdf-autotable";
import "./App.css";
import WeatherCard from "./components/WeatherCard";
import CreateTab from "./components/tabs/CreateTab";
import ReadTab from './components/tabs/ReadTab';
import UpdateTab from './components/tabs/UpdateTab'
import DeleteTab from './components/tabs/DeleteTab'
import IntegrationTab from './components/tabs/IntegrationTab';
import ExportTab from './components/tabs/ExportTab';

function App() {
  const [city, setCity] = useState("");
  const [city2, setCity2] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [showForecast, setShowForecast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [tab, setTab] = useState("create");
  const [weatherRecords, setWeatherRecords] = useState([]);

  // task-2 fields
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [savedWeather, setSavedWeather] = useState(null);
 
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

  const getWeather = async () => {
    if (!city.trim()) return setError("Please enter a location.");

    setError("");
    setLoading(true);
    setWeather(null);
    setForecast(null);
    setShowForecast(false);

    try {
      let lat, lon, name;

      const input = city.trim();
      const parts = input.split(",").map((p) => p.trim());

      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        // Coordinates input: "lat,lon"
        lat = parts[0];
        lon = parts[1];

        // Reverse geocode to get name
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        );
        const geoData = await geoRes.json();
        name =
          geoData.address.city ||
          geoData.address.town ||
          geoData.address.village ||
          geoData.display_name ||
          "Your Coordinates";
        name = name + "\n(" + lat + ", " + lon + ")";
      } else {
        // Free text (zip, city, landmark)
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1&addressdetails=1`
        );
        const geoData = await geoRes.json();
        if (!geoData.length) throw new Error("Location not found.");
        lat = geoData[0].lat;
        lon = geoData[0].lon;
        const address = geoData[0].address || {};
        name =
          address.city ||
          address.town ||
          address.village ||
          address.hamlet ||
          geoData[0].display_name.split(",")[0];
      }

      await fetchWeather(lat, lon, name);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (lat, lon, name = "Location") => {
    try {
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
    } catch {
      setError("Unable to fetch weather data.");
    }
  };

  const getForecast = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&forecast_days=5&timezone=auto`
      );
      const data = await res.json();
      const days = data.daily.time.map((d, i) => ({
        date: d,
        avgTemp: (
          (data.daily.temperature_2m_max[i] +
            data.daily.temperature_2m_min[i]) /
          2
        ).toFixed(1),
        desc: codeMap[data.daily.weathercode[i]] || "Unknown",
      }));
      setForecast(days);
    } catch (e) {
      console.error(e);
    }
  };

  const handleForecastToggle = (checked) => {
    setShowForecast(checked);
    if (checked && weather) {
      getForecast(weather.lat, weather.lon);
    } else {
      setForecast(null);
    }
  };

  const handleSaveWeather = async () => {
    if (!city2 || !startDate || !endDate) {
        return alert("Please fill all fields: Location, Start Date, and End Date.");
    }

    if (new Date(startDate) > new Date(endDate)) {
      return alert("Start Date cannot be later than End Date.");
    }

    setLoading(true);
    setError("");
    setSavedWeather(null);

    try {
      const data = {
        location: city2,
        startDate,
        endDate,
      };

      const response = await axios.post('http://localhost:5001/api/weather', data, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      setLoading(false);

      if (response.status === 201 && response.data && response.data.data) {
        setSavedWeather(response.data.data); // <-- Save the returned list
        alert("Weather data saved successfully");
      } else {
        setError(response.data.message || "Error saving data");
      }
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || "Failed to save weather data");
      setSavedWeather(null);
      console.error("❌ Error in saving weather:", error.response?.data || error.message);
    }
  };

  const getCurrentLocationWeather = () => {
    if (!navigator.geolocation) return setError("Geolocation not supported.");
    setLoading(true);
    setError("");
    setWeather(null);
    setForecast(null);
    setShowForecast(false);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // await fetchWeather(latitude,longitude,"Your Location");
        // Reverse geocoding using OpenStreetMap's Nominatim
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const geoData = await geoRes.json();
          const locationName =
            geoData.address.city ||
            geoData.address.town ||
            geoData.address.village ||
            "Your Location";

          await fetchWeather(latitude, longitude, locationName);
        } catch (e) {
          await fetchWeather(latitude, longitude, "Your Location");
        }

        setLoading(false);
      },
      () => {
        setError("Unable to get your location.");
        setLoading(false);
      }
    );
  };

useEffect(() => {
  const fetchDataIfMissing = async () => {
    if (tab === "export" && (!weatherRecords || weatherRecords.length === 0)) {
      try {
        const response = await fetch("/api/weather");
        if (!response.ok) throw new Error("Failed to fetch weather data");
        const data = await response.json();
        setWeatherRecords(data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    }
  };

  fetchDataIfMissing();
}, [tab, weatherRecords]);

const fetchWeatherData = async () => {
  try {
    const res = await fetch("http://localhost:5001/api/weather");
    const data = await res.json();
    if (res.ok) {
      setWeatherRecords(data);
    } else {
      alert("Error fetching data: " + data.message);
    }
  } catch (err) {
    alert("Network error while fetching weather data");
    console.error(err);
  }
};
const fetchWeatherRecords = async () => {
  try {
    const response = await fetch("/api/weather");
    const data = await response.json();
    setWeatherRecords(data);
  } catch (error) {
    console.error("Failed to fetch weather records:", error);
  }
};

return (
    <div className="app-container">
      <h1>🌦 Weather App</h1>

      <div className="input-section">
        <input
          type="text"
          placeholder="Enter city, ZIP, landmark, or GPS (lat,lon)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="location-input"
        />
        {/* <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} /> */}
        <button onClick={getWeather}>Get Weather</button>
        <button onClick={getCurrentLocationWeather}>📍 Use My Location</button>
        {/* <button className="save-btn" onClick={handleSaveWeather}>💾 Save to Database</button> */}
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {weather && <WeatherCard data={weather} />}

      {weather && (
        <div className="forecast-toggle">
          <input
            type="checkbox"
            checked={showForecast}
            onChange={(e) => handleForecastToggle(e.target.checked)}
          />
          <span>Show 5-Day Forecast</span>
        </div>
      )}
      {showForecast && forecast && (
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

      <section className="crud-section">
  <h2>Weather Data Management</h2>
  <div className="tabs">
    <button onClick={() => setTab("create")} className={tab === "create" ? "active-tab" : ""}>CREATE</button>
    <button onClick={() => { setTab("read"); fetchWeatherData(); }} className={tab === "read" ? "active-tab" : ""}>READ</button>
    <button onClick={() => setTab("update")} className={tab === "update" ? "active-tab" : ""}>UPDATE</button>
    <button onClick={() => {setTab("delete");fetchWeatherData(); }}className={tab === "delete" ? "active-tab" : ""}>DELETE</button>
    {/* <button onClick={() => setTab("integrations")} className={tab === "integrations" ? "active-tab" : ""}>INTEGRATIONS</button> */}
    <button onClick={() => setTab("integrations")} className={tab === "integrations" ? "active-tab" : ""}>INTEGRATIONS</button>
    <button onClick={() => setTab("export")} className={tab === "export" ? "active-tab" : ""}>EXPORT</button>
  </div>

  {tab === "create" && (
  <CreateTab
    tab={tab}
    city2={city2}
    setCity2={setCity2}
    startDate={startDate}
    setStartDate={setStartDate}
    endDate={endDate}
    setEndDate={setEndDate}
    handleSaveWeather={handleSaveWeather}
    savedWeather={savedWeather}
  />
)}

 {tab === "read" && (
  <ReadTab
    tab={tab}
    weatherRecords={weatherRecords}
    fetchWeatherRecords={fetchWeatherRecords}
    setTab={setTab}
  />
)}
{tab === "update" && (
  <UpdateTab
    weatherRecords={weatherRecords}
    fetchWeatherRecords={fetchWeatherRecords}
  />
)}
{tab === "delete" && (
  <DeleteTab
    weatherRecords={weatherRecords}
    fetchWeatherRecords={fetchWeatherRecords}
  />
)}

{tab === "integrations" && (
  <IntegrationTab city2={city2} />
)}
{tab === "export" && (
  <ExportTab weatherRecords={weatherRecords} />
)}


</section>

<footer className="footer">
        <p>
          Developed by <strong>Divija Morishetty</strong> · PM Accelerator
        </p>
        <button onClick={() => setShowInfo(true)}>ℹ️ Info</button>
      </footer>

      {showInfo && (
        <div className="info-modal">
          <div className="info-content">
            <h2>About PM Accelerator</h2>
            <p>
              PM Accelerator helps professionals gain real-world
              product-management experience through mentorship and hands-on
              projects.
            </p>
            <a
              href="https://www.linkedin.com/company/product-manager-accelerator/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit LinkedIn ↗
            </a>
            <button onClick={() => setShowInfo(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
